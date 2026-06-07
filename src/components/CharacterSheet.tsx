"use client";

import {
  type Character,
  attrMod, modStr, getProfBonus,
  calcHP, calcInit, isCasterClass, getSpellSlots,
  ATTR_KEYS, ATTR_NAMES,
} from "@/src/lib/character";

export function CharacterSheet({ pc }: { pc: Character }) {
  const conMod = pc.attrs.con != null ? attrMod(pc.attrs.con) : 0;
  const dexMod = pc.attrs.des != null ? attrMod(pc.attrs.des) : 0;
  const hp = calcHP(pc.class, pc.level, conMod);
  const init = calcInit(dexMod);
  const prof = getProfBonus(pc.level);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <h2 className="font-[var(--font-display)] text-2xl text-ink">
          {pc.name || "Sin nombre"}
        </h2>
        {pc.race && <span className="text-sm text-ink-dim">{pc.race}</span>}
      </div>

      {pc.class && (
        <div className="text-sm text-ink-dim">
          {pc.class} {pc.subclass ? `(${pc.subclass})` : ""} · Nivel {pc.level}
          {pc.alignment && ` · ${pc.alignment}`}
        </div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {ATTR_KEYS.map((key) => {
          const v = pc.attrs[key];
          return (
            <div key={key} className="text-center card !p-2">
              <div className="font-[var(--font-mono)] text-[10px] text-ink-soft">{ATTR_NAMES[key]}</div>
              <div className="font-[var(--font-display)] text-lg text-ink">{v ?? "—"}</div>
              <div className="text-xs" style={{ color: "var(--acc)" }}>
                {v != null ? modStr(v) : "+0"}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div className="card !p-2 text-center">
          <div className="label mb-0 !text-[10px]">PG</div>
          <div className="font-[var(--font-display)] text-xl text-ink">{hp}</div>
        </div>
        <div className="card !p-2 text-center">
          <div className="label mb-0 !text-[10px]">CA</div>
          <div className="font-[var(--font-display)] text-xl text-ink">—</div>
        </div>
        <div className="card !p-2 text-center">
          <div className="label mb-0 !text-[10px]">Iniciativa</div>
          <div className="font-[var(--font-display)] text-xl text-ink">{init >= 0 ? "+" : ""}{init}</div>
        </div>
        <div className="card !p-2 text-center">
          <div className="label mb-0 !text-[10px]">Comp.</div>
          <div className="font-[var(--font-display)] text-xl text-ink">+{prof}</div>
        </div>
        <div className="card !p-2 text-center">
          <div className="label mb-0 !text-[10px]">Velocidad</div>
          <div className="font-[var(--font-display)] text-xl text-ink">9 m</div>
        </div>
      </div>

      {pc.skills.length > 0 && (
        <div>
          <div className="label">Competencias</div>
          <div className="flex flex-wrap gap-1">
            {pc.skills.map((s) => (
              <span key={s} className="tag !text-[10px]">{s}</span>
            ))}
          </div>
        </div>
      )}

      {isCasterClass(pc.class) && (
        <div>
          <div className="label">Espacios de conjuro</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(getSpellSlots(pc.class, pc.level)).map(([lvl, slots]) => (
              <span key={lvl} className="tag !text-[10px]">
                N{lvl}: {slots}
              </span>
            ))}
          </div>
        </div>
      )}

      {pc.background && (
        <div className="text-sm">
          <span className="label inline mb-0">Trasfondo · </span>
          <span className="text-ink-dim">{pc.background === "Personalizado" ? pc.backgroundCustom : pc.background}</span>
        </div>
      )}

      {pc.appearance && (
        <div className="text-sm">
          <span className="label inline mb-0">Aspecto · </span>
          <span className="text-ink-dim">{pc.appearance}</span>
        </div>
      )}
    </div>
  );
}
