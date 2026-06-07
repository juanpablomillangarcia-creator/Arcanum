"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { PageHeader } from "@/src/components/PageHeader";
import type { UseBoundStore, StoreApi } from "zustand";
import type { SavedItemsStore } from "@/src/store/savedItems";

export interface GenField {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "textarea";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface GeneratorConfig<P extends Record<string, string>, R> {
  toolId: string;
  kicker?: string;
  fields: GenField[];
  initialParams: P;
  /** Procedural generation (no API key needed). */
  generate?: (p: P) => R;
  /** AI-backed generation. */
  generateAI?: (p: P) => Promise<R>;
  /** Label for save buttons / saved list entries. */
  resultLabel: (r: R) => string;
  /** `update` lets interactive results mutate and re-render (e.g. expanding a room). */
  renderResult: (r: R, update: (next: R) => void) => ReactNode;
  /** Store hook created once per tool via makeSavedStore. */
  useSavedStore: UseBoundStore<StoreApi<SavedItemsStore<R>>>;
  generateLabel?: string;
  aiLabel?: string;
}

export function GeneratorTool<P extends Record<string, string>, R>({ config }: { config: GeneratorConfig<P, R> }) {
  const [params, setParams] = useState<P>(config.initialParams);
  const [result, setResult] = useState<R | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saved = config.useSavedStore();

  const setField = (key: string, value: string) => setParams((p) => ({ ...p, [key]: value }));

  const runProcedural = () => {
    if (!config.generate) return;
    setError(null);
    setResult(config.generate(params));
  };

  const runAI = async () => {
    if (!config.generateAI) return;
    setError(null);
    setLoading(true);
    try {
      setResult(await config.generateAI(params));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Algo salió mal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" data-tool={config.toolId}>
      <PageHeader toolId={config.toolId} kicker={config.kicker} />

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Params */}
        <aside className="card h-fit flex flex-col gap-4">
          {config.fields.map((f) => (
            <div key={f.key}>
              <label className="label" htmlFor={f.key}>{f.label}</label>
              {f.type === "select" ? (
                <select id={f.key} className="field" value={params[f.key]} onChange={(e) => setField(f.key, e.target.value)}>
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : f.type === "textarea" ? (
                <textarea id={f.key} className="field min-h-[88px]" placeholder={f.placeholder} value={params[f.key]} onChange={(e) => setField(f.key, e.target.value)} />
              ) : (
                <input
                  id={f.key}
                  className="field"
                  type={f.type}
                  inputMode={f.type === "number" ? "numeric" : undefined}
                  placeholder={f.placeholder}
                  value={params[f.key]}
                  onChange={(e) => setField(f.key, e.target.value)}
                />
              )}
            </div>
          ))}

          <div className="flex flex-col gap-2">
            {config.generate && (
              <button className="btn btn-primary" onClick={runProcedural}>
                {config.generateLabel ?? "Generar"}
              </button>
            )}
            {config.generateAI && (
              <button className="btn btn-acc" onClick={runAI} disabled={loading}>
                {loading ? "Generando…" : config.aiLabel ?? "Generar con IA"}
              </button>
            )}
          </div>
          {error && (
            <p className="text-sm" style={{ color: "var(--blood)" }}>
              {error}{" "}
              <Link href="/settings" className="underline">Ajustes</Link>
            </p>
          )}
        </aside>

        {/* Result + saved */}
        <div className="flex flex-col gap-6 min-w-0">
          {result ? (
            <div className="card">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="font-[var(--font-title)] text-2xl text-ink truncate">
                  {config.resultLabel(result)}
                </h2>
                <button
                  className="btn btn-ghost shrink-0"
                  onClick={() => saved.save(result, config.resultLabel(result))}
                >
                  Guardar
                </button>
              </div>
              {config.renderResult(result, setResult)}
            </div>
          ) : (
            <div className="card text-ink-soft text-center">
              Ajusta los parámetros y pulsa generar.
            </div>
          )}

          {saved.items.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-mono text-[11px] tracking-[0.3em] uppercase text-ink-soft">Guardados</h3>
                <button className="text-xs text-ink-soft hover:text-ink" onClick={saved.clear}>Borrar todo</button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {saved.items.map((item) => (
                  <div key={item.id} className="card flex items-center justify-between gap-2 !p-3">
                    <button className="text-left min-w-0 flex-1" onClick={() => setResult(item.data)}>
                      <span className="block text-ink truncate font-[var(--font-title)]">{item.label}</span>
                      <span className="block text-xs text-ink-soft">{new Date(item.savedAt).toLocaleDateString("es")}</span>
                    </button>
                    <button className="text-ink-soft hover:text-[var(--blood)] px-2" onClick={() => saved.remove(item.id)} aria-label="Eliminar">✕</button>
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
