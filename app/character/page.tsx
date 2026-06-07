"use client";

import { useState, useMemo, useRef } from "react";
import { PageHeader } from "@/src/components/PageHeader";
import { CharacterSheet } from "@/src/components/CharacterSheet";
import { useCharacterStore } from "@/src/store/character";
import { callClaudeJSON, resizeImage } from "@/src/lib/ai/client";
import {
  type Character, type AttrKey,
  makeBlankCharacter,
  getRaces, getClasses, getSubraces, getSubclasses,
  roll4d6DropLowest, pointBuyTotal,
  ATTR_KEYS, ATTR_NAMES, SKILLS, ALIGNMENTS,
  STANDARD_ARRAY, POINT_BUY_BUDGET, POINT_BUY_MAX,
  RACE_ICONS, CLASS_ICONS, BACKGROUNDS,
} from "@/src/lib/character";

const AI_SYSTEM = `Eres un experto en D&D 5e. Generas personajes jugables completos en español.
Responde ÚNICAMENTE con un objeto JSON válido:
{
  "name":"nombre","alignment":"alineamiento",
  "race":"raza","subrace":"subraza o null",
  "class":"clase","subclass":"subclase o null",
  "level":1,
  "attrs":{"fue":N,"des":N,"con":N,"int":N,"sab":N,"car":N},
  "skills":["habilidad1","habilidad2",...],
  "background":"trasfondo",
  "appearance":"descripción física breve",
  "backstory":"historia en 2-3 frases"
}
Usa solo razas y clases del SRD en español.`;

export default function CharacterPage() {
  const saved = useCharacterStore((s) => s.saved);
  const addPc = useCharacterStore((s) => s.add);
  const updatePc = useCharacterStore((s) => s.update);
  const removePc = useCharacterStore((s) => s.remove);

  const [pc, setPc] = useState<Character>(makeBlankCharacter);
  const [aiDesc, setAiDesc] = useState("");
  const [aiLevel, setAiLevel] = useState(5);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const races = useMemo(() => getRaces(), []);
  const classes = useMemo(() => getClasses(), []);
  const subraces = useMemo(() => pc.race ? getSubraces(pc.race) : [], [pc.race]);
  const subclasses = useMemo(() => pc.class ? getSubclasses(pc.class) : [], [pc.class]);

  const set = <K extends keyof Character>(key: K, value: Character[K]) =>
    setPc((prev) => ({ ...prev, [key]: value }));

  const setAttr = (key: AttrKey, value: number | null) =>
    setPc((prev) => ({ ...prev, attrs: { ...prev.attrs, [key]: value } }));

  const toggleSkill = (skill: string) =>
    setPc((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));

  const handleNew = () => setPc(makeBlankCharacter());

  const handleSave = () => {
    if (!pc.name.trim()) return;
    const existing = saved.find((p) => p.id === pc.id);
    if (existing) {
      updatePc(pc.id, pc);
    } else {
      addPc(pc);
    }
  };

  const handleLoad = (id: string) => {
    const found = saved.find((p) => p.id === id);
    if (found) setPc({ ...found });
  };

  const handleDelete = (id: string) => {
    removePc(id);
    if (pc.id === id) setPc(makeBlankCharacter());
  };

  const handleExport = () => {
    const data = JSON.stringify(pc, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arcanum-pj-${(pc.name || "personaje").replace(/[^a-zA-Z0-9_-]/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed.name) {
          setPc({ ...makeBlankCharacter(), ...parsed, id: "pc-" + Date.now() });
        }
      } catch { /* ignore */ }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleRollAttrs = () => {
    const pool = roll4d6DropLowest();
    setPc((prev) => ({ ...prev, attrPool: pool, attrMethod: "roll" }));
  };

  const handleSetArrayMethod = () => {
    setPc((prev) => ({
      ...prev,
      attrMethod: "array",
      attrs: { fue: null, des: null, con: null, int: null, sab: null, car: null },
      attrPool: [...STANDARD_ARRAY],
    }));
  };

  const handlePointBuyReset = () => {
    setPc((prev) => ({
      ...prev,
      attrMethod: "buy",
      attrs: { fue: 8, des: 8, con: 8, int: 8, sab: 8, car: 8 },
      pbPoints: POINT_BUY_BUDGET,
    }));
  };

  const handlePointBuyChange = (key: AttrKey, delta: number) => {
    setPc((prev) => {
      const current = prev.attrs[key] ?? 8;
      const next = current + delta;
      if (next < 8 || next > POINT_BUY_MAX) return prev;
      const newAttrs = { ...prev.attrs, [key]: next };
      const total = pointBuyTotal(newAttrs);
      if (total > POINT_BUY_BUDGET) return prev;
      return { ...prev, attrs: newAttrs, pbPoints: POINT_BUY_BUDGET - total };
    });
  };

  const assignPoolValue = (key: AttrKey, value: number | null) => {
    setAttr(key, value);
    if (pc.attrPool && value != null) {
      setPc((prev) => {
        const pool = [...(prev.attrPool || [])];
        const idx = pool.indexOf(value);
        if (idx >= 0) pool.splice(idx, 1);
        return { ...prev, attrPool: pool };
      });
    }
  };

  const handleAI = async () => {
    if (!aiDesc.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const { data } = await callClaudeJSON<Partial<Character>>({
        systemPrompt: AI_SYSTEM,
        userPrompt: `Crea un personaje de D&D 5e nivel ${aiLevel}: ${aiDesc}`,
        maxTokens: 2000,
      });
      setPc((prev) => ({
        ...prev,
        name: data.name || prev.name,
        alignment: data.alignment || prev.alignment,
        race: data.race || prev.race,
        subrace: data.subrace || prev.subrace,
        class: data.class || prev.class,
        subclass: data.subclass || prev.subclass,
        level: data.level || aiLevel,
        attrs: data.attrs || prev.attrs,
        skills: Array.isArray(data.skills) ? data.skills : prev.skills,
        background: data.background || prev.background,
        appearance: data.appearance || prev.appearance,
        backstory: data.backstory || prev.backstory,
      }));
      setAiDesc("");
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Error");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIImage = async (file: File) => {
    setAiLoading(true);
    setAiError(null);
    try {
      const image = await resizeImage(file);
      const { data } = await callClaudeJSON<Partial<Character>>({
        systemPrompt: AI_SYSTEM,
        userPrompt: `Crea un personaje de D&D 5e nivel ${aiLevel} inspirado en esta imagen.`,
        maxTokens: 2000,
        image,
      });
      setPc((prev) => ({
        ...prev,
        name: data.name || prev.name,
        race: data.race || prev.race,
        class: data.class || prev.class,
        level: data.level || aiLevel,
        attrs: data.attrs || prev.attrs,
        appearance: data.appearance || prev.appearance,
        backstory: data.backstory || prev.backstory,
      }));
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Error");
    } finally {
      setAiLoading(false);
    }
  };

  const pbUsed = pointBuyTotal(pc.attrs);

  return (
    <div className="page" data-tool="character">
      <PageHeader toolId="character" />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-4">
          {/* Identity */}
          <div className="card flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="label">Nombre</label>
                <input className="field" value={pc.name} onChange={(e) => set("name", e.target.value)} placeholder="Nombre del personaje" />
              </div>
              <div>
                <label className="label">Alineamiento</label>
                <select className="field" value={pc.alignment} onChange={(e) => set("alignment", e.target.value)}>
                  <option value="">—</option>
                  {ALIGNMENTS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Race */}
          <div className="card flex flex-col gap-3">
            <span className="label">Raza</span>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {races.map((r) => (
                <button
                  key={r.name}
                  onClick={() => setPc((prev) => ({ ...prev, race: r.name, subrace: null }))}
                  className={`card !p-2 text-center transition-colors ${
                    pc.race === r.name
                      ? "!border-[var(--acc)] bg-[color-mix(in_srgb,var(--acc)_10%,transparent)]"
                      : "hover:border-[var(--line-bright)]"
                  }`}
                >
                  <div className="text-2xl">{RACE_ICONS[r.name] || "✦"}</div>
                  <div className="text-xs text-ink mt-1">{r.name}</div>
                </button>
              ))}
            </div>
            {subraces.length > 0 && (
              <div>
                <span className="label">Subraza</span>
                <div className="flex flex-wrap gap-2">
                  {subraces.map((sr) => (
                    <button
                      key={sr}
                      onClick={() => set("subrace", sr)}
                      className={`tag cursor-pointer ${pc.subrace === sr ? "!border-[var(--acc)] bg-[color-mix(in_srgb,var(--acc)_15%,transparent)]" : ""}`}
                    >
                      {sr}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Class */}
          <div className="card flex flex-col gap-3">
            <span className="label">Clase</span>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {classes.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setPc((prev) => ({ ...prev, class: c.name, subclass: null, skills: [] }))}
                  className={`card !p-2 text-center transition-colors ${
                    pc.class === c.name
                      ? "!border-[var(--acc)] bg-[color-mix(in_srgb,var(--acc)_10%,transparent)]"
                      : "hover:border-[var(--line-bright)]"
                  }`}
                >
                  <div className="text-2xl">{CLASS_ICONS[c.name] || "☥"}</div>
                  <div className="text-xs text-ink mt-1">{c.name}</div>
                  <div className="text-[10px] text-ink-soft">{c.meta?.split("·")[0]?.trim()}</div>
                </button>
              ))}
            </div>
            {subclasses.length > 0 && (
              <div>
                <span className="label">Subclase / Arquetipo</span>
                <div className="flex flex-wrap gap-2">
                  {subclasses.map((sc) => (
                    <button
                      key={sc}
                      onClick={() => set("subclass", sc)}
                      className={`tag cursor-pointer ${pc.subclass === sc ? "!border-[var(--acc)] bg-[color-mix(in_srgb,var(--acc)_15%,transparent)]" : ""}`}
                    >
                      {sc}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="label">Nivel: {pc.level}</label>
              <input
                type="range"
                min={1}
                max={20}
                value={pc.level}
                onChange={(e) => set("level", parseInt(e.target.value))}
                className="w-full accent-[var(--acc)]"
              />
            </div>
          </div>

          {/* Ability Scores */}
          <div className="card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="label mb-0">Características</span>
              <div className="flex gap-1">
                {(["array", "roll", "buy", "manual"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      if (m === "array") handleSetArrayMethod();
                      else if (m === "roll") handleRollAttrs();
                      else if (m === "buy") handlePointBuyReset();
                      else set("attrMethod", m);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-[var(--font-mono)] uppercase ${
                      pc.attrMethod === m ? "bg-[color-mix(in_srgb,var(--acc)_20%,transparent)] text-ink" : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {m === "array" ? "Array" : m === "roll" ? "4d6" : m === "buy" ? "Compra" : "Manual"}
                  </button>
                ))}
              </div>
            </div>

            {pc.attrMethod === "array" && pc.attrPool && (
              <div className="text-xs text-ink-soft">Pool disponible: [{pc.attrPool.join(", ")}]</div>
            )}
            {pc.attrMethod === "buy" && (
              <div className="text-xs text-ink-soft">Puntos restantes: {POINT_BUY_BUDGET - pbUsed}</div>
            )}

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ATTR_KEYS.map((key) => (
                <div key={key} className="text-center">
                  <div className="font-[var(--font-mono)] text-[10px] text-ink-soft mb-1">{ATTR_NAMES[key]}</div>
                  {pc.attrMethod === "array" ? (
                    <select
                      className="field !min-h-[36px] !py-0 text-center"
                      value={pc.attrs[key] ?? ""}
                      onChange={(e) => assignPoolValue(key, e.target.value ? parseInt(e.target.value) : null)}
                    >
                      <option value="">—</option>
                      {STANDARD_ARRAY.map((v) => (
                        <option key={v} value={v} disabled={pc.attrPool != null && !pc.attrPool.includes(v) && pc.attrs[key] !== v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  ) : pc.attrMethod === "buy" ? (
                    <div className="flex items-center justify-center gap-1">
                      <button className="btn btn-ghost !min-h-[28px] !py-0 !px-2" onClick={() => handlePointBuyChange(key, -1)}>−</button>
                      <span className="font-[var(--font-display)] text-lg text-ink w-6">{pc.attrs[key] ?? 8}</span>
                      <button className="btn btn-ghost !min-h-[28px] !py-0 !px-2" onClick={() => handlePointBuyChange(key, 1)}>+</button>
                    </div>
                  ) : (
                    <input
                      className="field !min-h-[36px] !py-0 text-center"
                      type="number"
                      min={1}
                      max={30}
                      value={pc.attrs[key] ?? ""}
                      onChange={(e) => setAttr(key, e.target.value ? parseInt(e.target.value) : null)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="card flex flex-col gap-2">
            <span className="label">Habilidades</span>
            <div className="flex flex-wrap gap-1.5">
              {SKILLS.map((s) => (
                <button
                  key={s.name}
                  onClick={() => toggleSkill(s.name)}
                  className={`tag cursor-pointer !text-[10px] ${
                    pc.skills.includes(s.name)
                      ? "!border-[var(--acc)] bg-[color-mix(in_srgb,var(--acc)_15%,transparent)]"
                      : "opacity-60"
                  }`}
                >
                  {s.name} ({ATTR_NAMES[s.attr]})
                </button>
              ))}
            </div>
          </div>

          {/* Background */}
          <div className="card flex flex-col gap-3">
            <span className="label">Trasfondo</span>
            <select className="field" value={pc.background} onChange={(e) => set("background", e.target.value)}>
              <option value="">—</option>
              {BACKGROUNDS.map((b) => <option key={b} value={b}>{b}</option>)}
              <option value="Personalizado">Personalizado</option>
            </select>
            {pc.background === "Personalizado" && (
              <input className="field" value={pc.backgroundCustom} onChange={(e) => set("backgroundCustom", e.target.value)} placeholder="Trasfondo personalizado" />
            )}
          </div>

          {/* Description */}
          <div className="card flex flex-col gap-3">
            <span className="label">Descripción</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label !text-[10px]">Edad</label>
                <input className="field" value={pc.age} onChange={(e) => set("age", e.target.value)} placeholder="Edad" />
              </div>
            </div>
            <div>
              <label className="label !text-[10px]">Aspecto</label>
              <textarea className="field min-h-[60px]" value={pc.appearance} onChange={(e) => set("appearance", e.target.value)} placeholder="Descripción física..." />
            </div>
            <div>
              <label className="label !text-[10px]">Historia</label>
              <textarea className="field min-h-[80px]" value={pc.backstory} onChange={(e) => set("backstory", e.target.value)} placeholder="Trasfondo e historia del personaje..." />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={handleSave} disabled={!pc.name.trim()}>Guardar</button>
            <button className="btn btn-ghost" onClick={handleNew}>Nuevo</button>
            <button className="btn btn-ghost" onClick={handleExport}>Exportar</button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>Importar</button>
          </div>

          {/* AI */}
          <div className="card flex flex-col gap-3">
            <span className="label">Generación con IA</span>
            <div className="grid grid-cols-[1fr_auto_auto] gap-2">
              <input className="field" placeholder="Describe tu personaje..." value={aiDesc} onChange={(e) => setAiDesc(e.target.value)} />
              <select className="field !w-20" value={aiLevel} onChange={(e) => setAiLevel(parseInt(e.target.value))}>
                {[1, 3, 5, 10, 15, 20].map((l) => <option key={l} value={l}>N{l}</option>)}
              </select>
              <button className="btn btn-acc" onClick={handleAI} disabled={aiLoading}>{aiLoading ? "..." : "IA"}</button>
            </div>
            <label className="btn btn-ghost !text-[11px] !min-h-[32px] !py-0 cursor-pointer w-fit">
              IA desde imagen
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAIImage(f); e.target.value = ""; }} />
            </label>
            {aiError && <p className="text-sm" style={{ color: "var(--blood)" }}>{aiError}</p>}
          </div>
        </div>

        {/* Right panel: sheet preview + saved */}
        <div className="flex flex-col gap-4">
          <div className="card sticky top-4">
            <CharacterSheet pc={pc} />
          </div>

          {saved.length > 0 && (
            <div>
              <h3 className="font-[var(--font-mono)] text-[11px] tracking-[0.3em] uppercase text-ink-soft mb-2">
                Guardados ({saved.length})
              </h3>
              <div className="flex flex-col gap-1.5">
                {saved.map((p) => (
                  <div key={p.id} className="card !p-2 flex items-center gap-2">
                    <button className="text-left flex-1 min-w-0" onClick={() => handleLoad(p.id)}>
                      <div className="text-ink truncate text-sm font-[var(--font-title)]">{p.name}</div>
                      <div className="text-[11px] text-ink-soft truncate">
                        {p.race} {p.class} N{p.level}
                      </div>
                    </button>
                    <button className="text-ink-soft hover:text-[var(--blood)] px-1" onClick={() => handleDelete(p.id)}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
