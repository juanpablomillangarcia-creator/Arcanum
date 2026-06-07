"use client";

import { useState } from "react";
import { PageHeader } from "@/src/components/PageHeader";
import { ORACLE } from "@/src/data/oracle";
import { askOracle, drawFromTable, type Odds, type OracleAnswer } from "@/src/lib/oracle";

const ODDS: { id: Odds; label: string }[] = [
  { id: "unlikely", label: "Improbable" },
  { id: "even", label: "50 / 50" },
  { id: "likely", label: "Probable" },
];

export default function OraclePage() {
  const [odds, setOdds] = useState<Odds>("even");
  const [answer, setAnswer] = useState<OracleAnswer | null>(null);
  const [draws, setDraws] = useState<Record<string, string>>({});

  const handleDraw = (t: (typeof ORACLE.tables)[number]) =>
    setDraws((d) => ({
      ...d,
      [t.id]: t.gen ? t.gen() : drawFromTable(t.id, t.list ?? [], d[t.id]),
    }));

  return (
    <div className="page" data-tool="oracle">
      <PageHeader toolId="oracle" kicker="❂  En la mesa" />

      {/* Yes / No oracle */}
      <section className="card mb-8">
        <h2 className="label mb-3">El sí/no del destino</h2>
        <div className="flex rounded-md overflow-hidden border mb-4 w-full sm:w-fit" style={{ borderColor: "var(--line-bright)" }}>
          {ODDS.map((o) => (
            <button
              key={o.id}
              onClick={() => setOdds(o.id)}
              className="flex-1 sm:flex-none px-4 min-h-[44px] text-sm font-mono transition-colors"
              style={{
                background: odds === o.id ? "color-mix(in srgb, var(--acc) 20%, transparent)" : "transparent",
                color: odds === o.id ? "var(--acc)" : "var(--ink-soft)",
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
        <button className="btn btn-primary w-full sm:w-auto" onClick={() => setAnswer(askOracle(odds))}>
          Preguntar al Oráculo
        </button>
        {answer && (
          <div className="mt-4 text-center">
            <div className="font-[var(--font-display)]" style={{ fontSize: "clamp(28px, 8vw, 48px)", color: "var(--acc)" }}>
              {answer.result}
            </div>
            <div className="font-mono text-xs text-ink-soft mt-1">d20 = {answer.roll}</div>
            {answer.twist && <div className="mt-2 tag">{answer.twist}</div>}
          </div>
        )}
      </section>

      {/* Improvisation tables */}
      <h2 className="font-mono text-[11px] tracking-[0.3em] uppercase text-ink-soft mb-4">
        Tablas de improvisación
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ORACLE.tables.map((t) => (
          <div key={t.id} className="card flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl" style={{ color: "var(--acc)" }}>{t.icon}</span>
              <span className="font-[var(--font-title)] text-base text-ink">{t.title}</span>
            </div>
            <p className="text-ink-dim text-[15px] flex-1 min-h-[3.5rem]">
              {draws[t.id] ?? "Pulsa «Tirar» para consultar…"}
            </p>
            <button className="btn btn-acc mt-3 self-start" onClick={() => handleDraw(t)}>
              Tirar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
