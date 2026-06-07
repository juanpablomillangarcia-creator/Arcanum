import { SRD_DATA, type SrdEntry, type SrdSection } from "@/src/data/srd";
import {
  BEAST_CR_TABLE, BEAST_GEN, POWER_PROFILES,
  crToXP, crSortValue,
  type PowerLevel,
} from "@/src/data/beast-tables";

export { crToXP, crSortValue };
import { genFill } from "@/src/lib/gen-fill";

export interface CreatureAction {
  name: string;
  desc: string;
}

export interface Creature {
  id: string;
  name: string;
  type: "monstruo";
  source: string;
  meta: string;
  text: string;
  sections?: SrdSection[];
  size: string;
  creatureType: string;
  alignment: string;
  cr: string;
  power?: PowerLevel;
  ca: string;
  caSource: string;
  hp: string;
  hpFormula: string;
  speed: string;
  attrs: { fue: number; des: number; con: number; int: number; sab: number; car: number };
  savingThrowsText: string;
  skills: string;
  damageVulnerabilities: string;
  damageResistances: string;
  damageImmunities: string;
  conditionImmunities: string;
  senses: string;
  languages: string;
  traits: CreatureAction[];
  actions: CreatureAction[];
  reactions: CreatureAction[];
  legendaryActions: CreatureAction[];
  legendaryDesc: string;
}

export type HomebrewCreature = Omit<Creature, "source"> & { source?: string };

export function makeBlankCreature(): Creature {
  return {
    id: "hb_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
    name: "",
    type: "monstruo",
    source: "homebrew",
    meta: "",
    text: "",
    size: "mediano",
    creatureType: "humanoide",
    alignment: "neutral",
    cr: "1",
    ca: "",
    caSource: "",
    hp: "",
    hpFormula: "",
    speed: "9 m",
    attrs: { fue: 10, des: 10, con: 10, int: 10, sab: 10, car: 10 },
    savingThrowsText: "",
    skills: "",
    damageVulnerabilities: "",
    damageResistances: "",
    damageImmunities: "",
    conditionImmunities: "",
    senses: "",
    languages: "",
    traits: [],
    actions: [],
    reactions: [],
    legendaryActions: [],
    legendaryDesc: "",
  };
}

function randInt(a: number, b: number): number {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function diceFor(target: number, dieSize = 6): { str: string; avg: number } {
  const avgPerDie = dieSize / 2 + 0.5;
  const n = Math.max(1, Math.round(target / (avgPerDie + 1)));
  const flat = Math.max(0, Math.round(target - n * avgPerDie));
  return { str: `${n}d${dieSize}${flat > 0 ? "+" + flat : ""}`, avg: Math.round(n * avgPerDie + flat) };
}

function attrMod(v: number): number {
  return Math.floor((v - 10) / 2);
}

export interface GenerateCreatureParams {
  cr?: string;
  power?: PowerLevel | "random";
  size?: string;
  creatureType?: string;
}

export function generateCreature(params: GenerateCreatureParams = {}): Creature {
  const crKeys = ["1/8", "1/4", "1/2", "1", "1", "2", "2", "3", "3", "4", "5", "6", "7", "8", "9", "10", "12"];
  const cr = params.cr && params.cr !== "random" ? params.cr : pick(crKeys);
  const T = BEAST_CR_TABLE[cr] || BEAST_CR_TABLE["1"];

  const powerKeys: PowerLevel[] = ["sencilla", "normal", "normal", "peligrosa", "legendaria"];
  const power = params.power && params.power !== "random" ? params.power : pick(powerKeys);
  const PWR = POWER_PROFILES[power];

  const c = makeBlankCreature();
  c.name = pick(BEAST_GEN.names.pre) + " " + pick(BEAST_GEN.names.de);
  c.creatureType = params.creatureType && params.creatureType !== "random" ? params.creatureType : pick(BEAST_GEN.types);
  c.size = params.size && params.size !== "random" ? params.size : pick(BEAST_GEN.sizes);
  c.alignment = pick(BEAST_GEN.alignments);
  c.cr = cr;
  c.power = power;

  const big = ["grande", "enorme", "gargantuesco"].includes(c.size);
  const small = ["diminuto", "pequeño"].includes(c.size);
  const fuerza = big ? randInt(16, 24) : small ? randInt(4, 10) : randInt(10, 17);
  const destreza = small ? randInt(13, 19) : randInt(8, 16);
  const con = big ? randInt(15, 22) : randInt(10, 16);
  const mental = PWR.legendary ? randInt(12, 20) : pick([randInt(2, 6), randInt(7, 12), randInt(12, 18)]);
  c.attrs = {
    fue: fuerza,
    des: destreza,
    con: con,
    int: mental,
    sab: randInt(8, 16),
    car: PWR.legendary ? randInt(14, 22) : randInt(6, 16),
  };

  c.ca = String(Math.max(10, T.ca + PWR.caAdd + randInt(-1, 1)));
  const hpBase = randInt(T.hp[0], T.hp[1]);
  const hpVal = Math.round(hpBase * PWR.hpMul);
  const conMod = attrMod(con);
  const hpDieSize: Record<string, number> = { diminuto: 4, pequeño: 6, mediano: 8, grande: 10, enorme: 12, gargantuesco: 20 };
  const die = hpDieSize[c.size] || 8;
  const nDice = Math.max(1, Math.round(hpVal / (die / 2 + 0.5 + (conMod || 1))));
  c.hp = String(hpVal);
  const conTotal = nDice * conMod;
  c.hpFormula = `${nDice}d${die}${conTotal !== 0 ? (conTotal > 0 ? "+" : "") + conTotal : ""}`;
  c.speed = big
    ? pick(["12 m", "9 m", "9 m, vuelo 18 m", "9 m, nado 12 m"])
    : pick(["9 m", "12 m", "9 m, trepar 9 m", "12 m, nado 9 m"]);
  c.senses = pick(["visión en la oscuridad 18 m", "visión en la oscuridad 36 m, visión ciega 3 m", "visión verdadera 18 m", "—"]);
  c.languages = PWR.legendary
    ? pick(["Común y otro idioma", "Común, Infernal, Celestial", "telepatía 36 m", "varios idiomas"])
    : pick(["—", "Común", "el idioma de su creador", "Infracomún", "entiende Común pero no habla"]);

  const saveAttrs: (keyof Creature["attrs"])[] = ["fue", "des", "con", "sab", "int", "car"];
  let nSaves = T.prof >= 4 ? 2 : Math.random() < 0.5 ? 1 : 0;
  if (PWR.legendary) nSaves = Math.max(nSaves, 3);
  else if (power === "peligrosa") nSaves = Math.max(nSaves, 2);
  const usedSaves = new Set<string>();
  const saveParts: string[] = [];
  const attrNames: Record<string, string> = { fue: "FUE", des: "DES", con: "CON", int: "INT", sab: "SAB", car: "CAR" };
  for (let i = 0; i < nSaves; i++) {
    const a = pick(saveAttrs);
    if (usedSaves.has(a)) continue;
    usedSaves.add(a);
    const mod = attrMod(c.attrs[a]) + T.prof;
    saveParts.push(`${attrNames[a]} ${mod >= 0 ? "+" : ""}${mod}`);
  }
  c.savingThrowsText = saveParts.join(", ");

  c.traits = [];
  const nTraits = randInt(1, 2) + PWR.nTraitBonus;
  const usedTraits = new Set<string>();
  for (let i = 0; i < nTraits && usedTraits.size < BEAST_GEN.traitTemplates.length; i++) {
    const tr = pick(BEAST_GEN.traitTemplates);
    if (usedTraits.has(tr.name)) { i--; continue; }
    usedTraits.add(tr.name);
    const desc = tr.desc
      .replace("{{dmg}}", diceFor(Math.max(1, Math.round(T.dmgPerRound[1] / 2)), 6).str + " de daño")
      .replace("{{regen}}", String(randInt(5, 15)));
    c.traits.push({ name: tr.name, desc });
  }
  if (PWR.legendary) {
    c.traits.push({
      name: "Resistencia legendaria (3/día)",
      desc: "Si la criatura falla una tirada de salvación, puede elegir tener éxito en su lugar.",
    });
  }

  c.actions = [];
  const atkBonus = T.atk + Math.floor((Math.max(fuerza, destreza) - 10) / 2) - 1 + (PWR.legendary ? 1 : 0);
  const dmgTarget = Math.max(1, Math.round(((T.dmgPerRound[0] + T.dmgPerRound[1]) / 2) * PWR.dmgMul));
  let nAttacks = T.prof >= 4 ? 2 : 1;
  if (PWR.legendary) nAttacks = Math.max(nAttacks, 3);
  else if (power === "peligrosa") nAttacks = Math.max(nAttacks, 2);
  const perAttack = Math.max(1, Math.round(dmgTarget / nAttacks));
  if (nAttacks > 1) c.actions.push({ name: "Multiataque", desc: `La criatura hace ${nAttacks} ataques.` });
  const usedVerbs = new Set<string>();
  for (let i = 0; i < Math.min(nAttacks, 3); i++) {
    let verb = pick(BEAST_GEN.attackVerbs);
    if (usedVerbs.has(verb)) verb = pick(BEAST_GEN.attackVerbs);
    usedVerbs.add(verb);
    const reach = big ? "3 m" : "1,5 m";
    const dice = diceFor(perAttack, big ? 10 : 6);
    const dtype = (PWR.legendary || Math.random() < 0.4)
      ? " más " + diceFor(Math.max(1, Math.round(perAttack / 2)), 6).str + " de daño " + pick(BEAST_GEN.damageTypes)
      : "";
    c.actions.push({
      name: verb,
      desc: `Ataque de arma cuerpo a cuerpo: ${atkBonus >= 0 ? "+" : ""}${atkBonus} al impacto, alcance ${reach}, un objetivo. Impacto: ${dice.str} de daño${big ? " contundente" : " cortante"}${dtype}.`,
    });
  }
  if (PWR.legendary || (T.prof >= 3 && Math.random() < 0.6)) {
    const sp = pick(BEAST_GEN.specialAttacks);
    const elem = pick(BEAST_GEN.damageTypes);
    const breath = diceFor(Math.round(dmgTarget * 1.5), 6);
    const desc = sp.desc
      .replace(/\{\{elem\}\}/g, elem)
      .replace("{{save}}", String(T.save + (PWR.legendary ? 2 : 0)))
      .replace("{{breath}}", breath.str);
    c.actions.push({ name: sp.name, desc });
  }

  c.legendaryActions = [];
  if (PWR.legendary) {
    c.legendaryDesc = "La criatura puede realizar 3 acciones legendarias, eligiendo entre las opciones siguientes. Solo se puede usar una opción de acción legendaria a la vez, y solo al final del turno de otra criatura. La criatura recupera las acciones legendarias gastadas al comienzo de su turno.";
    c.legendaryActions = [
      { name: "Detectar", desc: "La criatura hace una prueba de Sabiduría (Percepción)." },
      { name: "Ataque", desc: "La criatura hace un ataque cuerpo a cuerpo." },
      {
        name: "Maniobra (cuesta 2 acciones)",
        desc: `La criatura se mueve hasta su velocidad sin provocar ataques de oportunidad, o cada criatura a 3 m hace salvación de Destreza CD ${T.save + 2} o sufre ${diceFor(Math.round(dmgTarget / 2), 6).str} de daño.`,
      },
    ];
  }

  c.text = genFill("Una criatura temida en {{lugar}}. {{giro}}.");

  return c;
}

export function composeMetaAndSections(c: Creature): void {
  const cr = c.cr || "0";
  const px = crToXP(cr);
  c.meta = `VD ${cr} (${px} PX) · ${capitalize(c.creatureType || "criatura")} ${c.size || "mediano"} · ${c.alignment || "neutral"}`;

  const secs: SrdSection[] = [];
  const push = (t: string, d: string) => {
    if (d !== undefined && d !== null && String(d).trim() !== "") secs.push({ t, d: String(d) });
  };

  push("Clase de Armadura", c.ca ? c.ca + (c.caSource ? ` (${c.caSource})` : "") : "");
  push("Puntos de Golpe", c.hp ? c.hp + (c.hpFormula ? ` (${c.hpFormula})` : "") : "");
  push("Velocidad", c.speed);

  const attrNames: Record<string, string> = { fue: "FUE", des: "DES", con: "CON", int: "INT", sab: "SAB", car: "CAR" };
  const attrStr = (["fue", "des", "con", "int", "sab", "car"] as const)
    .map((a) => {
      const v = c.attrs[a] || 10;
      const m = attrMod(v);
      return `${attrNames[a]} ${v} (${m >= 0 ? "+" : ""}${m})`;
    })
    .join(" · ");
  push("Características", attrStr);

  push("Tiradas de Salvación", c.savingThrowsText);
  push("Habilidades", c.skills);
  push("Vulnerabilidades al Daño", c.damageVulnerabilities);
  push("Resistencias al Daño", c.damageResistances);
  push("Inmunidades al Daño", c.damageImmunities);
  push("Inmunidades a Estados", c.conditionImmunities);
  push("Sentidos", c.senses);
  push("Idiomas", c.languages);
  push("Desafío", c.cr ? `VD ${c.cr}` : "");

  const joinList = (list: CreatureAction[]) =>
    list.filter((x) => x.name || x.desc).map((x) => (x.name ? `${x.name}: ${x.desc}` : x.desc)).join(" — ");

  if (c.traits.length) {
    const t = joinList(c.traits);
    if (t) push("Rasgos", t);
  }
  if (c.actions.length) {
    const t = joinList(c.actions);
    if (t) push("Acciones", t);
  }
  if (c.reactions.length) {
    const t = joinList(c.reactions);
    if (t) push("Reacciones", t);
  }
  if (c.legendaryActions.length) {
    let legStr = "";
    if (c.legendaryDesc) legStr = c.legendaryDesc + " — ";
    legStr += joinList(c.legendaryActions);
    if (legStr) push("Acciones Legendarias", legStr);
  }

  c.sections = secs;
}

export function parseSectionsIntoDraft(draft: Creature, source: SrdEntry): void {
  const findSec = (name: string) => (source.sections || []).find((s) => s.t === name);

  if (source.meta) {
    draft.meta = source.meta;
    const sizeMatch = source.meta.match(/(diminut[ao]|peque[ñn][ao]|median[ao]|grande|enorme|gargantua?[a-z]*)/i);
    if (sizeMatch) {
      const s = sizeMatch[1].toLowerCase();
      draft.size = s.startsWith("diminut") ? "diminuto"
        : s.startsWith("peque") ? "pequeño"
        : s.startsWith("median") ? "mediano"
        : s.startsWith("gargantu") ? "gargantuesco"
        : s;
    }
    const typeMatch = source.meta.match(/·\s*([^·]+?)\s+(?:diminut|peque|median|grande|enorme|gargant)/i);
    if (typeMatch) draft.creatureType = typeMatch[1].trim().toLowerCase();
    const alignMatch = source.meta.match(/·\s*([^·]+)$/);
    if (alignMatch) draft.alignment = alignMatch[1].trim();
    const crMatch = source.meta.match(/VD\s+([0-9/]+)/);
    if (crMatch) draft.cr = crMatch[1];
  }

  const ca = findSec("Clase de Armadura");
  if (ca) {
    const m = ca.d.match(/^(\d+)(?:\s*\((.+?)\))?/);
    if (m) { draft.ca = m[1]; draft.caSource = m[2] || ""; }
  }
  const pg = findSec("Puntos de Golpe");
  if (pg) {
    const m = pg.d.match(/^(\d+)(?:\s*\((.+?)\))?/);
    if (m) { draft.hp = m[1]; draft.hpFormula = m[2] || ""; }
  }
  const vel = findSec("Velocidad");
  if (vel) draft.speed = vel.d;

  const carac = findSec("Características");
  if (carac) {
    const re = /(FUE|DES|CON|INT|SAB|CAR)\s+(\d+)/g;
    const map: Record<string, keyof Creature["attrs"]> = { FUE: "fue", DES: "des", CON: "con", INT: "int", SAB: "sab", CAR: "car" };
    let m: RegExpExecArray | null;
    while ((m = re.exec(carac.d)) !== null) {
      draft.attrs[map[m[1]]] = parseInt(m[2]);
    }
  }

  const mappings: [string, keyof Creature][] = [
    ["Tiradas de Salvación", "savingThrowsText"],
    ["Habilidades", "skills"],
    ["Vulnerabilidades al Daño", "damageVulnerabilities"],
    ["Resistencias al Daño", "damageResistances"],
    ["Inmunidades al Daño", "damageImmunities"],
    ["Inmunidades a Estados", "conditionImmunities"],
    ["Sentidos", "senses"],
    ["Idiomas", "languages"],
  ];
  mappings.forEach(([sec, field]) => {
    const s = findSec(sec);
    if (s) (draft as unknown as Record<string, unknown>)[field] = s.d;
  });

  const parseList = (text: string): CreatureAction[] => {
    if (!text) return [];
    return text.split(/\s+—\s+/).map((part) => {
      const idx = part.indexOf(":");
      if (idx > 0 && idx < 80) {
        return { name: part.substring(0, idx).trim(), desc: part.substring(idx + 1).trim() };
      }
      return { name: "", desc: part.trim() };
    });
  };

  const rasgos = findSec("Rasgos");
  if (rasgos) draft.traits = parseList(rasgos.d);
  const acciones = findSec("Acciones");
  if (acciones) draft.actions = parseList(acciones.d);
  const reacciones = findSec("Reacciones");
  if (reacciones) draft.reactions = parseList(reacciones.d);
  const leg = findSec("Acciones Legendarias");
  if (leg) draft.legendaryActions = parseList(leg.d);
}

function capitalize(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function getCreatureType(meta: string): string {
  if (!meta) return "desconocido";
  const m = meta.match(/·\s*([^·]+?)\s+(?:diminut[ao]|peque[ñn][ao]|median[ao]|grande|enorme|gargantua?)/i);
  if (m) return m[1].trim().toLowerCase();
  return "desconocido";
}

export function getCreatureCR(meta: string): string | null {
  if (!meta) return null;
  const m = meta.match(/VD\s+([0-9/]+)/i);
  if (!m) return null;
  return m[1];
}

export function getCreatureSize(meta: string): string | null {
  if (!meta) return null;
  const sizes = ["diminuto", "diminuta", "pequeño", "pequeña", "mediano", "mediana", "grande", "enorme", "gargantuesco", "gargantuesca"];
  const ml = meta.toLowerCase();
  for (const s of sizes) {
    if (ml.includes(s)) {
      if (s === "diminuta") return "diminuto";
      if (s === "pequeña") return "pequeño";
      if (s === "mediana") return "mediano";
      if (s === "gargantuesca") return "gargantuesco";
      return s;
    }
  }
  return null;
}

export function crBucket(cr: string | null): string | null {
  if (cr === null) return null;
  const v = crSortValue(cr);
  if (v <= 1) return "low";
  if (v <= 5) return "mid";
  if (v <= 10) return "high";
  if (v <= 20) return "elite";
  return "legendary";
}

export interface CreatureWithSource extends SrdEntry {
  source: string;
  cr: string;
  id: string;
  creatureType?: string;
  size?: string;
}

export function getAllCreatures(homebrew: HomebrewCreature[]): CreatureWithSource[] {
  // The verbatim-extracted SRD_DATA contains a handful of duplicate monster entries
  // (e.g. "Rata", "Aboleth"); dedupe by id so the bestiary shows one card each and React
  // keys stay unique.
  const seen = new Set<string>();
  const srd: CreatureWithSource[] = SRD_DATA
    .filter((e) => e.type === "monstruo")
    .map((m) => {
      const cr = (m.cr as string) || getCreatureCR(m.meta || "") || "0";
      return {
        ...m,
        cr,
        source: "srd",
        id: "srd_" + m.name.toLowerCase().replace(/[^a-z0-9]/g, "_"),
        creatureType: getCreatureType(m.meta || ""),
        size: getCreatureSize(m.meta || "") || undefined,
      };
    })
    .filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });

  const hb: CreatureWithSource[] = homebrew.map((m) => ({
    ...m,
    source: "homebrew",
    id: m.id,
    cr: m.cr || "0",
    creatureType: m.creatureType,
    size: m.size,
  }));

  return [...srd, ...hb];
}

export function normalizeCreatureForCompendium(m: HomebrewCreature): SrdEntry {
  if (m.sections && m.sections.length) {
    return { ...m, type: "monstruo", source: "homebrew" };
  }
  const secs: SrdSection[] = [];
  const push = (t: string, d: string) => {
    if (d !== undefined && d !== null && String(d).trim() !== "") secs.push({ t, d: String(d) });
  };
  push("Clase de Armadura", m.ca ? m.ca + (m.caSource ? " (" + m.caSource + ")" : "") : "");
  push("Puntos de Golpe", m.hp ? m.hp + (m.hpFormula ? " (" + m.hpFormula + ")" : "") : "");
  push("Velocidad", m.speed);
  if (m.attrs) {
    const a = m.attrs;
    const mod = (v: number) => { const x = attrMod(v); return (x >= 0 ? "+" : "") + x; };
    push("Características", `FUE ${a.fue} (${mod(a.fue)}) · DES ${a.des} (${mod(a.des)}) · CON ${a.con} (${mod(a.con)}) · INT ${a.int} (${mod(a.int)}) · SAB ${a.sab} (${mod(a.sab)}) · CAR ${a.car} (${mod(a.car)})`);
  }
  push("Sentidos", m.senses);
  push("Idiomas", m.languages);
  push("Desafío", m.cr ? "VD " + m.cr : "");
  if (m.traits && m.traits.length) {
    m.traits.forEach((t) => { if (t && t.name) push(t.name, t.desc || ""); });
  }
  if (m.actions && m.actions.length) {
    push("Acciones", m.actions.map((a) => `${a.name}: ${a.desc}`).join(" · "));
  }
  if (m.reactions && m.reactions.length) {
    push("Reacciones", m.reactions.map((a) => `${a.name}: ${a.desc}`).join(" · "));
  }
  if (m.legendaryActions && m.legendaryActions.length) {
    const intro = m.legendaryDesc ? m.legendaryDesc + " " : "";
    push("Acciones legendarias", intro + m.legendaryActions.map((a) => `${a.name}: ${a.desc}`).join(" · "));
  }
  const meta = m.meta || [
    m.size ? capitalize(m.size) : "",
    m.creatureType || "",
    m.alignment || "",
    m.cr ? "VD " + m.cr : "",
  ].filter(Boolean).join(" · ");

  return {
    type: "monstruo",
    name: m.name,
    meta,
    text: m.text || "",
    sections: secs,
    source: "homebrew",
    cr: m.cr,
    id: m.id,
  };
}
