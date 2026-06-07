// One-off extractor: slices top-level `const NAME = [...]` / `{...}` literals out of
// arcanum-41.html and writes them verbatim into typed TS data modules.
// Usage: node scripts/extract-data.mjs
//
// This preserves game CONTENT exactly (it is not reformatted), only re-exported.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const html = readFileSync(join(ROOT, "arcanum-41.html"), "utf8");

/** Find `const NAME =` then capture the balanced [...] or {...} literal that follows. */
function extractLiteral(name) {
  const re = new RegExp(`const\\s+${name}\\s*=\\s*`, "g");
  const m = re.exec(html);
  if (!m) throw new Error(`Not found: ${name}`);
  let i = m.index + m[0].length;
  const open = html[i];
  const close = open === "[" ? "]" : open === "{" ? "}" : null;
  if (!close) throw new Error(`${name} is not an array/object literal (got '${open}')`);
  let depth = 0;
  let inStr = null;
  let start = i;
  for (; i < html.length; i++) {
    const c = html[i];
    const prev = html[i - 1];
    if (inStr) {
      if (c === inStr && prev !== "\\") inStr = null;
      continue;
    }
    if (c === "'" || c === '"' || c === "`") {
      inStr = c;
      continue;
    }
    if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) {
        return html.slice(start, i + 1);
      }
    }
  }
  throw new Error(`Unbalanced literal for ${name}`);
}

function write(file, header, body) {
  const out = join(ROOT, "src", "data", file);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, header + body + "\n", "utf8");
  console.log(`✓ ${file}  (${body.length.toLocaleString()} chars)`);
}

// ---- CHAOS_TIERS → chaos.ts ----
{
  const lit = extractLiteral("CHAOS_TIERS");
  const header = `// Extracted verbatim from arcanum-41.html (CHAOS_TIERS). Do not edit by hand.
export interface ChaosEvent { title: string; text: string; }
export interface ChaosTier { num: number; name: string; color: string; weight: number; flavor: string; events: ChaosEvent[]; }

export const CHAOS_TIERS: ChaosTier[] = `;
  write("chaos.ts", header, lit + ";");
}

// ---- SRD_DATA → srd.ts ----
{
  const lit = extractLiteral("SRD_DATA");
  const header = `// Extracted verbatim from arcanum-41.html (SRD_DATA). Do not edit by hand.
export interface SrdSection { t: string; d: string; }
export interface SrdEntry {
  type: string;
  name: string;
  meta?: string;
  subtype?: string;
  text?: string;
  sections?: SrdSection[];
  [k: string]: unknown;
}

export const SRD_DATA: SrdEntry[] = `;
  write("srd.ts", header, lit + ";");
}

// ---- NPC tables → npc-tables.ts ----
{
  const names = [
    "NPC_NAMES", "NPC_SURNAMES", "NPC_APPEARANCES", "NPC_TRAITS", "NPC_IDEALS",
    "NPC_BONDS", "NPC_FLAWS", "NPC_SECRETS", "NPC_MANNERISMS", "NPC_VOICES",
    "NPC_HOOKS_TEMPLATES", "NPC_ROLE_PROFILES",
  ];
  const header = `// Extracted verbatim from arcanum-41.html (NPC generation tables). Do not edit by hand.
export interface RoleProfile { hitDie: number; armor: string; shield: boolean; primaryAttrs: string[]; weakAttrs: string[]; crFactor: number; }
export type NameTable = Record<string, { masculino: string[]; femenino: string[]; no: string[] }>;

`;
  const body = names
    .map((n) => {
      const lit = extractLiteral(n);
      const typed =
        n === "NPC_ROLE_PROFILES" ? ": Record<string, RoleProfile>" :
        n === "NPC_NAMES" ? ": NameTable" :
        ": string[]";
      return `export const ${n}${typed} = ${lit};`;
    })
    .join("\n\n");
  write("npc-tables.ts", header, body);
}

// ---- ORACLE (+ `more` extension) → oracle.ts ----
{
  // Fix one implicit-any in the inline name generator (verbatim content otherwise).
  const base = extractLiteral("ORACLE").replace(/const r=a=>/g, "const r=(a: string[])=>");
  const more = extractLiteral("more");
  const header = `// Extracted verbatim from arcanum-41.html (ORACLE + 'more' extension). Do not edit by hand.
export interface OracleTable { id: string; icon: string; title: string; list?: string[]; gen?: () => string; }
export interface OracleData { odds: string; tables: OracleTable[]; }

const BASE: OracleData = `;
  const body =
    base +
    ";\n\nconst MORE: Record<string, string[]> = " +
    more +
    `;\n\nBASE.tables.forEach((t) => {\n  const extra = MORE[t.id];\n  if (extra && Array.isArray(t.list)) t.list = t.list.concat(extra);\n});\n\nexport const ORACLE = BASE;\n`;
  write("oracle.ts", header, body);
}

// ---- LOOT tables → loot-tables.ts ----
{
  const header = `// Extracted verbatim from arcanum-41.html (loot flavor/item tables). Do not edit by hand.
export interface MagicItem { name: string; effect: string; }

`;
  const tiered = (n) => `export const ${n}: Record<number, string[]> = ${extractLiteral(n)};`;
  const strList = (n) => `export const ${n}: string[] = ${extractLiteral(n)};`;
  const body = [
    tiered("LOOT_GEMS"),
    strList("LOOT_GEM_FLAVORS"),
    tiered("LOOT_ART"),
    strList("LOOT_ART_FLAVORS"),
    `export const LOOT_MUNDANE: Record<string, string[]> = ${extractLiteral("LOOT_MUNDANE")};`,
    strList("LOOT_TRINKETS"),
    `export const LOOT_MAGIC: Record<string, MagicItem[]> = ${extractLiteral("LOOT_MAGIC")};`,
  ].join("\n\n");
  write("loot-tables.ts", header, body);
}

// ---- GEN_BANKS (shared fill engine) → gen-banks.ts ----
{
  const header = `// Extracted verbatim from arcanum-41.html (GEN_BANKS template-fill banks). Do not edit by hand.
export const GEN_BANKS: Record<string, string[]> = `;
  write("gen-banks.ts", header, extractLiteral("GEN_BANKS") + ";");
}

// ---- Dungeon tables → dungeon-tables.ts ----
{
  const header = `// Extracted verbatim from arcanum-41.html (dungeon generation tables). Do not edit by hand.
`;
  const obj = (n, t) => `export const ${n}: ${t} = ${extractLiteral(n)};`;
  const body = [
    obj("DGN_NAME_PARTS", "{ pre: string[]; de: string[] }"),
    obj("DGN_PREMISES", "Record<string, string>"),
    obj("DGN_ATMOS", "Record<string, string[]>"),
    obj("DGN_ROOM_NAMES", "Record<string, string[]>"),
    obj("DGN_ROOM_DESCS", "Record<string, string[]>"),
    obj("DGN_ROOM_DETAIL_FEATURES", "string[]"),
    obj("DGN_ROOM_DETAIL_DANGERS", "string[]"),
    obj("DGN_HAZARDS", "string[]"),
    obj("DGN_REWARDS", "string[]"),
    obj("DGN_SECRETS", "string[]"),
    obj("DGN_TYPE_NAMES", "Record<string, string>"),
    obj("DGN_TAG_NAMES", "Record<string, string>"),
  ].join("\n\n");
  write("dungeon-tables.ts", header, body);
}

// ---- City tables → city-tables.ts ----
{
  const header = `// Extracted verbatim from arcanum-41.html (city generation tables). Do not edit by hand.
export interface DistrictTemplate { name: string; desc: string; }
export interface BoardTemplate { type: string; text: string; }
`;
  const obj = (n, t) => `export const ${n}: ${t} = ${extractLiteral(n)};`;
  const str = (n) => obj(n, "string[]");
  const body = [
    str("CITY_NAME_PREFIXES"), str("CITY_NAME_SUFFIXES"), str("CITY_NAME_CONNECTORS"), str("CITY_NAME_PLACES"),
    str("CITY_MOTTOS"),
    obj("CITY_DISTRICT_TEMPLATES", "Record<string, DistrictTemplate>"),
    str("CITY_TAVERN_NAMES"), str("CITY_TEMPLE_NAMES"), str("CITY_SHOP_NAMES"),
    str("CITY_GUILDS_BASE"),
    obj("CITY_GUILDS_BY_TERRAIN", "Record<string, string[]>"),
    str("CITY_RUMOR_TEMPLATES"),
    obj("CITY_BOARD_TEMPLATES", "BoardTemplate[]"),
    str("CITY_CRIMES"), str("CITY_TRABAJOS"), str("CITY_CRIATURAS_TABLON"), str("CITY_MATERIALES"),
    obj("CITY_NPC_ROLES_BY_GOVERNMENT", "Record<string, string[]>"),
    obj("CITY_POPULATION", "Record<string, [number, number]>"),
    obj("CITY_DISTRICT_COUNT", "Record<string, number>"),
    str("CITY_DEITIES"), str("CITY_SHADOW_FACTIONS"), str("CITY_CURRENT_EVENTS"), str("CITY_FOUNDINGS"),
    // expansion pools
    str("GUILD_LEADER_TITLES"), str("GUILD_LEADER_TRAITS"), str("GUILD_SEDES"), str("GUILD_SERVICES_POOL"),
    str("GUILD_FEES"), str("GUILD_SECRETS"), str("GUILD_QUESTS"), str("GUILD_RIVALRIES"),
    str("QUEST_PATRONS"), str("QUEST_CONTEXTS"), str("QUEST_COMPLICATIONS"), str("QUEST_REWARDS"), str("QUEST_TWISTS"),
    str("DISTRICT_STREETS"), str("DISTRICT_LANDMARKS"), str("DISTRICT_LOCALS"), str("DISTRICT_DANGERS"), str("DISTRICT_ATMOS"),
  ].join("\n\n");
  write("city-tables.ts", header, body);
}

// ---- SPELLFORGE tables → spellforge-tables.ts ----
{
  const names = [
    "SF_RAND", "SF_DMG_BY_LEVEL", "SF_HEAL_BY_LEVEL", "SF_TEMPHP_BY_LEVEL",
    "SF_EFFECTS", "SF_RIDERS"
  ];
  const header = `// Extracted verbatim from arcanum-41.html (spellforge generation tables). Do not edit by hand.
export interface SFRandData {
  schools: string[];
  classesBySchool: Record<string, string[]>;
  dmgTypes: Record<string, string[]>;
  names: { pre: string[]; de: string[] };
}
export interface SFEffects {
  [school: string]: {
    truco?: string[];
    bajo?: string[];
    medio?: string[];
    alto?: string[];
  };
}
`;
  const body = names
    .map((n) => {
      const lit = extractLiteral(n);
      let type = "";
      if (n === "SF_RAND") type = ": SFRandData";
      else if (n === "SF_EFFECTS") type = ": SFEffects";
      else if (n === "SF_RIDERS") type = ": Record<string, string[]>";
      else type = ": Record<number, string>";
      return `export const ${n}${type} = ${lit};`;
    })
    .join("\n\n");
  write("spellforge-tables.ts", header, body);
}

// ---- RELIC tables → relic-tables.ts ----
{
  const names = ["RL_RARITY_NAMES", "RL_RAND"];
  const header = `// Extracted verbatim from arcanum-41.html (relic generation tables). Do not edit by hand.
export interface RLRandData {
  types: string[];
  rarities: string[];
  namePre: Record<string, string[]>;
  nameDe: string[];
  effectsByType: Record<string, string[]>;
  potions: string[];
  wonders: string[];
  subtle: string[];
  dmgTypes: string[];
  curses: string[];
}
`;
  const body = names
    .map((n) => {
      const lit = extractLiteral(n);
      let type = "";
      if (n === "RL_RARITY_NAMES") type = ": Record<string, string>";
      else if (n === "RL_RAND") type = ": RLRandData";
      return `export const ${n}${type} = ${lit};`;
    })
    .join("\n\n");
  write("relic-tables.ts", header, body);
}

console.log("Done.");
