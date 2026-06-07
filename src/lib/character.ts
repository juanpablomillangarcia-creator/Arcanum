import { SRD_DATA, type SrdEntry } from "@/src/data/srd";
import {
  STANDARD_ARRAY, POINT_BUY_COSTS, POINT_BUY_MAX, POINT_BUY_BUDGET,
  getProfBonus, attrMod, modStr,
  ATTR_KEYS, ATTR_NAMES, type AttrKey,
  SKILLS, CASTER_CLASSES, HIT_DICE, SPELL_SLOTS,
  ALIGNMENTS, BACKGROUNDS, RACE_ICONS, CLASS_ICONS,
} from "@/src/data/character-tables";

export type { AttrKey };
export { attrMod, modStr, getProfBonus };
export {
  ATTR_KEYS, ATTR_NAMES, SKILLS, ALIGNMENTS, BACKGROUNDS,
  STANDARD_ARRAY, POINT_BUY_BUDGET, POINT_BUY_MAX,
  RACE_ICONS, CLASS_ICONS,
};

export interface PCAttrs {
  fue: number | null;
  des: number | null;
  con: number | null;
  int: number | null;
  sab: number | null;
  car: number | null;
}

export type AttrMethod = "array" | "roll" | "buy" | "manual";

export interface Character {
  id: string;
  name: string;
  alignment: string;
  race: string | null;
  subrace: string | null;
  class: string | null;
  subclass: string | null;
  level: number;
  attrMethod: AttrMethod;
  attrs: PCAttrs;
  attrPool: number[] | null;
  pbPoints: number;
  skills: string[];
  background: string;
  backgroundCustom: string;
  equipment: Record<string, string>;
  age: string;
  appearance: string;
  backstory: string;
  extraLanguages: string;
  createdAt: string;
}

export function makeBlankCharacter(): Character {
  return {
    id: "pc-" + Date.now(),
    name: "",
    alignment: "",
    race: null,
    subrace: null,
    class: null,
    subclass: null,
    level: 1,
    attrMethod: "array",
    attrs: { fue: null, des: null, con: null, int: null, sab: null, car: null },
    attrPool: null,
    pbPoints: POINT_BUY_BUDGET,
    skills: [],
    background: "",
    backgroundCustom: "",
    equipment: {},
    age: "",
    appearance: "",
    backstory: "",
    extraLanguages: "",
    createdAt: new Date().toISOString(),
  };
}

export function getRaces(): SrdEntry[] {
  return SRD_DATA.filter((e) => e.type === "raza").sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function getClasses(): SrdEntry[] {
  return SRD_DATA.filter((e) => e.type === "clase").sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function getSubraces(raceName: string): string[] {
  const race = SRD_DATA.find((e) => e.type === "raza" && e.name === raceName);
  if (!race?.sections) return [];
  const subraceSection = race.sections.find((s) => s.t === "Subrazas" || s.t.includes("SUBRAZA"));
  if (!subraceSection) return [];
  const subs = new Set<string>();
  for (const s of race.sections) {
    const m = s.t.match(/SUBRAZA:\s*(.+?)(?:\s*━━━|$)/);
    if (m) subs.add(m[1].trim());
  }
  return Array.from(subs);
}

export function getSubclasses(className: string): string[] {
  const cls = SRD_DATA.find((e) => e.type === "clase" && e.name === className);
  if (!cls?.sections) return [];
  const subs = new Set<string>();
  for (const s of cls.sections) {
    if (s.t.includes("Arquetipo") || s.t.includes("Subclase") || s.t.includes("Tradición") || s.t.includes("Senda") || s.t.includes("Juramento") || s.t.includes("Conclave") || s.t.includes("Círculo") || s.t.includes("Camino")) {
      const m = s.t.match(/:\s*(.+?)(?:\s*$)/);
      if (m) subs.add(m[1].trim());
    }
  }
  return Array.from(subs);
}

export function roll4d6DropLowest(): number[] {
  const results: number[] = [];
  for (let i = 0; i < 6; i++) {
    const rolls = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ].sort((a, b) => a - b);
    results.push(rolls[1] + rolls[2] + rolls[3]);
  }
  return results.sort((a, b) => b - a);
}

export function pointBuyCost(score: number): number {
  if (score < 8) return 0;
  return POINT_BUY_COSTS[score] ?? 999;
}

export function pointBuyTotal(attrs: PCAttrs): number {
  let total = 0;
  for (const key of ATTR_KEYS) {
    const v = attrs[key];
    if (v != null && v >= 8 && v <= POINT_BUY_MAX) {
      total += pointBuyCost(v);
    }
  }
  return total;
}

export function calcHP(cls: string | null, level: number, conMod: number): number {
  if (!cls) return 0;
  const hitDie = HIT_DICE[cls] || "d8";
  const dieSize = parseInt(hitDie.replace("d", "")) || 8;
  return dieSize + conMod + Math.max(0, level - 1) * (Math.floor(dieSize / 2) + 1 + conMod);
}

export function calcInit(dexMod: number): number {
  return dexMod;
}

export function isCasterClass(cls: string | null): boolean {
  return cls != null && CASTER_CLASSES.includes(cls);
}

export function getSpellSlots(cls: string | null, level: number): Record<string, number> {
  if (!cls || !isCasterClass(cls)) return {};
  const halfCasters = ["Paladín", "Explorador"];
  const effectiveLevel = halfCasters.includes(cls) ? Math.max(1, Math.floor(level / 2)) : level;
  return SPELL_SLOTS[effectiveLevel] || {};
}

export function getSpellsForClass(className: string, maxLevel: number): SrdEntry[] {
  const classLower = className.toLowerCase();
  return SRD_DATA.filter((e) => {
    if (e.type !== "hechizo") return false;
    const text = (e.text || "").toLowerCase();
    const meta = (e.meta || "").toLowerCase();
    if (!text.includes(classLower) && !meta.includes(classLower)) return false;
    const subtype = e.subtype;
    if (subtype === "truco") return true;
    const lvl = parseInt(subtype || "0");
    return lvl <= maxLevel;
  });
}

export function getRaceSections(raceName: string, subraceName: string | null): SrdEntry["sections"] {
  const race = SRD_DATA.find((e) => e.type === "raza" && e.name === raceName);
  if (!race?.sections) return [];
  if (!subraceName) return race.sections.filter((s) => !s.t.includes("SUBRAZA"));
  return race.sections.filter((s) => {
    if (s.t.includes("SUBRAZA")) return s.t.includes(subraceName);
    return true;
  });
}

export function getClassSections(className: string, subclassName: string | null, level: number): SrdEntry["sections"] {
  const cls = SRD_DATA.find((e) => e.type === "clase" && e.name === className);
  if (!cls?.sections) return [];
  return cls.sections.filter((s) => {
    if (s.t.includes("Nivel") && /\d+/.test(s.t)) {
      const lvlMatch = s.t.match(/Nivel\s+(\d+)/);
      if (lvlMatch) {
        const reqLevel = parseInt(lvlMatch[1]);
        if (reqLevel > level) return false;
      }
    }
    return true;
  });
}
