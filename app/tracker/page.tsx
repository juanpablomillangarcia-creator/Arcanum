"use client";

import { useState } from "react";
import { PageHeader } from "@/src/components/PageHeader";
import { BottomSheet } from "@/src/components/BottomSheet";
import { useTrackerStore, type Side } from "@/src/store/tracker";
import { TRK_CONDITIONS, CONDITIONS_INFO } from "@/src/data/conditions";

export default function TrackerPage() {
  const s = useTrackerStore();
  const [form, setForm] = useState({ name: "", init: "", hp: "", ca: "", side: "pj" as Side });
  const [condFor, setCondFor] = useState<string | null>(null);

  const active = condFor ? s.combatants.find((c) => c.id === condFor) : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    s.add(form);
    setForm({ name: "", init: "", hp: "", ca: "", side: form.side });
  };

  return (
    <div className="page" data-tool="tracker">
      <PageHeader toolId="tracker" kicker="⚜  En la mesa" />

      {/* Combat bar */}
      <div className="card flex flex-wrap items-center gap-3 mb-6 sticky top-14 md:top-0 z-20">
        <div className="flex items-center gap-2">
          <span className="label mb-0">Ronda</span>
          <span className="font-[var(--font-display)] text-2xl" style={{ color: "var(--acc)" }}>
            {s.round || "—"}
          </span>
        </div>
        <button className="btn btn-primary ml-auto" onClick={s.next}>
          {s.round === 0 ? "Empezar" : "Siguiente turno →"}
        </button>
        <button className="btn btn-ghost" onClick={() => { const n = s.rollInit(); if (n === 0) return; }}>
          Tirar iniciativa
        </button>
        {s.combatants.length > 0 && (
          <button className="btn btn-ghost" onClick={() => { if (confirm("¿Reiniciar el combate?")) s.reset(); }}>
            Reiniciar
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Combatant list */}
        <div className="flex flex-col gap-2 order-2 lg:order-1">
          {s.combatants.length === 0 && (
            <div className="card text-center text-ink-soft">
              Añade combatientes para empezar el seguimiento de iniciativa.
            </div>
          )}
          {s.combatants.map((c, i) => {
            const isActive = i === s.activeIdx && s.round > 0;
            const dead = c.hp != null && c.hp <= 0;
            return (
              <div
                key={c.id}
                className="card flex flex-wrap items-center gap-3 transition-all"
                style={{
                  borderColor: isActive ? "var(--acc)" : "var(--line)",
                  boxShadow: isActive ? "var(--glow-gold)" : "none",
                  opacity: dead ? 0.55 : 1,
                }}
              >
                <span
                  className="grid place-items-center w-11 h-11 rounded-md font-[var(--font-display)] text-lg shrink-0"
                  style={{
                    color: c.side === "enemy" ? "var(--blood)" : "var(--emerald)",
                    background: "var(--bg-void)",
                    border: `1px solid ${c.side === "enemy" ? "var(--blood)" : "var(--emerald)"}`,
                  }}
                >
                  {c.init ?? "—"}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="font-[var(--font-title)] text-lg text-ink truncate">
                    {c.name}
                    {c.ca != null && <span className="text-ink-soft text-sm font-mono ml-2">CA {c.ca}</span>}
                  </div>
                  {c.conditions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {c.conditions.map((cond) => (
                        <span key={cond} className="tag !text-[10px] !px-2 !py-0">{cond}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* HP controls */}
                {c.hp != null && (
                  <div className="flex items-center gap-1">
                    <button className="btn btn-ghost !min-h-[36px] !px-2" onClick={() => s.adjustHp(c.id, -1)}>−</button>
                    <input
                      className="field !w-16 !min-h-[36px] text-center"
                      inputMode="numeric"
                      value={c.hp}
                      onChange={(e) => s.setHp(c.id, parseInt(e.target.value) || 0)}
                    />
                    <span className="text-ink-soft text-sm">/{c.maxHp}</span>
                    <button className="btn btn-ghost !min-h-[36px] !px-2" onClick={() => s.adjustHp(c.id, 1)}>+</button>
                  </div>
                )}

                <div className="flex gap-1">
                  <button className="btn btn-ghost !min-h-[36px] !px-3" onClick={() => setCondFor(c.id)}>
                    Estados
                  </button>
                  <button className="btn btn-ghost !min-h-[36px] !px-3" onClick={() => s.remove(c.id)} aria-label="Eliminar">
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add form */}
        <aside className="card h-fit order-1 lg:order-2">
          <h2 className="label mb-3">Añadir combatiente</h2>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <input className="field" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div className="grid grid-cols-3 gap-2">
              <input className="field" inputMode="numeric" placeholder="Init" value={form.init} onChange={(e) => setForm({ ...form, init: e.target.value })} />
              <input className="field" inputMode="numeric" placeholder="PG" value={form.hp} onChange={(e) => setForm({ ...form, hp: e.target.value })} />
              <input className="field" inputMode="numeric" placeholder="CA" value={form.ca} onChange={(e) => setForm({ ...form, ca: e.target.value })} />
            </div>
            <div className="flex rounded-md overflow-hidden border" style={{ borderColor: "var(--line-bright)" }}>
              {(["pj", "enemy"] as Side[]).map((side) => (
                <button
                  key={side}
                  type="button"
                  onClick={() => setForm({ ...form, side })}
                  className="flex-1 min-h-[44px] text-sm font-mono transition-colors"
                  style={{
                    background: form.side === side ? "color-mix(in srgb, var(--acc) 20%, transparent)" : "transparent",
                    color: form.side === side ? "var(--acc)" : "var(--ink-soft)",
                  }}
                >
                  {side === "pj" ? "Aliado" : "Enemigo"}
                </button>
              ))}
            </div>
            <button type="submit" className="btn btn-primary">Añadir</button>
          </form>
        </aside>
      </div>

      {/* Conditions sheet */}
      <BottomSheet open={!!condFor} onClose={() => setCondFor(null)} title={active ? `Estados — ${active.name}` : "Estados"}>
        <div className="flex flex-wrap gap-2">
          {TRK_CONDITIONS.map((cond) => {
            const on = active?.conditions.includes(cond);
            return (
              <button
                key={cond}
                title={CONDITIONS_INFO[cond]}
                onClick={() => active && s.toggleCondition(active.id, cond)}
                className="px-3 py-2 rounded-md text-sm border transition-colors min-h-[44px]"
                style={{
                  borderColor: on ? "var(--acc)" : "var(--line-bright)",
                  background: on ? "color-mix(in srgb, var(--acc) 18%, transparent)" : "transparent",
                  color: on ? "var(--acc)" : "var(--ink-dim)",
                }}
              >
                {cond}
              </button>
            );
          })}
        </div>
        {active && active.conditions.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {active.conditions.map((cond) => (
              <p key={cond} className="text-sm text-ink-dim">
                <span className="text-ink font-semibold">{cond}:</span> {CONDITIONS_INFO[cond]}
              </p>
            ))}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
