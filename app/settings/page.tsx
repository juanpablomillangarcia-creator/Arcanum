"use client";

import { useState } from "react";
import { useAiStore, AI_MODELS, type AiModel } from "@/src/store/ai";

export default function SettingsPage() {
  const { apiKey, model, setApiKey, setModel, hasKey } = useAiStore();
  const [draft, setDraft] = useState(apiKey);
  const [reveal, setReveal] = useState(false);
  const valid = draft.startsWith("sk-ant-");

  return (
    <div className="page">
      <header className="mb-6">
        <div className="page-kicker">Ajustes</div>
        <h1 className="page-title">Inteligencia Artificial</h1>
        <p className="page-sub">
          Los generadores con IA usan tu propia clave de Anthropic. Se guarda solo en este
          dispositivo y nunca viaja a ningún servidor salvo, de forma segura, al proxy de la
          propia app para llamar a la API.
        </p>
      </header>

      <section className="card mb-6 max-w-xl">
        <label className="label" htmlFor="apikey">Clave de API</label>
        <div className="flex gap-2">
          <input
            id="apikey"
            className="field font-mono"
            type={reveal ? "text" : "password"}
            placeholder="sk-ant-..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoComplete="off"
          />
          <button className="btn btn-ghost" onClick={() => setReveal((r) => !r)}>
            {reveal ? "Ocultar" : "Ver"}
          </button>
        </div>
        {draft && !valid && (
          <p className="text-sm mt-2" style={{ color: "var(--blood)" }}>
            La clave debe empezar por <span className="font-mono">sk-ant-</span>.
          </p>
        )}
        <div className="flex items-center gap-3 mt-4">
          <button className="btn btn-primary" disabled={!valid} onClick={() => setApiKey(draft)}>
            Guardar clave
          </button>
          {hasKey() && <span className="tag">✓ Clave activa</span>}
        </div>
        <p className="text-xs text-ink-soft mt-3">
          Consíguela en console.anthropic.com → API Keys. La generación tiene un coste por uso
          que paga tu cuenta de Anthropic.
        </p>
      </section>

      <section className="card max-w-xl">
        <h2 className="label mb-3">Modelo</h2>
        <div className="flex flex-col gap-2">
          {(Object.keys(AI_MODELS) as AiModel[]).map((m) => (
            <button
              key={m}
              onClick={() => setModel(m)}
              className="flex items-start gap-3 text-left rounded-md p-3 border transition-colors"
              style={{
                borderColor: model === m ? "var(--acc)" : "var(--line-bright)",
                background: model === m ? "color-mix(in srgb, var(--acc) 10%, transparent)" : "transparent",
              }}
            >
              <span
                className="mt-1 grid place-items-center w-4 h-4 rounded-full border shrink-0"
                style={{ borderColor: model === m ? "var(--acc)" : "var(--line-bright)" }}
              >
                {model === m && <span className="w-2 h-2 rounded-full" style={{ background: "var(--acc)" }} />}
              </span>
              <span>
                <span className="block text-ink font-[var(--font-title)] text-lg">{AI_MODELS[m].name}</span>
                <span className="block text-sm text-ink-dim">{AI_MODELS[m].desc}</span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
