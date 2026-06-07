// Dice engine — ported from arcanum-41.html (rollNormal / renderResult, ~line 9432).
// Pure functions, shared by the Dice tool, Oracle, and generators.

import { CHAOS_TIERS, type ChaosTier, type ChaosEvent } from "@/src/data/chaos";

export const DIE_SIDES = [4, 6, 8, 10, 12, 20, 100] as const;
export type DieSide = (typeof DIE_SIDES)[number];
export type DiceCounts = Record<DieSide, number>;
export type Advantage = "none" | "adv" | "dis";

export const emptyCounts = (): DiceCounts => ({ 4: 0, 6: 0, 8: 0, 10: 0, 12: 0, 20: 0, 100: 0 });

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

export interface DieResult { val: number; sides: number; dropped?: boolean; }
export interface RollResult {
  total: number;
  breakdown: DieResult[];
  formula: string;
  crit: boolean;
  fumble: boolean;
}

export function roll(counts: DiceCounts, mod: number, adv: Advantage): RollResult {
  const breakdown: DieResult[] = [];
  let total = 0;
  const formulaParts: string[] = [];

  // Special advantage/disadvantage handling when rolling exactly one d20.
  if (adv !== "none" && counts[20] === 1) {
    const r1 = randInt(1, 20);
    const r2 = randInt(1, 20);
    const keep = adv === "adv" ? Math.max(r1, r2) : Math.min(r1, r2);
    const drop = keep === r1 ? r2 : r1;
    breakdown.push({ val: keep, sides: 20 });
    breakdown.push({ val: drop, sides: 20, dropped: true });
    total += keep;
    formulaParts.push(`d20${adv === "adv" ? " [V]" : " [D]"}`);

    for (const s of DIE_SIDES) {
      if (s === 20) continue;
      const c = counts[s];
      for (let i = 0; i < c; i++) {
        const v = randInt(1, s);
        breakdown.push({ val: v, sides: s });
        total += v;
      }
      if (c > 0) formulaParts.push(`${c}d${s}`);
    }
  } else {
    for (const s of DIE_SIDES) {
      const c = counts[s];
      if (c <= 0) continue;
      for (let i = 0; i < c; i++) {
        const v = randInt(1, s);
        breakdown.push({ val: v, sides: s });
        total += v;
      }
      formulaParts.push(`${c}d${s}`);
    }
  }

  total += mod;
  const formula =
    formulaParts.join(" + ") + (mod !== 0 ? ` ${mod >= 0 ? "+" : "−"} ${Math.abs(mod)}` : "");

  // Crit / fumble only meaningful with a single kept d20.
  const kept = breakdown.filter((b) => !b.dropped);
  const crit = kept.length === 1 && kept[0].sides === 20 && kept[0].val === 20;
  const fumble = kept.length === 1 && kept[0].sides === 20 && kept[0].val === 1;

  return { total, breakdown, formula, crit, fumble };
}

// ----- Dados del Caos -----
export interface ChaosResult { tier: ChaosTier; event: ChaosEvent; }

export function rollChaos(): ChaosResult {
  const totalWeight = CHAOS_TIERS.reduce((a, t) => a + t.weight, 0);
  let r = randInt(1, totalWeight);
  let tier = CHAOS_TIERS[0];
  for (const t of CHAOS_TIERS) {
    r -= t.weight;
    if (r <= 0) {
      tier = t;
      break;
    }
  }
  return { tier, event: pick(tier.events) };
}
