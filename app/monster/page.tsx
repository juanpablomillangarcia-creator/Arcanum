"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { PageHeader } from "@/src/components/PageHeader";
import { StatBlock } from "@/src/components/StatBlock";
import { CreatureEditor } from "@/src/components/CreatureEditor";
import { useBestiaryStore } from "@/src/store/bestiary";
import { callClaudeJSON, resizeImage } from "@/src/lib/ai/client";
import {
  type Creature,
  type HomebrewCreature,
  type CreatureWithSource,
  makeBlankCreature,
  generateCreature,
  composeMetaAndSections,
  parseSectionsIntoDraft,
  getAllCreatures,
  getCreatureType,
  getCreatureCR,
  getCreatureSize,
  crBucket,
  crSortValue,
  normalizeCreatureForCompendium,
} from "@/src/lib/bestiary";
import { BEAST_GEN, type PowerLevel } from "@/src/data/beast-tables";

const CR_OPTIONS = ["random", "0", "1/8", "1/4", "1/2", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "12", "15", "17", "20"];
const POWER_OPTIONS: { value: string; label: string }[] = [
  { value: "random", label: "Aleatorio" },
  { value: "sencilla", label: "Sencilla" },
  { value: "normal", label: "Normal" },
  { value: "peligrosa", label: "Peligrosa" },
  { value: "legendaria", label: "Legendaria" },
];
const SIZE_OPTIONS = ["random", ...BEAST_GEN.sizes.filter((s, i, a) => a.indexOf(s) === i)];
const TYPE_OPTIONS = ["random", ...BEAST_GEN.types];

const SORT_MODES = [
  { value: "cr-asc", label: "VD ↑" },
  { value: "cr-desc", label: "VD ↓" },
  { value: "name-asc", label: "Nombre A-Z" },
  { value: "name-desc", label: "Nombre Z-A" },
  { value: "type", label: "Tipo" },
];

const AI_SYSTEM = `Eres un experto diseñador de criaturas para D&D 5e. Generas criaturas balanceadas y evocadoras en español.
Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional:
{
  "name":"nombre compuesto evocador",
  "creatureType":"tipo de criatura",
  "size":"tamaño",
  "alignment":"alineamiento",
  "cr":"valor de desafío",
  "ca":"clase de armadura (número)",
  "hp":"puntos de golpe (número)",
  "hpFormula":"fórmula de dados",
  "speed":"velocidad",
  "attrs":{"fue":N,"des":N,"con":N,"int":N,"sab":N,"car":N},
  "savingThrowsText":"salvaciones",
  "skills":"habilidades",
  "senses":"sentidos",
  "languages":"idiomas",
  "traits":[{"name":"nombre","desc":"descripción"}],
  "actions":[{"name":"nombre","desc":"descripción con dados de daño"}],
  "reactions":[{"name":"nombre","desc":"descripción"}],
  "legendaryActions":[{"name":"nombre","desc":"descripción"}],
  "legendaryDesc":"texto introductorio de acciones legendarias",
  "text":"descripción flavor de la criatura"
}
Equilibra la criatura según su VD siguiendo las pautas del DMG.`;

export default function MonsterPage() {
  const homebrew = useBestiaryStore((s) => s.homebrew);
  const addCreature = useBestiaryStore((s) => s.add);
  const updateCreature = useBestiaryStore((s) => s.update);
  const removeCreature = useBestiaryStore((s) => s.remove);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Creature | null>(null);
  const [isNew, setIsNew] = useState(false);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCR, setFilterCR] = useState("");
  const [filterSize, setFilterSize] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [sortMode, setSortMode] = useState("cr-asc");

  const [genCr, setGenCr] = useState("random");
  const [genPower, setGenPower] = useState("random");
  const [genSize, setGenSize] = useState("random");
  const [genType, setGenType] = useState("random");
  const [aiDesc, setAiDesc] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const allCreatures = useMemo(() => getAllCreatures(homebrew), [homebrew]);

  const filtered = useMemo(() => {
    let list = [...allCreatures];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    if (filterType) list = list.filter((c) => getCreatureType(c.meta || "") === filterType);
    if (filterCR) list = list.filter((c) => crBucket(getCreatureCR(c.meta || "")) === filterCR);
    if (filterSize) list = list.filter((c) => getCreatureSize(c.meta || "") === filterSize);
    if (filterSource) list = list.filter((c) => c.source === filterSource);

    list.sort((a, b) => {
      if (sortMode !== "name-asc" && sortMode !== "name-desc") {
        if (a.source !== b.source) return a.source === "homebrew" ? -1 : 1;
      }
      if (sortMode === "cr-asc") {
        const crA = crSortValue(getCreatureCR(a.meta || "") || "0");
        const crB = crSortValue(getCreatureCR(b.meta || "") || "0");
        if (crA !== crB) return crA - crB;
        return a.name.localeCompare(b.name, "es");
      }
      if (sortMode === "cr-desc") {
        const crA = crSortValue(getCreatureCR(a.meta || "") || "0");
        const crB = crSortValue(getCreatureCR(b.meta || "") || "0");
        if (crA !== crB) return crB - crA;
        return a.name.localeCompare(b.name, "es");
      }
      if (sortMode === "name-asc") return a.name.localeCompare(b.name, "es");
      if (sortMode === "name-desc") return b.name.localeCompare(a.name, "es");
      if (sortMode === "type") {
        const tA = getCreatureType(a.meta || "") || "zz";
        const tB = getCreatureType(b.meta || "") || "zz";
        if (tA !== tB) return tA.localeCompare(tB, "es");
        return a.name.localeCompare(b.name, "es");
      }
      return 0;
    });
    return list;
  }, [allCreatures, search, filterType, filterCR, filterSize, filterSource, sortMode]);

  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    allCreatures.forEach((c) => {
      const t = getCreatureType(c.meta || "");
      if (t && t !== "desconocido") types.add(t);
    });
    return Array.from(types).sort();
  }, [allCreatures]);

  const selected = useMemo(() => {
    if (!selectedId || editing) return null;
    return allCreatures.find((c) => c.id === selectedId) || null;
  }, [selectedId, editing, allCreatures]);

  const selectCreature = useCallback((id: string) => {
    setSelectedId(id);
    setEditing(null);
    setIsNew(false);
  }, []);

  const startNew = useCallback(() => {
    const blank = makeBlankCreature();
    setEditing(blank);
    setIsNew(true);
    setSelectedId(null);
  }, []);

  const startEdit = useCallback((c: CreatureWithSource) => {
    if (c.source !== "homebrew") return;
    const hb = homebrew.find((h) => h.id === c.id);
    if (hb) {
      setEditing({ ...hb } as Creature);
      setIsNew(false);
      setSelectedId(null);
    }
  }, [homebrew]);

  const startDuplicate = useCallback((c: CreatureWithSource) => {
    const draft = makeBlankCreature();
    draft.name = c.name + " (copia)";
    draft.text = (c.text as string) || "";
    if (c.sections) {
      parseSectionsIntoDraft(draft, c);
    }
    setEditing(draft);
    setIsNew(true);
    setSelectedId(null);
  }, []);

  const handleSave = useCallback((c: Creature) => {
    composeMetaAndSections(c);
    if (isNew || !homebrew.find((h) => h.id === c.id)) {
      addCreature(c);
    } else {
      updateCreature(c.id, c);
    }
    setSelectedId(c.id);
    setEditing(null);
    setIsNew(false);
  }, [isNew, homebrew, addCreature, updateCreature]);

  const handleCancel = useCallback(() => {
    setEditing(null);
    setIsNew(false);
  }, []);

  const handleDelete = useCallback((c: CreatureWithSource) => {
    if (c.source !== "homebrew") return;
    removeCreature(c.id);
    if (selectedId === c.id) setSelectedId(null);
  }, [selectedId, removeCreature]);

  const handleExport = useCallback((c: CreatureWithSource) => {
    const data = JSON.stringify(c, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arcanum-criatura-${c.name.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!parsed.name) return;
        const creature: HomebrewCreature = {
          ...makeBlankCreature(),
          ...parsed,
          id: "hb_" + Date.now(),
          type: "monstruo",
        };
        addCreature(creature);
        setSelectedId(creature.id);
      } catch { /* ignore */ }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [addCreature]);

  const handleGenerate = useCallback(() => {
    const c = generateCreature({
      cr: genCr === "random" ? undefined : genCr,
      power: genPower === "random" ? undefined : (genPower as PowerLevel),
      size: genSize === "random" ? undefined : genSize,
      creatureType: genType === "random" ? undefined : genType,
    });
    setEditing(c);
    setIsNew(true);
    setSelectedId(null);
  }, [genCr, genPower, genSize, genType]);

  const handleAI = useCallback(async () => {
    if (!aiDesc.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const { data } = await callClaudeJSON<Partial<Creature>>({
        systemPrompt: AI_SYSTEM,
        userPrompt: `Crea una criatura de D&D 5e: ${aiDesc}`,
        maxTokens: 2000,
      });
      const c = makeBlankCreature();
      Object.assign(c, {
        name: data.name || c.name,
        creatureType: data.creatureType || c.creatureType,
        size: data.size || c.size,
        alignment: data.alignment || c.alignment,
        cr: data.cr || c.cr,
        ca: data.ca || c.ca,
        hp: data.hp || c.hp,
        hpFormula: data.hpFormula || c.hpFormula,
        speed: data.speed || c.speed,
        attrs: data.attrs || c.attrs,
        savingThrowsText: data.savingThrowsText || c.savingThrowsText,
        skills: data.skills || c.skills,
        senses: data.senses || c.senses,
        languages: data.languages || c.languages,
        traits: Array.isArray(data.traits) ? data.traits : c.traits,
        actions: Array.isArray(data.actions) ? data.actions : c.actions,
        reactions: Array.isArray(data.reactions) ? data.reactions : c.reactions,
        legendaryActions: Array.isArray(data.legendaryActions) ? data.legendaryActions : c.legendaryActions,
        legendaryDesc: data.legendaryDesc || c.legendaryDesc,
        text: data.text || c.text,
      });
      setEditing(c);
      setIsNew(true);
      setSelectedId(null);
      setAiDesc("");
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Error");
    } finally {
      setAiLoading(false);
    }
  }, [aiDesc]);

  const handleAIImage = useCallback(async (file: File) => {
    setAiLoading(true);
    setAiError(null);
    try {
      const image = await resizeImage(file);
      const { data } = await callClaudeJSON<Partial<Creature>>({
        systemPrompt: AI_SYSTEM,
        userPrompt: "Crea una criatura de D&D 5e inspirada en esta imagen.",
        maxTokens: 2000,
        image,
      });
      const c = makeBlankCreature();
      Object.assign(c, {
        name: data.name || c.name,
        creatureType: data.creatureType || c.creatureType,
        size: data.size || c.size,
        alignment: data.alignment || c.alignment,
        cr: data.cr || c.cr,
        ca: data.ca || c.ca,
        hp: data.hp || c.hp,
        hpFormula: data.hpFormula || c.hpFormula,
        speed: data.speed || c.speed,
        attrs: data.attrs || c.attrs,
        traits: Array.isArray(data.traits) ? data.traits : c.traits,
        actions: Array.isArray(data.actions) ? data.actions : c.actions,
        text: data.text || c.text,
      });
      setEditing(c);
      setIsNew(true);
      setSelectedId(null);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Error");
    } finally {
      setAiLoading(false);
    }
  }, []);

  return (
    <div className="page" data-tool="monster">
      <PageHeader toolId="monster" />

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Left panel: list */}
        <aside className="flex flex-col gap-3">
          <input
            className="field"
            placeholder="Buscar criatura..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-2">
            <select className="field !text-sm !min-h-[36px]" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">Todos los tipos</option>
              {availableTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="field !text-sm !min-h-[36px]" value={filterCR} onChange={(e) => setFilterCR(e.target.value)}>
              <option value="">Todo VD</option>
              <option value="low">VD 0-1</option>
              <option value="mid">VD 2-5</option>
              <option value="high">VD 6-10</option>
              <option value="elite">VD 11-20</option>
              <option value="legendary">VD 21+</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select className="field !text-sm !min-h-[36px]" value={filterSize} onChange={(e) => setFilterSize(e.target.value)}>
              <option value="">Todo tamaño</option>
              <option value="diminuto">Diminuto</option>
              <option value="pequeño">Pequeño</option>
              <option value="mediano">Mediano</option>
              <option value="grande">Grande</option>
              <option value="enorme">Enorme</option>
              <option value="gargantuesco">Gargantuesco</option>
            </select>
            <select className="field !text-sm !min-h-[36px]" value={filterSource} onChange={(e) => setFilterSource(e.target.value)}>
              <option value="">Todas</option>
              <option value="srd">SRD</option>
              <option value="homebrew">Homebrew</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-[var(--font-mono)] text-[11px] text-ink-soft">
              {filtered.length} de {allCreatures.length}
            </span>
            <select className="field !text-xs !min-h-[30px] !py-0 !w-auto" value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
              {SORT_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
            {filtered.map((c) => {
              const cr = getCreatureCR(c.meta || "") || "?";
              const type = getCreatureType(c.meta || "");
              const size = getCreatureSize(c.meta || "") || "";
              const isActive = c.id === selectedId;
              return (
                <button
                  key={c.id}
                  onClick={() => selectCreature(c.id)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm transition-colors ${
                    isActive
                      ? "bg-[color-mix(in_srgb,var(--acc)_12%,transparent)] border border-[color-mix(in_srgb,var(--acc)_35%,transparent)]"
                      : "hover:bg-[var(--bg-card)] border border-transparent"
                  }`}
                >
                  <span className="text-base shrink-0">{c.source === "homebrew" ? "◆" : "♆"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-ink truncate">{c.name}</div>
                    <div className="text-[11px] text-ink-soft truncate">
                      VD {cr}{type ? ` · ${type}` : ""}{size ? ` ${size}` : ""}
                    </div>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-ink-soft text-sm italic text-center py-4">Sin resultados.</div>
            )}
          </div>
        </aside>

        {/* Right panel: detail / editor */}
        <div className="flex flex-col gap-4 min-w-0">
          {/* Generator controls */}
          <div className="card flex flex-col gap-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="label">VD</label>
                <select className="field !text-sm !min-h-[36px]" value={genCr} onChange={(e) => setGenCr(e.target.value)}>
                  {CR_OPTIONS.map((cr) => <option key={cr} value={cr}>{cr === "random" ? "Aleatorio" : `VD ${cr}`}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Poder</label>
                <select className="field !text-sm !min-h-[36px]" value={genPower} onChange={(e) => setGenPower(e.target.value)}>
                  {POWER_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Tamaño</label>
                <select className="field !text-sm !min-h-[36px]" value={genSize} onChange={(e) => setGenSize(e.target.value)}>
                  {SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s === "random" ? "Aleatorio" : s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Tipo</label>
                <select className="field !text-sm !min-h-[36px]" value={genType} onChange={(e) => setGenType(e.target.value)}>
                  {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t === "random" ? "Aleatorio" : t}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="btn btn-primary" onClick={handleGenerate}>Generar</button>
              <button className="btn btn-ghost" onClick={startNew}>+ Nueva</button>
              <input
                ref={fileRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
              <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>Importar</button>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-[var(--line)]">
              <div className="flex gap-2">
                <input
                  className="field flex-1"
                  placeholder="Describe una criatura para la IA..."
                  value={aiDesc}
                  onChange={(e) => setAiDesc(e.target.value)}
                />
                <button className="btn btn-acc shrink-0" onClick={handleAI} disabled={aiLoading}>
                  {aiLoading ? "..." : "IA"}
                </button>
              </div>
              <label className="btn btn-ghost !text-[11px] !min-h-[32px] !py-0 cursor-pointer w-fit">
                IA desde imagen
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleAIImage(f);
                    e.target.value = "";
                  }}
                />
              </label>
              {aiError && <p className="text-sm" style={{ color: "var(--blood)" }}>{aiError}</p>}
            </div>
          </div>

          {/* Detail or Editor */}
          {editing ? (
            <div className="card">
              <CreatureEditor creature={editing} onSave={handleSave} onCancel={handleCancel} />
            </div>
          ) : selected ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {selected.source === "homebrew" && (
                  <>
                    <button className="btn btn-ghost !text-[11px] !min-h-[32px] !py-0" onClick={() => startEdit(selected)}>Editar</button>
                    <button className="btn btn-ghost !text-[11px] !min-h-[32px] !py-0" onClick={() => handleExport(selected)}>Exportar</button>
                    <button className="btn btn-ghost !text-[11px] !min-h-[32px] !py-0" style={{ color: "var(--blood)" }} onClick={() => handleDelete(selected)}>Borrar</button>
                  </>
                )}
                <button className="btn btn-ghost !text-[11px] !min-h-[32px] !py-0" onClick={() => startDuplicate(selected)}>Duplicar</button>
              </div>
              <div className="card">
                <StatBlock entry={normalizeCreatureForCompendium(selected as unknown as HomebrewCreature)} />
              </div>
            </div>
          ) : (
            <div className="card text-ink-soft text-center italic">
              Selecciona una criatura o genera una nueva.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
