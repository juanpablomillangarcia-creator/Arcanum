import { RL_RAND, RL_RARITY_NAMES } from "@/src/data/relic-tables";
import { genFill } from "@/src/lib/gen-fill";
import type { SrdEntry } from "@/src/data/srd";

export interface RelicForm {
  name: string;
  type: string;
  rarity: string;
  attune: boolean;
  attuneReq: string;
  text: string;
  charges: string;
  curse: string;
  lore: string;
}

export type Relic = SrdEntry & { id: string; source: "homebrew" };

export const RL_TYPES = [
  { value: "random", label: "🎲 Aleatorio" },
  ...RL_RAND.types.map((t) => ({ value: t, label: t })),
];

export const RL_RARITIES = [
  { value: "random", label: "🎲 Aleatoria" },
  { value: "comun", label: "Común" },
  { value: "infrecuente", label: "Infrecuente" },
  { value: "raro", label: "Raro" },
  { value: "muy-raro", label: "Muy raro" },
  { value: "legendario", label: "Legendario" },
  { value: "artefacto", label: "Artefacto" },
];

export { RL_RARITY_NAMES };

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rlLoreGen(): string {
  const tpls = [
    "Forjada por {{ser}} en una era olvidada, {{giro}}.",
    "Perteneció a {{ser}} cuya gesta nadie recuerda.",
    "Apareció en {{lugar}} tras una tormenta de magia salvaje.",
    "Robada de una tumba, aún lleva la ira de {{ser}}.",
    "Creada como regalo para {{ser}}, que la rechazó.",
    "{{ser}} la busca desde hace años, {{giro}}.",
    "Se dice que {{ser}} la escondió en {{lugar}}.",
    "Su último dueño fue {{ser}}, y desde entonces {{giro}}.",
    "Hallada junto a {{cosa}} en {{lugar}}.",
    "Quien la portó antes {{trama}}, {{giro}}.",
  ];
  return genFill(tpls[Math.floor(Math.random() * tpls.length)]);
}

export function buildRelicMeta(form: RelicForm): string {
  let meta = `${form.type} · ${RL_RARITY_NAMES[form.rarity] || form.rarity}`;
  if (form.attune) {
    meta += form.attuneReq
      ? ` (sintonización ${form.attuneReq})`
      : " (requiere sintonización)";
  }
  return meta;
}

export function buildRelicObject(form: RelicForm): Relic {
  const sections: { t: string; d: string }[] = [];
  if (form.charges) sections.push({ t: "Cargas", d: form.charges });
  if (form.curse) sections.push({ t: "Maldición", d: form.curse });
  if (form.lore) sections.push({ t: "Trasfondo", d: form.lore });

  return {
    id: "hb_relic_" + Date.now(),
    type: "objeto",
    name: form.name,
    meta: buildRelicMeta(form),
    subtype: form.rarity,
    text: form.text,
    sections,
    source: "homebrew",
  };
}

export function generateRelic(form: RelicForm): RelicForm {
  const typeSel = form.type;
  const raritySel = form.rarity;
  const nameField = form.name;

  const type = typeSel && typeSel !== "random" ? typeSel : pick(RL_RAND.types);
  const rarity = raritySel && raritySel !== "random" ? raritySel : pick(RL_RAND.rarities);
  const name =
    nameField && nameField.trim()
      ? nameField.trim()
      : pick(RL_RAND.namePre[type] || ["Objeto"]) + " " + pick(RL_RAND.nameDe);

  const bonus = ({ comun: 1, infrecuente: 1, raro: 2, "muy-raro": 2, legendario: 3, artefacto: 3 } as Record<string, number>)[rarity] || 1;
  const charges = ({ comun: 3, infrecuente: 4, raro: 5, "muy-raro": 6, legendario: 7, artefacto: 9 } as Record<string, number>)[rarity] || 4;
  const edDice = ({ comun: "1d4", infrecuente: "1d6", raro: "2d6", "muy-raro": "3d6", legendario: "4d6", artefacto: "6d6" } as Record<string, string>)[rarity] || "1d6";

  let effect = pick(RL_RAND.effectsByType[type] || RL_RAND.effectsByType["Objeto maravilloso"] || []);
  effect = effect
    .replace(/{b}/g, String(bonus))
    .replace("{ed}", edDice)
    .replace("{et}", pick(RL_RAND.dmgTypes))
    .replace("{ch}", String(charges))
    .replace("{potion}", pick(RL_RAND.potions))
    .replace("{wonder}", pick(RL_RAND.wonders))
    .replace("{subtle}", pick(RL_RAND.subtle || ["un aura tenue."]));

  const attuneChance = ({ comun: 0.1, infrecuente: 0.3, raro: 0.5, "muy-raro": 0.75, legendario: 0.9 } as Record<string, number>)[rarity] || 0.4;
  const attune = Math.random() < attuneChance;
  const attuneReq =
    attune && Math.random() < 0.4
      ? pick([
          "por un lanzador de conjuros",
          "por un druida",
          "por un clérigo o paladín",
          "por una criatura de alineamiento maligno",
        ])
      : "";

  const curse =
    (rarity === "muy-raro" || rarity === "legendario") && Math.random() < 0.4
      ? pick(RL_RAND.curses.filter((c) => c))
      : "";

  const hasCharges = effect.includes("cargas") || /{ch}/.test(effect);
  const chargesText = hasCharges ? `${charges} cargas, recupera 1d3 al amanecer` : "";

  const lore = Math.random() < 0.85 ? rlLoreGen() : "";

  return {
    name,
    type,
    rarity,
    attune,
    attuneReq,
    text: effect,
    charges: chargesText,
    curse,
    lore,
  };
}

export const INITIAL_RELIC_FORM: RelicForm = {
  name: "",
  type: "random",
  rarity: "random",
  attune: false,
  attuneReq: "",
  text: "",
  charges: "",
  curse: "",
  lore: "",
};
