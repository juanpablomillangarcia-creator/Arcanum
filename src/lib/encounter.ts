import { crToXP, crSortValue, type CreatureWithSource } from "@/src/lib/bestiary";
import {
  getEncounterMultiplier,
  getPartyThresholds,
  type Difficulty,
  type XPThresholds,
} from "@/src/data/encounter-tables";

export interface EncounterCreature {
  id: string;
  name: string;
  cr: string;
  qty: number;
  meta: string;
}

export interface EncounterResult {
  creatures: EncounterCreature[];
  totalMonsters: number;
  rawXP: number;
  mult: number;
  adjustedXP: number;
  thresholds: XPThresholds;
  difficulty: string;
  narrative?: string;
}

export interface EncounterParams {
  partySize: number;
  partyLevel: number;
  difficulty: Difficulty;
  minEnemies: number;
  maxEnemies: number;
  filterType: string;
  filterSource: string;
}

export function calculateEncounterDifficulty(
  creatures: EncounterCreature[],
  partySize: number,
  partyLevel: number,
): Omit<EncounterResult, "creatures" | "narrative"> {
  const totalMonsters = creatures.reduce((s, c) => s + c.qty, 0);
  const rawXP = creatures.reduce((s, c) => s + crToXP(c.cr) * c.qty, 0);
  const mult = getEncounterMultiplier(totalMonsters, partySize);
  const adjustedXP = Math.round(rawXP * mult);
  const thresholds = getPartyThresholds(partySize, partyLevel);

  let difficulty = "trivial";
  if (adjustedXP >= thresholds.deadly) difficulty = "deadly";
  else if (adjustedXP >= thresholds.hard) difficulty = "hard";
  else if (adjustedXP >= thresholds.medium) difficulty = "medium";
  else if (adjustedXP >= thresholds.easy) difficulty = "easy";

  return { totalMonsters, rawXP, mult, adjustedXP, thresholds, difficulty };
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function tryHomogeneous(
  pool: CreatureWithSource[],
  numEnemies: number,
  difficulty: Difficulty,
): EncounterCreature[] | null {
  const targetSinglePartXP = difficulty === "deadly" ? 8000 : 4000;
  const reasonable = pool.filter((c) => {
    const xp = crToXP(c.cr);
    return xp > 0 && xp * numEnemies < targetSinglePartXP * 8;
  });
  if (!reasonable.length) return null;
  const c = randomPick(reasonable);
  return [{ id: c.id, name: c.name, cr: c.cr, qty: numEnemies, meta: c.meta || "" }];
}

function tryMixed(
  pool: CreatureWithSource[],
  numEnemies: number,
): EncounterCreature[] | null {
  const numTypes = Math.min(numEnemies, randInt(2, 3));
  const chosen: CreatureWithSource[] = [];
  const used = new Set<string>();
  for (let i = 0; i < numTypes; i++) {
    const remaining = pool.filter((c) => !used.has(c.id));
    if (!remaining.length) break;
    const c = randomPick(remaining);
    used.add(c.id);
    chosen.push(c);
  }
  if (chosen.length < 2) return null;

  chosen.sort((a, b) => crSortValue(b.cr) - crSortValue(a.cr));
  const result: EncounterCreature[] = [];
  let remaining = numEnemies;

  const bossQty = crSortValue(chosen[0].cr) >= 5 ? 1 : randInt(1, 2);
  result.push({ id: chosen[0].id, name: chosen[0].name, cr: chosen[0].cr, qty: bossQty, meta: chosen[0].meta || "" });
  remaining -= bossQty;

  for (let i = 1; i < chosen.length; i++) {
    const isLast = i === chosen.length - 1;
    const qty = isLast ? remaining : randInt(1, Math.max(1, Math.floor(remaining / 2)));
    if (qty <= 0) continue;
    result.push({ id: chosen[i].id, name: chosen[i].name, cr: chosen[i].cr, qty, meta: chosen[i].meta || "" });
    remaining -= qty;
    if (remaining <= 0) break;
  }
  return result.filter((r) => r.qty > 0);
}

export function generateEncounter(
  params: EncounterParams,
  allCreatures: CreatureWithSource[],
): EncounterResult | null {
  let pool = allCreatures.filter(
    (c) => c.cr !== undefined && c.cr !== null && c.cr !== "" && crToXP(c.cr) >= 0,
  );

  if (params.filterType) {
    pool = pool.filter((c) => {
      const t = (c.creatureType || "").toLowerCase();
      return t.includes(params.filterType.toLowerCase());
    });
  }
  if (params.filterSource) {
    pool = pool.filter((c) => c.source === params.filterSource);
  }
  if (!pool.length) return null;

  const lvl = params.partyLevel;
  const crMax = lvl + (params.difficulty === "deadly" ? 3 : 1);
  const crMin = lvl >= 5 ? Math.max(0.5, Math.floor(lvl / 4)) : 0;
  const poolByLevel = pool.filter((c) => {
    const v = crSortValue(c.cr);
    return v >= crMin && v <= crMax;
  });
  if (poolByLevel.length >= 3) pool = poolByLevel;

  const t = getPartyThresholds(params.partySize, params.partyLevel);
  let targetXP: number, maxXP: number, minXP: number;
  if (params.difficulty === "easy") {
    minXP = t.easy * 0.9;
    targetXP = (t.easy + t.medium) / 2;
    maxXP = t.medium - 1;
  } else if (params.difficulty === "medium") {
    minXP = t.medium;
    targetXP = (t.medium + t.hard) / 2;
    maxXP = t.hard - 1;
  } else if (params.difficulty === "hard") {
    minXP = t.hard;
    targetXP = (t.hard + t.deadly) / 2;
    maxXP = t.deadly - 1;
  } else {
    minXP = t.deadly;
    targetXP = t.deadly * 1.4;
    maxXP = t.deadly * 2.5;
  }

  const isHomogeneous = Math.random() < 0.6;
  let proposal: EncounterResult | null = null;

  for (let attempt = 0; attempt < 200; attempt++) {
    const numEnemies = randInt(params.minEnemies, params.maxEnemies);
    let candidate: EncounterCreature[] | null;
    if (isHomogeneous || numEnemies === 1) {
      candidate = tryHomogeneous(pool, numEnemies, params.difficulty);
    } else {
      candidate = tryMixed(pool, numEnemies);
    }
    if (!candidate) continue;

    const r = calculateEncounterDifficulty(candidate, params.partySize, params.partyLevel);
    if (r.adjustedXP >= minXP && r.adjustedXP <= maxXP) {
      return { creatures: candidate, ...r };
    }
    if (!proposal || Math.abs(r.adjustedXP - targetXP) < Math.abs(proposal.adjustedXP - targetXP)) {
      proposal = { creatures: candidate, ...r };
    }
  }

  return proposal;
}

export const CREATURE_TYPE_OPTIONS = [
  "", "aberración", "bestia", "celestial", "dragón", "elemental",
  "feérico", "gigante", "humanoide", "infernal", "monstruosidad",
  "no-muerto", "planta", "autómata", "légamo",
];
