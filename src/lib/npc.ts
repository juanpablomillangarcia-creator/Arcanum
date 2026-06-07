// NPC procedural generation — ported from arcanum-41.html (npcGenerateRandom, ~line 26199).

import { randInt, pick } from "@/src/lib/dice";
import {
  NPC_NAMES, NPC_SURNAMES, NPC_APPEARANCES, NPC_TRAITS, NPC_IDEALS,
  NPC_BONDS, NPC_FLAWS, NPC_SECRETS, NPC_MANNERISMS, NPC_VOICES,
  NPC_HOOKS_TEMPLATES, NPC_ROLE_PROFILES, type RoleProfile,
} from "@/src/data/npc-tables";

export interface NpcAttrs { fue: number; des: number; con: number; int: number; sab: number; car: number; }
export interface Npc {
  name: string; race: string; gender: string; age: number;
  role: string; alignment: string; level: number; cr: string;
  hp: number; hpFormula: string; ac: number; speed: number;
  attrs: NpcAttrs; appearance: string; voice: string; mannerism: string;
  trait: string; ideal: string; bond: string; flaw: string; secret: string; hooks: string[];
}

export const NPC_RACES = ["Humano", "Elfo", "Enano", "Mediano", "Gnomo", "Semielfo", "Semiorco", "Dracónido", "Tiefling"];
export const NPC_ROLES = Object.keys(NPC_ROLE_PROFILES);
export const NPC_ALIGNMENTS = ["Legal Bueno", "Neutral Bueno", "Caótico Bueno", "Legal Neutral", "Neutral", "Caótico Neutral", "Legal Malvado", "Neutral Malvado", "Caótico Malvado"];

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const mod = (v: number) => Math.floor((v - 10) / 2);

function armorBaseCA(armor: string, dexMod: number): number {
  switch (armor) {
    case "ninguna": return 10 + dexMod;
    case "cuero": return 11 + dexMod;
    case "cuero_tachonado": return 12 + dexMod;
    case "cota_malla": return 16;
    case "completa": return 18;
    default: return 10 + dexMod;
  }
}

function rollHP(level: number, hitDie: number, conMod: number): number {
  let hp = hitDie + conMod;
  for (let i = 2; i <= level; i++) hp += randInt(Math.floor(hitDie / 2) + 1, hitDie) + conMod;
  return Math.max(1, hp);
}

function calcCR(level: number, crFactor: number): string {
  const value = level * crFactor;
  if (value < 0.25) return "0";
  if (value < 0.5) return "1/8";
  if (value < 1) return "1/4";
  if (value < 2) return "1/2";
  return String(Math.max(1, Math.round(value)));
}

function genAttrs(level: number, profile: RoleProfile): NpcAttrs {
  const baseByLevel = 9 + Math.min(8, Math.floor(level / 2));
  const variance = 3;
  const out = {} as NpcAttrs;
  (["fue", "des", "con", "int", "sab", "car"] as const).forEach((a) => {
    let v = baseByLevel + randInt(-variance, variance);
    if (profile.primaryAttrs.includes(a)) v += randInt(2, 4);
    if (profile.weakAttrs.includes(a)) v -= randInt(1, 3);
    out[a] = Math.max(3, Math.min(20, v));
  });
  return out;
}

const raceSpeed = (race: string) => (["Enano", "Mediano", "Gnomo"].includes(race) ? 7.5 : 9);

export interface NpcParams {
  race: string; gender: string; role: string; alignment: string; level: string;
  [k: string]: string;
}

export function generateNpc(p: NpcParams): Npc {
  const race = p.race || pick(NPC_RACES);
  const gender = p.gender || pick(["masculino", "femenino", "no binario"]);
  const role = p.role || pick(NPC_ROLES);
  const alignment = p.alignment || pick(NPC_ALIGNMENTS);

  let level: number;
  switch (p.level) {
    case "random_any": level = randInt(1, 20); break;
    case "random_low": level = randInt(1, 5); break;
    case "random_mid": level = randInt(5, 10); break;
    case "random_high": level = randInt(10, 15); break;
    case "random_epic": level = randInt(15, 20); break;
    default: level = parseInt(p.level) || 5;
  }
  level = Math.max(1, Math.min(20, level));

  const profile = NPC_ROLE_PROFILES[role] || NPC_ROLE_PROFILES.guardia;
  const attrs = genAttrs(level, profile);
  const conMod = mod(attrs.con);
  const dexMod = mod(attrs.des);

  const hp = rollHP(level, profile.hitDie, conMod);
  const hpFormula = `${level}d${profile.hitDie}${conMod !== 0 ? (conMod > 0 ? "+" : "") + conMod * level : ""}`;
  let ac = armorBaseCA(profile.armor, dexMod);
  if (profile.shield) ac += 2;
  if (profile.armor !== "completa" && profile.armor !== "cota_malla") ac += randInt(-1, 1);
  ac = Math.max(8, ac);

  const namesByRace = NPC_NAMES[race] || NPC_NAMES.Humano;
  const genderKey = gender === "femenino" ? "femenino" : gender === "masculino" ? "masculino" : "no";
  const firstName = pick(namesByRace[genderKey] || namesByRace.masculino);
  const fullName = Math.random() < 0.7 ? `${firstName} ${pick(NPC_SURNAMES)}` : firstName;

  const ageRanges: Record<string, [number, number]> = {
    Humano: [18, 70], Elfo: [80, 600], Enano: [40, 300], Mediano: [25, 120],
    Gnomo: [40, 400], Semielfo: [25, 180], Semiorco: [18, 70], Dracónido: [20, 80], Tiefling: [20, 80],
  };
  const ar = ageRanges[race] || [18, 70];

  const pool = [...NPC_HOOKS_TEMPLATES];
  const hooks: string[] = [];
  for (let i = 0; i < 2 && pool.length; i++) hooks.push(pool.splice(randInt(0, pool.length - 1), 1)[0]);

  return {
    name: fullName, race, gender, age: randInt(ar[0], ar[1]),
    role: cap(role), alignment, level, cr: calcCR(level, profile.crFactor),
    hp, hpFormula, ac, speed: raceSpeed(race), attrs,
    appearance: pick(NPC_APPEARANCES), voice: pick(NPC_VOICES), mannerism: pick(NPC_MANNERISMS),
    trait: pick(NPC_TRAITS), ideal: pick(NPC_IDEALS), bond: pick(NPC_BONDS),
    flaw: pick(NPC_FLAWS), secret: pick(NPC_SECRETS), hooks,
  };
}

export const attrMod = (v: number) => {
  const m = mod(v);
  return m >= 0 ? `+${m}` : `${m}`;
};
