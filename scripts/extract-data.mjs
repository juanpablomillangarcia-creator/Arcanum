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

console.log("Done.");
