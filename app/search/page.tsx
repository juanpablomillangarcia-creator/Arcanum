"use client";

import { useState, useMemo, useCallback } from "react";
import { PageHeader } from "@/src/components/PageHeader";
import { StatBlock } from "@/src/components/StatBlock";
import { SrdEntryView } from "@/src/components/SrdEntryView";
import { useHomebrewStore } from "@/src/store/homebrew";
import {
  COMP_TYPES,
  getAllEntries,
  filterEntries,
  typeCount,
  typeLabel,
  getSubFilters,
  type CompFilters,
  type CompSource,
} from "@/src/lib/search";
import type { SrdEntry, SrdSection } from "@/src/data/srd";

type SrdEntrySrc = SrdEntry & { source: string };

function HomebrewForm({
  existing,
  onSave,
  onCancel,
}: {
  existing?: SrdEntry;
  onSave: (entry: SrdEntry) => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState(existing?.type || "hechizo");
  const [name, setName] = useState(existing?.name || "");
  const [meta, setMeta] = useState(existing?.meta || "");
  const [text, setText] = useState(existing?.text || "");
  const [sectionsText, setSectionsText] = useState(
    existing?.sections?.map((s: SrdSection) => `${s.t} | ${s.d}`).join("\n") || "",
  );

  const submit = () => {
    if (!name.trim()) return;
    const sections = sectionsText
      .trim()
      .split("\n")
      .map((line: string) => {
        const [t, ...d] = line.split("|");
        return { t: (t || "").trim(), d: d.join("|").trim() };
      })
      .filter((s: { t: string; d: string }) => s.t && s.d);

    const entry: SrdEntry = {
      ...(existing || {}),
      id: existing?.id || "hb_" + Date.now(),
      type,
      name: name.trim(),
      meta: meta.trim(),
      text: text.trim(),
      sections: sections.length ? sections : undefined,
    };
    onSave(entry);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="font-[var(--font-mono)] text-[11px] tracking-wider uppercase" style={{ color: "var(--acc)" }}>
        {existing ? "Editar" : "Crear"} homebrew
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="hb-type">Tipo</label>
          <select
            id="hb-type"
            className="field"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {COMP_TYPES.filter((t) => t.id !== "todos").map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="hb-name">Nombre</label>
          <input
            id="hb-name"
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ej. Bola de Hielo"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="hb-meta">Metadatos</label>
        <input
          id="hb-meta"
          className="field"
          value={meta}
          onChange={(e) => setMeta(e.target.value)}
          placeholder="ej. Nivel 3 · Evocación"
        />
      </div>

      <div>
        <label className="label" htmlFor="hb-text">Descripción</label>
        <textarea
          id="hb-text"
          className="field min-h-[88px]"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Texto descriptivo de la entrada..."
        />
      </div>

      <div>
        <label className="label" htmlFor="hb-sections">Secciones extra</label>
        <textarea
          id="hb-sections"
          className="field min-h-[60px]"
          value={sectionsText}
          onChange={(e) => setSectionsText(e.target.value)}
          placeholder={"Título | Contenido\nOtro | Más contenido"}
        />
        <div className="text-xs text-ink-soft mt-1">Una por línea, formato: Título | Contenido</div>
      </div>

      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={submit}>Guardar</button>
        <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const homebrew = useHomebrewStore((s) => s.items);
  const addHomebrew = useHomebrewStore((s) => s.add);
  const updateHomebrew = useHomebrewStore((s) => s.update);
  const removeHomebrew = useHomebrewStore((s) => s.remove);

  const [filters, setFilters] = useState<CompFilters>({
    type: "todos",
    source: "all",
    search: "",
    subfilter: null,
  });
  const [selected, setSelected] = useState<SrdEntrySrc | null>(null);
  const [editing, setEditing] = useState<SrdEntry | null>(null);
  const [showForm, setShowForm] = useState(false);

  const allEntries = useMemo(() => getAllEntries(homebrew), [homebrew]);
  const filtered = useMemo(() => filterEntries(allEntries, filters), [allEntries, filters]);

  const setType = useCallback((type: string) => {
    setFilters((f) => ({ ...f, type, subfilter: null }));
    setSelected(null);
  }, []);

  const setSource = useCallback((source: CompSource) => {
    setFilters((f) => ({ ...f, source }));
    setSelected(null);
  }, []);

  const setSub = useCallback((sub: string | null) => {
    setFilters((f) => ({ ...f, subfilter: f.subfilter === sub ? null : sub }));
  }, []);

  const subFilters = getSubFilters(filters.type);

  const handleSaveHomebrew = (entry: SrdEntry) => {
    if (editing?.id) {
      updateHomebrew(entry.id as string, entry);
    } else {
      if (allEntries.some((e) => e.source === "homebrew" && e.name === entry.name)) {
        return;
      }
      addHomebrew(entry);
    }
    setEditing(null);
    setShowForm(false);
    setSelected(null);
  };

  const handleEditHomebrew = (entry: SrdEntrySrc) => {
    const original = homebrew.find((h) => h.name === entry.name);
    if (original) {
      setEditing(original);
      setShowForm(true);
      setSelected(null);
    }
  };

  const handleDeleteHomebrew = (entry: SrdEntrySrc) => {
    const original = homebrew.find((h) => h.name === entry.name);
    if (original) {
      removeHomebrew(original.id as string);
      setSelected(null);
    }
  };

  return (
    <div className="page" data-tool="search">
      <PageHeader toolId="search" />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col gap-4">
          <input
            className="field"
            type="text"
            placeholder="Buscar en el compendio..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />

          <div className="flex flex-col gap-1">
            {COMP_TYPES.map((t) => {
              const count = typeCount(allEntries, t.id);
              const active = filters.type === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-md text-sm transition-colors text-left ${
                    active
                      ? "bg-[color-mix(in_srgb,var(--acc)_16%,transparent)] text-ink border border-[color-mix(in_srgb,var(--acc)_40%,transparent)]"
                      : "text-ink-dim hover:text-ink hover:bg-[var(--bg-card)]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{t.icon}</span>
                    <span>{t.label}</span>
                  </span>
                  <span className="font-[var(--font-mono)] text-[11px] text-ink-soft">{count}</span>
                </button>
              );
            })}
          </div>

          {subFilters && (
            <div>
              <div className="label mb-2">
                {filters.type === "hechizo" ? "Nivel" : filters.type === "monstruo" ? "VD" : "Tipo"}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {subFilters.map((sf) => (
                  <button
                    key={sf.id}
                    onClick={() => setSub(sf.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-[var(--font-mono)] transition-colors ${
                      filters.subfilter === sf.id
                        ? "bg-[color-mix(in_srgb,var(--acc)_20%,transparent)] text-ink border border-[color-mix(in_srgb,var(--acc)_50%,transparent)]"
                        : "text-ink-soft border border-[var(--line)] hover:text-ink hover:border-[var(--line-bright)]"
                    }`}
                  >
                    {sf.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="label mb-2">Fuente</div>
            <div className="flex gap-1.5">
              {(["all", "srd", "homebrew"] as const).map((src) => (
                <button
                  key={src}
                  onClick={() => setSource(src)}
                  className={`px-3 py-1 rounded-full text-xs font-[var(--font-mono)] transition-colors ${
                    filters.source === src
                      ? "bg-[color-mix(in_srgb,var(--acc)_20%,transparent)] text-ink border border-[color-mix(in_srgb,var(--acc)_50%,transparent)]"
                      : "text-ink-soft border border-[var(--line)] hover:text-ink hover:border-[var(--line-bright)]"
                  }`}
                >
                  {src === "all" ? "Todo" : src === "srd" ? "SRD" : "Homebrew"}
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-acc" onClick={() => { setEditing(null); setShowForm(true); setSelected(null); }}>
            + Homebrew
          </button>
        </aside>

        <div className="flex flex-col gap-4 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-[var(--font-mono)] text-[11px] tracking-wider uppercase text-ink-soft">
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="card text-ink-soft text-center italic">
              Sin resultados. Prueba a quitar filtros o ajustar la búsqueda.
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {filtered.map((e, i) => {
                const tLabel = typeLabel(e.type);
                const isSelected = selected?.name === e.name && selected?.source === e.source;
                return (
                  <button
                    key={`${e.source}::${e.name}::${i}`}
                    onClick={() => setSelected(e)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                      isSelected
                        ? "bg-[color-mix(in_srgb,var(--acc)_12%,transparent)] border border-[color-mix(in_srgb,var(--acc)_35%,transparent)]"
                        : "hover:bg-[var(--bg-card)] border border-transparent"
                    }`}
                  >
                    <span className="font-[var(--font-mono)] text-[10px] tracking-wider uppercase shrink-0 w-20 text-ink-soft">
                      {tLabel}
                    </span>
                    <span className="text-ink truncate flex-1">{e.name}</span>
                    <span className="text-xs text-ink-soft truncate max-w-[200px] hidden sm:block">
                      {e.meta || ""}
                    </span>
                    {e.source === "homebrew" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: "var(--acc)" }}>HB</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selected && !showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/70" />
          <div
            className="relative card max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-ink-soft hover:text-ink text-xl z-10"
              onClick={() => setSelected(null)}
            >
              ✕
            </button>
            {selected.type === "monstruo" ? (
              <StatBlock entry={selected} />
            ) : (
              <SrdEntryView
                entry={selected}
                onEdit={selected.source === "homebrew" ? () => handleEditHomebrew(selected) : undefined}
                onDelete={selected.source === "homebrew" ? () => handleDeleteHomebrew(selected) : undefined}
              />
            )}
          </div>
        </div>
      )}

      {/* Homebrew form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setShowForm(false); setEditing(null); }}>
          <div className="absolute inset-0 bg-black/70" />
          <div
            className="relative card max-w-xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-ink-soft hover:text-ink text-xl z-10"
              onClick={() => { setShowForm(false); setEditing(null); }}
            >
              ✕
            </button>
            <HomebrewForm
              existing={editing || undefined}
              onSave={handleSaveHomebrew}
              onCancel={() => { setShowForm(false); setEditing(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
