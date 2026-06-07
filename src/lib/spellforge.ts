import {
  SF_RAND,
  SF_DMG_BY_LEVEL,
  SF_HEAL_BY_LEVEL,
  SF_TEMPHP_BY_LEVEL,
  SF_EFFECTS,
  SF_RIDERS,
} from "@/src/data/spellforge-tables";
import type { SrdEntry } from "@/src/data/srd";

export interface SpellForm {
  name: string;
  level: string;
  school: string;
  classes: string;
  casting: string;
  range: string;
  duration: string;
  compV: boolean;
  compS: boolean;
  compM: boolean;
  material: string;
  concentration: boolean;
  ritual: boolean;
  text: string;
  higher: string;
}

export type Spell = SrdEntry & { id: string; source: "homebrew" };

export const SF_LEVELS = [
  { value: "random", label: "🎲 Aleatorio" },
  { value: "truco", label: "Truco" },
  { value: "1", label: "Nivel 1" },
  { value: "2", label: "Nivel 2" },
  { value: "3", label: "Nivel 3" },
  { value: "4", label: "Nivel 4" },
  { value: "5", label: "Nivel 5" },
  { value: "6", label: "Nivel 6" },
  { value: "7", label: "Nivel 7" },
  { value: "8", label: "Nivel 8" },
  { value: "9", label: "Nivel 9" },
];

export const SF_SCHOOLS = [
  { value: "random", label: "🎲 Aleatoria" },
  { value: "Abjuración", label: "Abjuración" },
  { value: "Adivinación", label: "Adivinación" },
  { value: "Conjuración", label: "Conjuración" },
  { value: "Encantamiento", label: "Encantamiento" },
  { value: "Evocación", label: "Evocación" },
  { value: "Ilusión", label: "Ilusión" },
  { value: "Nigromancia", label: "Nigromancia" },
  { value: "Transmutación", label: "Transmutación" },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sfBand(lvl: number): "truco" | "bajo" | "medio" | "alto" {
  if (lvl === 0) return "truco";
  if (lvl <= 2) return "bajo";
  if (lvl <= 5) return "medio";
  return "alto";
}

export function buildSpellMeta(form: SpellForm): string {
  const lvlText = form.level === "truco" ? "Truco" : `Nivel ${form.level}`;
  let meta = `${lvlText} · ${form.school}`;
  if (form.ritual) meta += " (ritual)";
  return meta;
}

export function buildSpellObject(form: SpellForm): Spell {
  let durationText = form.duration;
  if (form.concentration) {
    durationText =
      "Concentración, hasta " +
      (form.duration || "1 minuto").replace(/^(Concentración,?\s*hasta\s*)/i, "");
  }

  const components = [
    form.compV ? "V" : "",
    form.compS ? "S" : "",
    form.compM ? "M" : "",
  ]
    .filter(Boolean)
    .join(", ");
  const componentsText = form.compM && form.material ? `${components} (${form.material})` : components || "—";

  const sections = [
    { t: "Tiempo de Lanzamiento", d: form.casting || "1 acción" },
    { t: "Alcance", d: form.range || "Personal" },
    { t: "Componentes", d: componentsText },
    { t: "Duración", d: durationText || "Instantáneo" },
  ];

  if (form.higher) sections.push({ t: "A Niveles Superiores", d: form.higher });
  if (form.classes) sections.push({ t: "Clases", d: form.classes });

  return {
    id: "hb_spell_" + Date.now(),
    type: "hechizo",
    name: form.name,
    meta: buildSpellMeta(form),
    subtype: form.level,
    text: form.text,
    sections,
    source: "homebrew",
  };
}

export function generateSpell(form: SpellForm): SpellForm {
  const levelSel = form.level;
  const schoolSel = form.school;

  const levels = ["truco", "1", "1", "2", "2", "3", "3", "4", "5", "6", "7", "8", "9"];
  const level = levelSel && levelSel !== "random" ? levelSel : pick(levels);
  const lvlNum = level === "truco" ? 0 : parseInt(level);
  const band = sfBand(lvlNum);
  const school = schoolSel && schoolSel !== "random" ? schoolSel : pick(SF_RAND.schools);

  const classesField = form.classes;
  const classes =
    classesField && classesField.trim()
      ? classesField.trim()
      : pick(SF_RAND.classesBySchool[school] || ["Mago"]);

  const nameField = form.name;
  const name =
    nameField && nameField.trim()
      ? nameField.trim()
      : pick(SF_RAND.names.pre) + " " + pick(SF_RAND.names.de);

  const dmgDice = SF_DMG_BY_LEVEL[lvlNum] || "3d8";
  const dmgType = pick(SF_RAND.dmgTypes[school] || ["fuerza"]);
  const healStr = SF_HEAL_BY_LEVEL[lvlNum] || "2d8";
  const tempHp = SF_TEMPHP_BY_LEVEL[lvlNum] || "10";
  const save = pick(["Destreza", "Constitución", "Sabiduría", "Inteligencia", "Fuerza", "Carisma"]);
  const cond = pick([
    "aturdida",
    "asustada",
    "hechizada",
    "paralizada",
    "cegada",
    "apresada",
    "aturullada",
    "tumbada",
    "envenenada",
    "ralentizada",
  ]);
  const radio = ({ truco: "3 m", bajo: "3 m", medio: "6 m", alto: "9 m" } as Record<string, string>)[band] || "6 m";

  const pool = SF_EFFECTS[school]?.[band] || SF_EFFECTS["Evocación"]?.[band] || SF_EFFECTS["Evocación"]?.["medio"] || [];
  let text = pool.length > 0 ? pick(pool) : "";

  const riderChance = ({ truco: 0, bajo: 0.25, medio: 0.45, alto: 0.7 } as Record<string, number>)[band] || 0.3;
  if (band !== "truco" && SF_RIDERS[band] && Math.random() < riderChance) {
    text += " " + pick(SF_RIDERS[band]);
  }

  const mencionaConc = /[Cc]oncentración/.test(text);
  const tieneDur = /\{dur\}/.test(text);
  const esInstantaneoPuro =
    !tieneDur &&
    !mencionaConc &&
    /\{dmg\}|impacta|salvación de \{save\}: \{dmg\}|recuperas|PG temporales/.test(text) &&
    !/durante/.test(text);

  let concentration: boolean;
  let dur: string;
  let durTexto: string;

  if (esInstantaneoPuro && band === "truco") {
    concentration = false;
    dur = "Instantáneo";
    durTexto = "Instantáneo";
  } else if (esInstantaneoPuro) {
    concentration = false;
    dur = "Instantáneo";
    durTexto = "Instantáneo";
  } else {
    concentration = mencionaConc || (band !== "truco" && Math.random() < 0.45);
    const opcionesConc = ["1 minuto", "10 minutos", "hasta 1 hora", "hasta 1 minuto"];
    const opcionesNoConc = ["1 minuto", "10 minutos", "1 hora", "hasta 8 horas"];
    dur = concentration ? pick(opcionesConc) : tieneDur ? pick(opcionesNoConc) : "Instantáneo";
    durTexto = dur === "Instantáneo" ? "1 minuto" : dur;
  }

  const fill = (s: string) =>
    s
      .replace(/\{dmg\}/g, `${dmgDice} de daño ${dmgType}`)
      .replace(/\{heal\}/g, `${healStr}`)
      .replace(/\{temphp\}/g, tempHp)
      .replace(/\{save\}/g, save)
      .replace(/\{cond\}/g, cond)
      .replace(/\{radio\}/g, radio)
      .replace(/\{dtype\}/g, dmgType)
      .replace(/\{dur\}/g, durTexto);

  text = fill(text);

  if (dur !== "Instantáneo" && !/durante|minuto|hora|ronda/i.test(text)) {
    text += ` El efecto dura ${durTexto}${concentration ? " (concentración)" : ""}.`;
  }
  if (concentration && !/concentración/i.test(text)) {
    text += " Requiere concentración.";
  }

  const casting = pick(["1 acción", "1 acción", "1 acción", "1 acción adicional", "1 reacción"]);
  const range =
    level === "truco"
      ? pick(["Toque", "9 m", "18 m"])
      : pick(["18 m", "27 m", "36 m", "45 m", "Toque", "Personal"]);
  const duration = concentration ? `Concentración, ${dur.replace(/^hasta /, "hasta ")}` : dur;

  const compV = true;
  const compS = Math.random() < 0.85;
  const compM = Math.random() < 0.4;
  const material = compM
    ? pick([
        "una pizca de azufre",
        "un trozo de hueso",
        "una lágrima de cristal",
        "polvo de plata",
        "una semilla seca",
        "un fragmento de espejo",
        "sangre del lanzador",
        "una pluma quemada",
        "un diente de bestia",
        "arena de un reloj roto",
      ])
    : "";

  const ritual =
    band !== "truco" &&
    ["Adivinación", "Conjuración", "Abjuración"].includes(school) &&
    Math.random() < 0.2;

  let higher = "";
  if (lvlNum >= 1 && lvlNum <= 8) {
    if (/\{?d8|d10|d6|daño/.test(dmgDice) && /daño/.test(text)) {
      higher = `Cuando lanzas este conjuro usando un espacio de nivel ${lvlNum + 1} o superior, el daño aumenta en 1d8 por cada nivel de espacio por encima del ${lvlNum}.`;
    } else if (/PG|temporales|cura/i.test(text)) {
      higher = `Cuando lanzas este conjuro usando un espacio de nivel ${lvlNum + 1} o superior, la curación o los PG temporales aumentan en una cantidad acorde por cada nivel por encima del ${lvlNum}.`;
    } else if (/criatura|esbirros|invocas/i.test(text)) {
      higher = `Cuando usas un espacio de nivel ${lvlNum + 1} o superior, afectas o invocas una criatura adicional por cada nivel por encima del ${lvlNum}.`;
    } else {
      higher = `Cuando usas un espacio de nivel ${lvlNum + 1} o superior, el alcance, el área o la duración del efecto aumentan de forma acorde.`;
    }
  }

  return {
    name,
    level,
    school,
    classes,
    casting,
    range,
    duration,
    compV,
    compS,
    compM,
    material,
    concentration,
    ritual,
    text,
    higher,
  };
}

export const INITIAL_SPELL_FORM: SpellForm = {
  name: "",
  level: "1",
  school: "Evocación",
  classes: "",
  casting: "1 acción",
  range: "18 m",
  duration: "Instantáneo",
  compV: true,
  compS: true,
  compM: false,
  material: "",
  concentration: false,
  ritual: false,
  text: "",
  higher: "",
};
