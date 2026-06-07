"use client";

import { useState } from "react";
import { PageHeader } from "@/src/components/PageHeader";
import { useDiceStore } from "@/src/store/dice";
import {
  DIE_SIDES,
  type DieSide,
  type Advantage,
  type RollResult,
  type ChaosResult,
  emptyCounts,
  roll,
  rollChaos,
} from "@/src/lib/dice";

const ADV_OPTS: { id: Advantage; label: string }[] = [
  { id: "dis", label: "Desventaja" },
  { id: "none", label: "Normal" },
  { id: "adv", label: "Ventaja" },
];

export default function DicePage() {
  const [counts, setCounts] = useState(emptyCounts());
  const [mod, setMod] = useState(0);
  const [adv, setAdv] = useState<Advantage>("none");
  const [result, setResult] = useState<RollResult | null>(null);
  const [tab, setTab] = useState<"std" | "chaos">("std");
  const [chaos, setChaos] = useState<ChaosResult | null>(null);

  const history = useDiceStore((s) => s.history);
  const pushHistory = useDiceStore((s) => s.push);
  const clearHistory = useDiceStore((s) => s.clear);

  const totalDice = DIE_SIDES.reduce((a, s) => a + counts[s], 0);

  const inc = (s: DieSide, d: number) =>
    setCounts((c) => ({ ...c, [s]: Math.max(0, c[s] + d) }));

  const clearDice = () => {
    setCounts(emptyCounts());
    setMod(0);
    setResult(null);
  };

  const doRoll = () => {
    if (totalDice === 0) return;
    const r = roll(counts, mod, adv);
    setResult(r);
    pushHistory({ formula: r.formula, total: r.total, ts: Date.now() });
  };

  return (
    <div className="page" data-tool="dice">
      <PageHeader toolId="dice" kicker="⚂  En la mesa" />

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["std", "chaos"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="btn"
            style={{
              background: tab === t ? "color-mix(in srgb, var(--acc) 18%, transparent)" : "transparent",
              borderColor: tab === t ? "var(--acc)" : "var(--line-bright)",
              color: tab === t ? "var(--acc)" : "var(--ink-dim)",
            }}
          >
            {t === "std" ? "Tiradas" : "Dados del Caos"}
          </button>
        ))}
      </div>

      {tab === "std" ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            {/* Dice grid */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {DIE_SIDES.map((s) => (
                <button
                  key={s}
                  onClick={() => inc(s, 1)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    inc(s, -1);
                  }}
                  className="card relative flex flex-col items-center justify-center gap-1 py-4 min-h-[72px] transition-transform active:scale-95 focus-ring"
                  style={{ borderColor: counts[s] > 0 ? "var(--acc)" : "var(--line)" }}
                  aria-label={`Añadir d${s}`}
                >
                  <span className="font-[var(--font-display)] text-lg" style={{ color: "var(--acc)" }}>
                    d{s}
                  </span>
                  {counts[s] > 0 && (
                    <span
                      className="absolute -top-2 -right-2 grid place-items-center w-6 h-6 rounded-full text-xs font-bold"
                      style={{ background: "var(--acc)", color: "#1a0f1a" }}
                    >
                      {counts[s]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Modifier + advantage */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="label mb-0">Mod</span>
                <button className="btn btn-ghost !px-3" onClick={() => setMod((m) => Math.max(-99, m - 1))}>
                  −
                </button>
                <span className="font-mono text-xl w-12 text-center" style={{ color: "var(--acc)" }}>
                  {mod >= 0 ? "+" : ""}
                  {mod}
                </span>
                <button className="btn btn-ghost !px-3" onClick={() => setMod((m) => Math.min(99, m + 1))}>
                  +
                </button>
              </div>

              <div className="flex rounded-md overflow-hidden border" style={{ borderColor: "var(--line-bright)" }}>
                {ADV_OPTS.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setAdv(o.id)}
                    className="px-3 min-h-[44px] text-sm font-mono transition-colors"
                    style={{
                      background: adv === o.id ? "color-mix(in srgb, var(--acc) 20%, transparent)" : "transparent",
                      color: adv === o.id ? "var(--acc)" : "var(--ink-soft)",
                    }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Roll / clear */}
            <div className="flex gap-3">
              <button className="btn btn-primary flex-1" disabled={totalDice === 0} onClick={doRoll}>
                Tirar ({totalDice})
              </button>
              <button className="btn btn-ghost" onClick={clearDice}>
                Limpiar
              </button>
            </div>

            {/* Result */}
            {result && (
              <div className="card text-center">
                <div
                  className="font-[var(--font-display)] font-black leading-none"
                  style={{
                    fontSize: "clamp(48px, 14vw, 88px)",
                    color: result.crit ? "var(--emerald)" : result.fumble ? "var(--blood)" : "var(--acc)",
                  }}
                >
                  {result.total}
                </div>
                <div className="font-mono text-sm text-ink-soft mt-1">{result.formula}</div>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {result.breakdown.map((b, i) => (
                    <span
                      key={i}
                      className="font-mono text-sm px-2 py-1 rounded border"
                      style={{
                        borderColor: "var(--line-bright)",
                        opacity: b.dropped ? 0.35 : 1,
                        textDecoration: b.dropped ? "line-through" : "none",
                        color:
                          !b.dropped && b.val === b.sides && b.sides === 20
                            ? "var(--emerald)"
                            : !b.dropped && b.val === 1 && b.sides === 20
                              ? "var(--blood)"
                              : "var(--ink)",
                      }}
                    >
                      {b.val}
                      <sub className="opacity-50">d{b.sides}</sub>
                    </span>
                  ))}
                </div>
                {result.crit && <div className="mt-3 tag">¡Crítico!</div>}
                {result.fumble && <div className="mt-3 tag">Pifia</div>}
              </div>
            )}
          </div>

          {/* History */}
          <aside className="card h-fit">
            <div className="flex items-center justify-between mb-3">
              <span className="label mb-0">Historial</span>
              {history.length > 0 && (
                <button className="text-xs text-ink-soft hover:text-ink" onClick={clearHistory}>
                  Borrar
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-ink-soft text-sm">Aún no has tirado nada.</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {history.map((h) => (
                  <li key={h.ts} className="flex items-baseline justify-between gap-3 text-sm border-b pb-1.5" style={{ borderColor: "var(--line)" }}>
                    <span className="font-mono text-ink-soft truncate">{h.formula || "—"}</span>
                    <span className="font-[var(--font-display)] text-lg" style={{ color: "var(--acc)" }}>
                      {h.total}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      ) : (
        // ===== Dados del Caos =====
        <div className="max-w-2xl">
          <p className="page-sub mb-4">
            Tira cuando el destino deba decidir. El nivel de la perturbación va de un leve
            susurro a una sacudida que reescribe el mundo.
          </p>
          <button className="btn btn-primary w-full sm:w-auto mb-6" onClick={() => setChaos(rollChaos())}>
            Invocar el Caos
          </button>
          {chaos && (
            <div className="card" style={{ borderColor: chaos.tier.color }}>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="grid place-items-center w-12 h-12 rounded-full font-[var(--font-display)] font-bold text-xl"
                  style={{ background: chaos.tier.color + "22", color: chaos.tier.color, border: `1px solid ${chaos.tier.color}` }}
                >
                  {chaos.tier.num}
                </span>
                <div>
                  <div className="font-[var(--font-display)] text-xl" style={{ color: chaos.tier.color }}>
                    {chaos.tier.name}
                  </div>
                  <div className="text-ink-soft text-sm italic">{chaos.tier.flavor}</div>
                </div>
              </div>
              <h3 className="font-[var(--font-title)] text-lg text-ink mb-1">{chaos.event.title}</h3>
              <p className="text-ink-dim">{chaos.event.text}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
