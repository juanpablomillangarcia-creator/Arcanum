// Procedural loot generation, ported from arcanum-41.html (lootGenerate / lootGenCoins).
// Same behavior and data; the per-tool DOM plumbing is replaced by the generator engine.

import {
  LOOT_GEMS, LOOT_GEM_FLAVORS, LOOT_ART, LOOT_ART_FLAVORS,
  LOOT_MUNDANE, LOOT_TRINKETS, LOOT_MAGIC,
} from "@/src/data/loot-tables";

export interface LootCoins { pc: number; pp: number; po: number; ppt: number; }
export interface LootValuable { type: "gema" | "arte"; name: string; value: number; icon: string; }
export interface LootMundane { name: string; icon: string; }
export interface LootMagic { name: string; effect: string; rarity: string; icon: string; }

export interface Loot {
  id: string;
  origin: string;
  source: string;
  wealth: string;
  tier: number;
  title?: string;
  coins: LootCoins;
  valuables: LootValuable[];
  mundane: LootMundane[];
  magic: LootMagic[];
  createdAt: number;
}

export interface LootParams extends Record<string, string> {
  origin: string;
  source: string;
  tier: string;
  wealth: string;
  magic: string; // "1" allow, "" disallow
  desc: string; // AI only
}

export const LOOT_ORIGINS = [
  { value: "cadaver", label: "Cadáver de un enemigo" },
  { value: "cofre", label: "Cofre / alijo escondido" },
  { value: "guarida", label: "Tesoro de guarida" },
  { value: "recompensa", label: "Recompensa de misión" },
  { value: "bolsillos", label: "Bolsillos / hurto" },
  { value: "tienda", label: "Tienda / almacén" },
];

export const LOOT_SOURCES = [
  { value: "random", label: "— Aleatorio —" },
  { value: "humanoide", label: "Humanoide común" },
  { value: "bandido", label: "Bandido / saqueador" },
  { value: "noble", label: "Noble / adinerado" },
  { value: "mago", label: "Mago / erudito" },
  { value: "sacerdote", label: "Sacerdote / culto" },
  { value: "bestia", label: "Bestia / monstruo" },
  { value: "nomuerto", label: "No-muerto" },
  { value: "dragon", label: "Dragón / gran bestia" },
  { value: "gigante", label: "Gigante / aberración" },
];

export const LOOT_TIERS = [
  { value: "0", label: "VD 0-4 / Nivel 1-4" },
  { value: "5", label: "VD 5-10 / Nivel 5-10" },
  { value: "11", label: "VD 11-16 / Nivel 11-16" },
  { value: "17", label: "VD 17+ / Nivel 17+" },
];

export const LOOT_WEALTH = [
  { value: "pobre", label: "Pobre" },
  { value: "normal", label: "Normal" },
  { value: "rico", label: "Rico" },
  { value: "legendario", label: "Legendario" },
];

export const LOOT_ORIGIN_NAMES: Record<string, string> = {
  cadaver: "Cadáver de un enemigo", cofre: "Cofre escondido", guarida: "Tesoro de guarida",
  recompensa: "Recompensa de misión", bolsillos: "Bolsillos / hurto", tienda: "Tienda / almacén",
};
export const LOOT_SOURCE_NAMES: Record<string, string> = {
  humanoide: "humanoide", bandido: "bandido", noble: "noble", mago: "mago", sacerdote: "sacerdote",
  bestia: "bestia", nomuerto: "no-muerto", dragon: "dragón", gigante: "gigante",
};
export const LOOT_RARITY_NAMES: Record<string, string> = {
  comun: "Común", infrecuente: "Infrecuente", raro: "Raro", "muy-raro": "Muy raro", legendario: "Legendario",
};

function pick<T>(a: T[]): T { return a[Math.floor(Math.random() * a.length)]; }
function int(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rollDice(n: number, d: number): number { let s = 0; for (let i = 0; i < n; i++) s += int(1, d); return s; }
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function genCoins(tier: number, mult: number, origin: string): LootCoins {
  let pc = 0, pp = 0, po = 0, ppt = 0;
  const big = origin === "guarida" || origin === "cofre" || origin === "recompensa";
  const scale = big ? 4 : 1;
  if (tier >= 17) {
    po = rollDice(4, 6) * 1000 * scale;
    ppt = rollDice(2, 6) * 100 * scale;
  } else if (tier >= 11) {
    po = rollDice(4, 6) * 100 * scale;
    ppt = rollDice(1, 6) * 10 * scale;
  } else if (tier >= 5) {
    pp = rollDice(2, 6) * 10 * scale;
    po = rollDice(2, 6) * 10 * scale;
  } else {
    pc = rollDice(3, 6) * scale;
    pp = rollDice(2, 6) * scale;
    po = rollDice(1, 6) * scale * (big ? 5 : 1);
  }
  return {
    pc: Math.round(pc * mult),
    pp: Math.round(pp * mult),
    po: Math.round(po * mult),
    ppt: Math.round(ppt * mult),
  };
}

export function generateLoot(p: LootParams): Loot {
  const origin = p.origin || "cadaver";
  let source = p.source || "random";
  if (source === "random") {
    source = pick(["humanoide", "bandido", "noble", "mago", "sacerdote", "bestia", "nomuerto", "dragon", "gigante"]);
  }
  const wealth = p.wealth || "normal";
  const allowMagic = p.magic === "1";
  const tier = parseInt(p.tier) || 5;

  const wealthMult = ({ pobre: 0.4, normal: 1, rico: 2.2, legendario: 4 } as Record<string, number>)[wealth] || 1;

  const coins = genCoins(tier, wealthMult, origin);

  // ---- gemas y arte ----
  const valuables: LootValuable[] = [];
  const wantValuables = origin === "guarida" || origin === "cofre" || origin === "recompensa" ||
    source === "noble" || source === "dragon" || wealth === "rico" || wealth === "legendario";
  if (wantValuables || Math.random() < 0.4) {
    const numGems = Math.max(0, Math.round((tier >= 11 ? int(1, 4) : int(0, 2)) * wealthMult));
    const gemTiers = tier >= 17 ? [1000, 5000] : tier >= 11 ? [500, 1000] : tier >= 5 ? [100, 500] : [10, 50];
    for (let i = 0; i < numGems; i++) {
      const gt = pick(gemTiers);
      const gem = pick(LOOT_GEMS[gt]);
      valuables.push({ type: "gema", name: `${cap(gem)} ${pick(LOOT_GEM_FLAVORS)}`, value: gt, icon: "◆" });
    }
    const numArt = Math.max(0, Math.round((tier >= 11 ? int(0, 2) : int(0, 1)) * wealthMult));
    const artTiers = tier >= 17 ? [2500, 7500] : tier >= 11 ? [750, 2500] : tier >= 5 ? [250, 750] : [25, 250];
    for (let i = 0; i < numArt; i++) {
      const at = pick(artTiers);
      const art = pick(LOOT_ART[at]);
      valuables.push({ type: "arte", name: `${cap(art)}, ${pick(LOOT_ART_FLAVORS)}`, value: at, icon: "♔" });
    }
  }

  // ---- objetos mundanos y baratijas ----
  const mundane: LootMundane[] = [];
  const srcItems = LOOT_MUNDANE[source] || LOOT_MUNDANE.humanoide;
  const numMundane = int(1, 3);
  const usedM = new Set<string>();
  for (let i = 0; i < numMundane; i++) {
    const it = pick(srcItems);
    if (usedM.has(it)) continue;
    usedM.add(it);
    mundane.push({ name: cap(it), icon: "•" });
  }
  if (Math.random() < 0.5) {
    mundane.push({ name: pick(LOOT_TRINKETS), icon: "✧" });
  }

  // ---- objetos mágicos ----
  const magic: LootMagic[] = [];
  if (allowMagic) {
    const base = ({ 0: 0.15, 5: 0.35, 11: 0.6, 17: 0.85 } as Record<number, number>)[tier] ?? 0.35;
    const magicChance = base * (wealth === "legendario" ? 1.6 : wealth === "rico" ? 1.2 : wealth === "pobre" ? 0.5 : 1);
    if (Math.random() < magicChance) {
      const numMagic = tier >= 17 ? int(1, 3) : tier >= 11 ? int(1, 2) : 1;
      let rarities: string[];
      if (tier >= 17) rarities = ["raro", "muy-raro", "muy-raro", "legendario"];
      else if (tier >= 11) rarities = ["infrecuente", "raro", "raro", "muy-raro"];
      else if (tier >= 5) rarities = ["comun", "infrecuente", "infrecuente", "raro"];
      else rarities = ["comun", "comun", "infrecuente"];
      for (let i = 0; i < numMagic; i++) {
        const rar = pick(rarities);
        const item = pick(LOOT_MAGIC[rar]);
        magic.push({ name: item.name, effect: item.effect, rarity: rar, icon: "✦" });
      }
    }
  }

  return {
    id: "loot_" + Date.now(),
    origin, source, wealth, tier,
    coins, valuables, mundane, magic,
    createdAt: Date.now(),
  };
}

export function lootTotalValue(loot: Loot): number {
  let total = loot.coins.pc / 100 + loot.coins.pp / 10 + loot.coins.po + loot.coins.ppt * 10;
  loot.valuables.forEach((v) => (total += v.value));
  return Math.round(total);
}
