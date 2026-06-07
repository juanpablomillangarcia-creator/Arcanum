"use client";

import { useState } from "react";
import { PageHeader } from "@/src/components/PageHeader";
import { useHomebrewStore } from "@/src/store/homebrew";
import { callClaudeJSON } from "@/src/lib/ai/client";
import {
  SF_LEVELS,
  SF_SCHOOLS,
  INITIAL_SPELL_FORM,
  generateSpell,
  buildSpellObject,
  buildSpellMeta,
  type SpellForm,
  type Spell,
} from "@/src/lib/spellforge";

const AI_SYSTEM = `Eres un experto diseñador de hechizos para D&D 5e, equilibrados y evocadores. RESPONDE SIEMPRE EN ESPAÑOL.
Responde ÚNICAMENTE con un objeto JSON válido, sin markdown:
{
  "name":"nombre","level":"truco|1|2|3|4|5|6|7|8|9","school":"Abjuración|Adivinación|Conjuración|Encantamiento|Evocación|Ilusión|Nigromancia|Transmutación",
  "classes":"clases separadas por comas en minúscula",
  "casting":"tiempo de lanzamiento","range":"alcance","duration":"duración",
  "v":true/false,"s":true/false,"m":true/false,"material":"componente material o vacío",
  "concentration":true/false,"ritual":true/false,
  "text":"descripción completa del efecto, con daño/salvaciones/área concretos y equilibrados al nivel",
  "higher":"texto de a niveles superiores, o vacío si no aplica"
}
Equilibra el hechizo según su nivel siguiendo las pautas del DMG/PHB.`;

interface AiSpell {
  name?: string;
  level?: string;
  school?: string;
  classes?: string;
  casting?: string;
  range?: string;
  duration?: string;
  v?: boolean;
  s?: boolean;
  m?: boolean;
  material?: string;
  concentration?: boolean;
  ritual?: boolean;
  text?: string;
  higher?: string;
}

function SpellPreview({ form }: { form: SpellForm }) {
  if (!form.name && !form.text) {
    return (
      <div className="text-ink-soft text-sm italic text-center py-8">
        Rellena el formulario para ver la vista previa del hechizo.
      </div>
    );
  }

  let durationText = form.duration || "Instantáneo";
  if (form.concentration) {
    durationText = "Concentración, " + durationText;
  }

  const components = [
    form.compV ? "V" : "",
    form.compS ? "S" : "",
    form.compM ? "M" : "",
  ]
    .filter(Boolean)
    .join(", ");
  const componentsText =
    form.compM && form.material ? `${components} (${form.material})` : components || "—";

  return (
    <div className="flex flex-col gap-3">
      <div className="font-[var(--font-display)] text-xl text-ink">{form.name || "Hechizo sin nombre"}</div>
      <div className="font-[var(--font-mono)] text-xs tracking-wider uppercase" style={{ color: "var(--acc)" }}>
        {buildSpellMeta(form)}
      </div>
      <div className="flex flex-col gap-1 text-sm">
        <div><strong>Lanzamiento:</strong> {form.casting || "1 acción"}</div>
        <div><strong>Alcance:</strong> {form.range || "Personal"}</div>
        <div><strong>Componentes:</strong> {componentsText}</div>
        <div><strong>Duración:</strong> {durationText}</div>
        {form.classes && <div><strong>Clases:</strong> {form.classes}</div>}
      </div>
      {form.text && (
        <div className="text-ink-dim text-sm leading-relaxed border-t pt-3" style={{ borderColor: "var(--line)" }}>
          {form.text}
        </div>
      )}
      {form.higher && (
        <div className="text-ink-dim text-sm leading-relaxed border-t pt-3" style={{ borderColor: "var(--line)" }}>
          <strong>A niveles superiores.</strong> {form.higher}
        </div>
      )}
    </div>
  );
}

export default function SpellforgePage() {
  const [form, setForm] = useState<SpellForm>({ ...INITIAL_SPELL_FORM });
  const [aiDesc, setAiDesc] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAi, setShowAi] = useState(false);

  const homebrew = useHomebrewStore();
  const createdSpells = homebrew.items.filter((i) => i.type === "hechizo") as Spell[];

  const set = (key: keyof SpellForm, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleGenerate = () => {
    const generated = generateSpell(form);
    setForm(generated);
  };

  const handleAiGenerate = async () => {
    if (!aiDesc.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const { data } = await callClaudeJSON<AiSpell>({
        systemPrompt: AI_SYSTEM,
        userPrompt: `Hechizo a diseñar: ${aiDesc}\n\nGenera el JSON.`,
        maxTokens: 1500,
      });

      setForm({
        name: data.name || "",
        level: data.level || "1",
        school: data.school || "Evocación",
        classes: data.classes || "",
        casting: data.casting || "1 acción",
        range: data.range || "18 m",
        duration: (data.duration || "Instantáneo").replace(/concentración,?\s*hasta\s*/i, ""),
        compV: data.v ?? true,
        compS: data.s ?? true,
        compM: data.m ?? false,
        material: data.material || "",
        concentration: data.concentration ?? false,
        ritual: data.ritual ?? false,
        text: data.text || "",
        higher: data.higher || "",
      });
      setShowAi(false);
      setAiDesc("");
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Error al generar");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = () => {
    if (!form.name) {
      alert("Ponle un nombre al hechizo");
      return;
    }
    if (!form.text) {
      alert("Describe el efecto del hechizo");
      return;
    }
    const spell = buildSpellObject(form);
    homebrew.add(spell);
  };

  const handleClear = () => {
    setForm({ ...INITIAL_SPELL_FORM });
  };

  const handleLoadSpell = (spell: Spell) => {
    const level = spell.subtype || "1";
    const metaParts = (spell.meta || "").split("·");
    const school = metaParts[1]?.replace("(ritual)", "").trim() || "Evocación";
    const ritual = (spell.meta || "").includes("(ritual)");

    const getSection = (title: string) => spell.sections?.find((s) => s.t === title)?.d || "";

    const componentsText = getSection("Componentes");
    const compV = componentsText.includes("V");
    const compS = componentsText.includes("S");
    const compM = componentsText.includes("M");
    const materialMatch = componentsText.match(/\(([^)]+)\)/);
    const material = materialMatch ? materialMatch[1] : "";

    const durationText = getSection("Duración");
    const concentration = durationText.toLowerCase().startsWith("concentración");
    const duration = durationText.replace(/^Concentración,?\s*(hasta\s*)?/i, "");

    setForm({
      name: spell.name || "",
      level,
      school,
      classes: getSection("Clases"),
      casting: getSection("Tiempo de Lanzamiento") || "1 acción",
      range: getSection("Alcance") || "18 m",
      duration,
      compV,
      compS,
      compM,
      material,
      concentration,
      ritual,
      text: spell.text || "",
      higher: getSection("A Niveles Superiores"),
    });
  };

  const handleDeleteSpell = (id: string) => {
    homebrew.remove(id);
  };

  return (
    <div className="page" data-tool="spellforge">
      <PageHeader toolId="spellforge" kicker="✶ Generadores" />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-4">
          <div className="card flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-primary" onClick={handleGenerate}>
                🎲 Generar
              </button>
              <button className="btn btn-ghost" onClick={() => setShowAi(!showAi)}>
                ✨ IA
              </button>
              <button className="btn btn-ghost" onClick={handleClear}>
                Limpiar
              </button>
            </div>

            {showAi && (
              <div className="flex flex-col gap-3 p-4 rounded-lg" style={{ background: "var(--bg-deep)" }}>
                <textarea
                  className="field w-full"
                  rows={3}
                  placeholder="Describe el hechizo que imaginas..."
                  value={aiDesc}
                  onChange={(e) => setAiDesc(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={handleAiGenerate}
                    disabled={aiLoading || !aiDesc.trim()}
                  >
                    {aiLoading ? "Convocando..." : "Convocar"}
                  </button>
                  <button className="btn btn-ghost" onClick={() => setShowAi(false)}>
                    Cancelar
                  </button>
                </div>
                {aiError && <div className="text-sm" style={{ color: "var(--blood)" }}>{aiError}</div>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre del hechizo</label>
                <input
                  type="text"
                  className="field"
                  placeholder="Ej. Llama del juramento roto"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Nivel</label>
                <select
                  className="field"
                  value={form.level}
                  onChange={(e) => set("level", e.target.value)}
                >
                  {SF_LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Escuela</label>
                <select
                  className="field"
                  value={form.school}
                  onChange={(e) => set("school", e.target.value)}
                >
                  {SF_SCHOOLS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Clases que pueden lanzarlo</label>
                <input
                  type="text"
                  className="field"
                  placeholder="Ej. Mago, hechicero"
                  value={form.classes}
                  onChange={(e) => set("classes", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Tiempo de lanzamiento</label>
                <input
                  type="text"
                  className="field"
                  value={form.casting}
                  onChange={(e) => set("casting", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Alcance</label>
                <input
                  type="text"
                  className="field"
                  value={form.range}
                  onChange={(e) => set("range", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Duración</label>
                <input
                  type="text"
                  className="field"
                  value={form.duration}
                  onChange={(e) => set("duration", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">Componentes</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.compV}
                    onChange={(e) => set("compV", e.target.checked)}
                  />
                  <span className="text-sm">Verbal</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.compS}
                    onChange={(e) => set("compS", e.target.checked)}
                  />
                  <span className="text-sm">Somático</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.compM}
                    onChange={(e) => set("compM", e.target.checked)}
                  />
                  <span className="text-sm">Material</span>
                </label>
              </div>
            </div>

            {form.compM && (
              <div>
                <label className="label">Componente material</label>
                <input
                  type="text"
                  className="field"
                  placeholder="Ej. una pizca de azufre"
                  value={form.material}
                  onChange={(e) => set("material", e.target.value)}
                />
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.concentration}
                  onChange={(e) => set("concentration", e.target.checked)}
                />
                <span className="text-sm">Requiere concentración</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.ritual}
                  onChange={(e) => set("ritual", e.target.checked)}
                />
                <span className="text-sm">Puede lanzarse como ritual</span>
              </label>
            </div>

            <div>
              <label className="label">Descripción del efecto</label>
              <textarea
                className="field w-full"
                rows={4}
                placeholder="Describe qué hace el hechizo, daño, salvaciones, área..."
                value={form.text}
                onChange={(e) => set("text", e.target.value)}
              />
            </div>

            <div>
              <label className="label">A niveles superiores (opcional)</label>
              <textarea
                className="field w-full"
                rows={2}
                placeholder="Cómo escala si se lanza con espacios de nivel superior."
                value={form.higher}
                onChange={(e) => set("higher", e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor: "var(--line)" }}>
              <button className="btn btn-primary" onClick={handleSave}>
                ✶ Guardar en el Compendio
              </button>
            </div>
          </div>

          {createdSpells.length > 0 && (
            <div className="card flex flex-col gap-3">
              <div className="font-[var(--font-mono)] text-xs tracking-wider uppercase text-ink-soft">
                Hechizos homebrew ({createdSpells.length})
              </div>
              {createdSpells.map((spell) => (
                <div
                  key={spell.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg"
                  style={{ background: "var(--bg-deep)" }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-ink font-medium truncate">{spell.name}</div>
                    <div className="text-xs text-ink-soft truncate">{spell.meta}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      className="btn btn-ghost text-xs"
                      onClick={() => handleLoadSpell(spell as Spell)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-ghost text-xs"
                      style={{ color: "var(--blood)" }}
                      onClick={() => handleDeleteSpell(spell.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="card h-fit lg:sticky lg:top-24">
          <div className="font-[var(--font-mono)] text-xs tracking-wider uppercase text-ink-soft mb-4">
            Vista previa
          </div>
          <SpellPreview form={form} />
        </aside>
      </div>
    </div>
  );
}
