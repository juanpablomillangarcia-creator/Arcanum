"use client";

import { useState } from "react";
import { PageHeader } from "@/src/components/PageHeader";
import { useHomebrewStore } from "@/src/store/homebrew";
import { callClaudeJSON } from "@/src/lib/ai/client";
import {
  RL_TYPES,
  RL_RARITIES,
  RL_RARITY_NAMES,
  INITIAL_RELIC_FORM,
  generateRelic,
  buildRelicObject,
  type RelicForm,
  type Relic,
} from "@/src/lib/relic";

const AI_SYSTEM = `Eres un experto diseñador de objetos mágicos para D&D 5e, equilibrados y con sabor. RESPONDE SIEMPRE EN ESPAÑOL.
Responde ÚNICAMENTE con un objeto JSON válido, sin markdown:
{
  "name":"nombre",
  "type":"Arma|Armadura|Escudo|Anillo|Varita|Vara|Bastón|Pergamino|Poción|Amuleto|Capa|Botas|Guantes|Objeto maravilloso",
  "rarity":"comun|infrecuente|raro|muy-raro|legendario|artefacto",
  "attune":true/false,"attuneReq":"restricción de sintonización o vacío",
  "text":"propiedades y efectos del objeto, equilibrados a su rareza",
  "charges":"sistema de cargas o vacío","curse":"maldición o vacío","lore":"trasfondo evocador o vacío"
}
Equilibra el objeto según su rareza siguiendo las pautas del DMG.`;

interface AiRelic {
  name?: string;
  type?: string;
  rarity?: string;
  attune?: boolean;
  attuneReq?: string;
  text?: string;
  charges?: string;
  curse?: string;
  lore?: string;
}

function RelicPreview({ form }: { form: RelicForm }) {
  if (!form.name && !form.text) {
    return (
      <div className="text-ink-soft text-sm italic text-center py-8">
        Rellena el formulario para ver la vista previa del objeto.
      </div>
    );
  }

  const rarityLabel = RL_RARITY_NAMES[form.rarity] || form.rarity;
  const attuneText = form.attune
    ? form.attuneReq
      ? `requiere sintonización ${form.attuneReq}`
      : "requiere sintonización"
    : "";

  return (
    <div className="flex flex-col gap-3">
      <div className="font-[var(--font-display)] text-xl text-ink">{form.name || "Objeto sin nombre"}</div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-[var(--font-mono)] text-xs tracking-wider uppercase" style={{ color: "var(--acc)" }}>
          {form.type}
        </span>
        {attuneText && <span className="text-xs text-ink-soft">· {attuneText}</span>}
        <span
          className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ml-auto shrink-0"
          style={{ color: "var(--acc)", borderColor: "var(--acc)" }}
        >
          {rarityLabel}
        </span>
      </div>
      {form.text && (
        <div className="text-ink-dim text-sm leading-relaxed border-t pt-3" style={{ borderColor: "var(--line)" }}>
          {form.text}
        </div>
      )}
      {form.charges && (
        <div className="text-sm border-t pt-2" style={{ borderColor: "var(--line)" }}>
          <strong>Cargas:</strong> {form.charges}
        </div>
      )}
      {form.curse && (
        <div className="text-sm" style={{ color: "var(--blood)" }}>
          <strong>Maldición:</strong> {form.curse}
        </div>
      )}
      {form.lore && (
        <div className="text-ink-soft text-sm italic border-t pt-3" style={{ borderColor: "var(--line)" }}>
          {form.lore}
        </div>
      )}
    </div>
  );
}

export default function RelicPage() {
  const [form, setForm] = useState<RelicForm>({ ...INITIAL_RELIC_FORM });
  const [aiDesc, setAiDesc] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAi, setShowAi] = useState(false);

  const homebrew = useHomebrewStore();
  const createdItems = homebrew.items.filter((i) => i.type === "objeto") as Relic[];

  const set = (key: keyof RelicForm, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleGenerate = () => {
    const generated = generateRelic(form);
    setForm(generated);
  };

  const handleAiGenerate = async () => {
    if (!aiDesc.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const { data } = await callClaudeJSON<AiRelic>({
        systemPrompt: AI_SYSTEM,
        userPrompt: `Objeto a forjar: ${aiDesc}\n\nGenera el JSON.`,
        maxTokens: 1500,
      });

      setForm({
        name: data.name || "",
        type: data.type || "Objeto maravilloso",
        rarity: data.rarity || "infrecuente",
        attune: data.attune ?? false,
        attuneReq: data.attuneReq || "",
        text: data.text || "",
        charges: data.charges || "",
        curse: data.curse || "",
        lore: data.lore || "",
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
      alert("Ponle un nombre al objeto");
      return;
    }
    if (!form.text) {
      alert("Describe las propiedades del objeto");
      return;
    }
    const relic = buildRelicObject(form);
    homebrew.add(relic);
  };

  const handleClear = () => {
    setForm({ ...INITIAL_RELIC_FORM });
  };

  const handleLoadRelic = (item: Relic) => {
    const typeMatch = (item.meta || "").split("·")[0]?.trim();
    const attuneMatch = (item.meta || "").match(/sintonización ([^)]+)\)/);
    const isAttuned = /sintonización/i.test(item.meta || "");

    const getSection = (title: string) => item.sections?.find((s) => s.t === title)?.d || "";

    setForm({
      name: item.name || "",
      type: typeMatch || "Objeto maravilloso",
      rarity: item.subtype || "infrecuente",
      attune: isAttuned,
      attuneReq: attuneMatch ? attuneMatch[1] : "",
      text: item.text || "",
      charges: getSection("Cargas"),
      curse: getSection("Maldición"),
      lore: getSection("Trasfondo"),
    });
  };

  const handleDeleteRelic = (id: string) => {
    homebrew.remove(id);
  };

  return (
    <div className="page" data-tool="relic">
      <PageHeader toolId="relic" kicker="⚱ Generadores" />

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
                  placeholder="Describe el objeto mágico que imaginas..."
                  value={aiDesc}
                  onChange={(e) => setAiDesc(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={handleAiGenerate}
                    disabled={aiLoading || !aiDesc.trim()}
                  >
                    {aiLoading ? "Forjando..." : "Convocar"}
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
                <label className="label">Nombre del objeto</label>
                <input
                  type="text"
                  className="field"
                  placeholder="Ej. Daga del último aliento"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Tipo</label>
                <select
                  className="field"
                  value={form.type}
                  onChange={(e) => set("type", e.target.value)}
                >
                  {RL_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Rareza</label>
                <select
                  className="field"
                  value={form.rarity}
                  onChange={(e) => set("rarity", e.target.value)}
                >
                  {RL_RARITIES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.attune}
                    onChange={(e) => set("attune", e.target.checked)}
                  />
                  <span className="text-sm">Requiere sintonización</span>
                </label>
                {form.attune && (
                  <input
                    type="text"
                    className="field mt-2"
                    placeholder="Restricción (ej. por un druida)"
                    value={form.attuneReq}
                    onChange={(e) => set("attuneReq", e.target.value)}
                  />
                )}
              </div>
            </div>

            <div>
              <label className="label">Propiedades y efecto</label>
              <textarea
                className="field w-full"
                rows={4}
                placeholder="Describe qué hace el objeto: bonificaciones, cargas, efectos activables..."
                value={form.text}
                onChange={(e) => set("text", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Cargas (opcional)</label>
                <input
                  type="text"
                  className="field"
                  placeholder="Ej. 7 cargas, recupera 1d6+1 al amanecer"
                  value={form.charges}
                  onChange={(e) => set("charges", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Maldición (opcional)</label>
                <input
                  type="text"
                  className="field"
                  placeholder="Ej. no puedes soltarlo sin remover maldición"
                  value={form.curse}
                  onChange={(e) => set("curse", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">Trasfondo / sabor (opcional)</label>
              <textarea
                className="field w-full"
                rows={2}
                placeholder="Historia o leyenda del objeto."
                value={form.lore}
                onChange={(e) => set("lore", e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor: "var(--line)" }}>
              <button className="btn btn-primary" onClick={handleSave}>
                ⚱ Guardar en el Compendio
              </button>
            </div>
          </div>

          {createdItems.length > 0 && (
            <div className="card flex flex-col gap-3">
              <div className="font-[var(--font-mono)] text-xs tracking-wider uppercase text-ink-soft">
                Objetos homebrew ({createdItems.length})
              </div>
              {createdItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg"
                  style={{ background: "var(--bg-deep)" }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-ink font-medium truncate">{item.name}</div>
                    <div className="text-xs text-ink-soft truncate">{item.meta}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      className="btn btn-ghost text-xs"
                      onClick={() => handleLoadRelic(item as Relic)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-ghost text-xs"
                      style={{ color: "var(--blood)" }}
                      onClick={() => handleDeleteRelic(item.id)}
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
          <RelicPreview form={form} />
        </aside>
      </div>
    </div>
  );
}
