// Procedural city generation, ported from arcanum-41.html (cityGenerateRandom & expansions).

import {
  CITY_NAME_PREFIXES, CITY_NAME_SUFFIXES, CITY_NAME_CONNECTORS, CITY_NAME_PLACES,
  CITY_MOTTOS, CITY_DISTRICT_TEMPLATES, CITY_TAVERN_NAMES, CITY_TEMPLE_NAMES, CITY_SHOP_NAMES,
  CITY_GUILDS_BASE, CITY_GUILDS_BY_TERRAIN, CITY_RUMOR_TEMPLATES, CITY_BOARD_TEMPLATES,
  CITY_CRIMES, CITY_TRABAJOS, CITY_CRIATURAS_TABLON, CITY_MATERIALES,
  CITY_NPC_ROLES_BY_GOVERNMENT, CITY_POPULATION, CITY_DISTRICT_COUNT,
  CITY_DEITIES, CITY_SHADOW_FACTIONS, CITY_CURRENT_EVENTS, CITY_FOUNDINGS,
  GUILD_LEADER_TITLES, GUILD_LEADER_TRAITS, GUILD_SEDES, GUILD_SERVICES_POOL,
  GUILD_FEES, GUILD_SECRETS, GUILD_QUESTS, GUILD_RIVALRIES,
  QUEST_PATRONS, QUEST_CONTEXTS, QUEST_COMPLICATIONS, QUEST_REWARDS, QUEST_TWISTS,
  DISTRICT_STREETS, DISTRICT_LANDMARKS, DISTRICT_LOCALS, DISTRICT_DANGERS, DISTRICT_ATMOS,
} from "@/src/data/city-tables";
import { genUnique, genLearn } from "@/src/lib/gen-fill";

export interface DistrictDetail { loading?: boolean; atmosphere?: string; streets?: string; landmark?: string; local?: string; danger?: string; }
export interface CityDistrict { name: string; desc: string; detail?: DistrictDetail | null; }
export interface CityBuilding { name: string; type: string; icon: string; }
export interface GuildDetail { loading?: boolean; leader?: string; sede?: string; services?: string; fee?: string; quest?: string; rivalry?: string; secret?: string; }
export interface CityGuild { name: string; detail?: GuildDetail | null; }
export interface CityNpc { name: string; role: string; }
export interface BoardDetail { loading?: boolean; patron?: string; context?: string; complication?: string; reward?: string; twist?: string; }
export interface CityBoardEntry { type: string; text: string; detail?: BoardDetail | null; }

export interface City {
  id: string;
  name: string;
  motto: string;
  size: string;
  style: string;
  wealth: string;
  government: string;
  terrain: string;
  climate: string;
  population: number;
  traits: string[];
  deity: string;
  faction: string;
  event: string;
  history: string;
  districts: CityDistrict[];
  buildings: CityBuilding[];
  guilds: CityGuild[];
  npcs: CityNpc[];
  rumors: string[];
  board: CityBoardEntry[];
  secrets: string[];
  createdAt: number;
}

export interface CityParams extends Record<string, string> {
  size: string;
  style: string;
  wealth: string;
  government: string;
  terrain: string;
  climate: string;
}

export const CITY_SIZES = [
  { value: "random", label: "— Aleatorio —" },
  { value: "aldea", label: "Aldea (50-300 hab.)" },
  { value: "pueblo", label: "Pueblo (300-1k hab.)" },
  { value: "villa", label: "Villa (1k-6k hab.)" },
  { value: "ciudad", label: "Ciudad (6k-25k hab.)" },
  { value: "metrópoli", label: "Metrópoli (25k+ hab.)" },
];
export const CITY_STYLES = [
  { value: "random", label: "— Aleatorio —" },
  { value: "medieval", label: "Medieval clásico" },
  { value: "portuario", label: "Portuario" },
  { value: "desierto", label: "Desierto / oasis" },
  { value: "nórdico", label: "Nórdico" },
  { value: "élfico", label: "Élfico" },
  { value: "enano", label: "Enano (subterránea)" },
  { value: "decadente", label: "Decadente / ruinosa" },
  { value: "mágico", label: "Saturada de magia" },
  { value: "criminal", label: "Refugio de criminales" },
  { value: "religioso", label: "Centro religioso" },
  { value: "fronteriza", label: "Fronteriza / frontera salvaje" },
];
export const CITY_WEALTHS = [
  { value: "random", label: "— Aleatorio —" },
  { value: "pobre", label: "Pobre" },
  { value: "modesta", label: "Modesta" },
  { value: "próspera", label: "Próspera" },
  { value: "rica", label: "Rica" },
  { value: "decadente", label: "En decadencia" },
  { value: "guerra", label: "En guerra" },
];
export const CITY_GOVERNMENTS = [
  { value: "random", label: "— Aleatorio —" },
  { value: "monarquía", label: "Monarquía / Señor" },
  { value: "consejo", label: "Consejo electo" },
  { value: "teocracia", label: "Teocracia" },
  { value: "gremios", label: "Gremios mercantiles" },
  { value: "oligarquía", label: "Oligarquía noble" },
  { value: "sin ley", label: "Sin ley" },
  { value: "militar", label: "Militar / marcial" },
  { value: "autoritario", label: "Autoritario" },
];
export const CITY_TERRAINS = [
  { value: "random", label: "— Aleatorio —" },
  ...["llanura", "bosque", "montaña", "costa", "isla", "archipiélago", "río", "lago", "desierto",
    "oasis", "tundra", "pantano", "subterránea", "flotante", "árbol", "acantilado", "volcán", "ruinas"]
    .map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) })),
];
export const CITY_CLIMATES = [
  { value: "random", label: "— Aleatorio —" },
  ...["templado", "frío", "gélido", "cálido", "árido", "tropical", "lluvioso", "brumoso", "ventoso", "mágico"]
    .map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) })),
];

function pick<T>(a: T[]): T { return a[Math.floor(Math.random() * a.length)]; }
function int(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pickN<T>(arr: T[], n: number): T[] {
  const pool = [...arr];
  const result: T[] = [];
  for (let i = 0; i < n && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return result;
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const capDot = (s: string) => cap(s) + ".";

function generateName(): string {
  const style = Math.random();
  if (style < 0.5) {
    return pick(CITY_NAME_PREFIXES) + pick(CITY_NAME_SUFFIXES);
  } else if (style < 0.85) {
    const base = pick(CITY_NAME_PREFIXES) + pick(CITY_NAME_SUFFIXES);
    const conn = pick(CITY_NAME_CONNECTORS);
    if (!conn) return base;
    return base + conn + pick(CITY_NAME_PLACES);
  }
  return pick(CITY_NAME_PLACES) + pick(CITY_NAME_CONNECTORS) + pick(CITY_NAME_PREFIXES) + pick(CITY_NAME_SUFFIXES);
}

export function generateNpcName(): string {
  const names = ["Aldric", "Marius", "Theodor", "Korbin", "Brennan", "Garrick", "Tobias", "Erikan", "Helga", "Mira", "Selene", "Elara", "Cassia", "Vera", "Liriel", "Bharash", "Faramir", "Ulrich"];
  const surnames = ["Castaño", "Vendaval", "Sombravento", "Lanzapaño", "Velasangre", "del Pantano", "Manopesada", "del Velo", "Ojos de Hielo", "el Rojo", "Mil-Heridas", "Pluma"];
  return pick(names) + " " + pick(surnames);
}

function fillBoardEntry(template: { type: string; text: string }): CityBoardEntry {
  let text = template.text;
  text = text.replace("{{nombre}}", pick(["Aldric Castaño", "Mira Sombravento", "Bram el Tuerto", "Lyanna Pluma", "Korr Mil-Heridas", "Sera la Roja", "Tobías Lanzapaño", "Velina del Pantano", "Garth Manopesada", "Inés del Velo"]));
  text = text.replace("{{crimen}}", pick(CITY_CRIMES));
  text = text.replace("{{recompensa}}", String(int(50, 5000)));
  text = text.replace("{{trabajo}}", pick(CITY_TRABAJOS));
  text = text.replace("{{criatura}}", pick(CITY_CRIATURAS_TABLON));
  text = text.replace("{{lugar}}", pick(["los bosques al norte", "las colinas", "la ruina vieja", "el camino real", "las cloacas", "el cementerio", "el río", "las marismas"]));
  text = text.replace("{{destino}}", pick(["la capital", "un pueblo lejano", "las montañas", "un puerto del sur", "la frontera"]));
  text = text.replace("{{cantidad}}", String(int(5, 50)));
  text = text.replace("{{material}}", pick(CITY_MATERIALES));
  return { type: template.type, text, detail: null };
}

export function generateCity(p: CityParams): City {
  const sizes = ["aldea", "pueblo", "villa", "ciudad", "metrópoli"];
  const styles = ["medieval", "portuario", "desierto", "nórdico", "élfico", "enano", "decadente", "mágico", "criminal", "religioso", "fronteriza"];
  const wealths = ["pobre", "modesta", "próspera", "rica", "decadente", "guerra"];
  const govs = ["monarquía", "consejo", "teocracia", "gremios", "oligarquía", "sin ley", "militar", "autoritario"];
  const terrains = ["llanura", "bosque", "montaña", "costa", "isla", "río", "lago", "desierto", "oasis", "tundra", "pantano", "subterránea", "flotante", "acantilado", "ruinas"];
  const climates = ["templado", "frío", "gélido", "cálido", "árido", "tropical", "lluvioso", "brumoso", "ventoso"];

  const pickOr = (v: string, fallback: string[]) => (v && v !== "random" ? v : pick(fallback));
  const size = pickOr(p.size, sizes);
  const style = pickOr(p.style, styles);
  const wealth = pickOr(p.wealth, wealths);
  const government = pickOr(p.government, govs);
  const terrain = pickOr(p.terrain, terrains);
  const climate = pickOr(p.climate, climates);

  const name = generateName();
  const motto = pick(CITY_MOTTOS);
  const popRange = CITY_POPULATION[size] || [500, 2000];
  const population = int(popRange[0], popRange[1]);

  // Districts
  const numDistricts = CITY_DISTRICT_COUNT[size] || 3;
  const districtKeys = Object.keys(CITY_DISTRICT_TEMPLATES);
  let chosen: string[] = [];
  if (size !== "aldea") chosen.push("mercado");
  if (style === "portuario" || terrain === "costa" || terrain === "isla" || terrain === "archipiélago") chosen.push("muelles");
  if (style === "religioso") chosen.push("templo");
  if (style === "mágico") chosen.push("academia");
  if (style === "criminal") chosen.push("bajos");
  if (government === "militar") chosen.push("cuartel");
  if (government === "monarquía" || government === "oligarquía") chosen.push("noble");
  if (government === "teocracia") chosen.push("templo");
  if (government === "gremios") chosen.push("artesano");
  chosen = [...new Set(chosen)];
  while (chosen.length < numDistricts) {
    const candidate = pick(districtKeys);
    if (!chosen.includes(candidate)) chosen.push(candidate);
  }
  chosen = chosen.slice(0, numDistricts);
  const districts: CityDistrict[] = chosen.map((k) => ({ name: CITY_DISTRICT_TEMPLATES[k].name, desc: CITY_DISTRICT_TEMPLATES[k].desc, detail: null }));

  // Buildings
  const numTaverns = size === "aldea" ? 1 : size === "pueblo" ? 2 : size === "villa" ? 3 : 4;
  const numTemples = style === "religioso" || government === "teocracia" ? 2 : 1;
  const numShops = size === "aldea" ? 1 : size === "pueblo" ? 2 : size === "villa" ? 3 : 5;
  const buildings: CityBuilding[] = [
    ...pickN(CITY_TAVERN_NAMES, numTaverns).map((n) => ({ name: n, type: "taberna", icon: "🍺" })),
    ...pickN(CITY_TEMPLE_NAMES, numTemples).map((n) => ({ name: n, type: "templo", icon: "✦" })),
    ...pickN(CITY_SHOP_NAMES, numShops).map((n) => ({ name: n, type: "tienda", icon: "◆" })),
  ];

  // Guilds
  const numGuilds = Math.max(1, Math.floor(numDistricts * 1.5));
  const guildPool = [...CITY_GUILDS_BASE];
  if (CITY_GUILDS_BY_TERRAIN[terrain]) guildPool.push(...CITY_GUILDS_BY_TERRAIN[terrain]);
  if (style === "criminal") guildPool.push("Hermandad de Sombras", "Hermandad de los Cuchillos");
  if (style === "religioso") guildPool.push("Orden del Cáliz", "Hermandad del Silencio");
  if (style === "mágico") guildPool.push("Conclave Arcano", "Orden del Báculo");
  const guilds: CityGuild[] = pickN(guildPool, Math.min(numGuilds, guildPool.length)).map((name) => ({ name, detail: null }));

  // NPCs
  const npcRoles = CITY_NPC_ROLES_BY_GOVERNMENT[government] || CITY_NPC_ROLES_BY_GOVERNMENT["consejo"];
  const npcs: CityNpc[] = npcRoles.map((role) => ({ name: generateNpcName(), role }));
  const tavernNames = buildings.filter((b) => b.type === "taberna").map((b) => b.name).concat(["una taberna local"]);
  npcs.push({ name: generateNpcName(), role: "Tabernero de " + pick(tavernNames) });

  const rumors = genUnique(CITY_RUMOR_TEMPLATES, 4);
  const board = pickN(CITY_BOARD_TEMPLATES, Math.min(4, CITY_BOARD_TEMPLATES.length)).map(fillBoardEntry);

  // Traits
  const traits: string[] = [];
  if (terrain === "flotante") traits.push("Está suspendida en el cielo por magia o tecnología antigua.");
  if (terrain === "subterránea") traits.push("Construida en cavernas iluminadas por hongos luminosos.");
  if (terrain === "árbol") traits.push("Edificada en las ramas de árboles colosales conectadas por puentes.");
  if (terrain === "volcán") traits.push("Sufre temblores ocasionales y el aire huele a azufre.");
  if (terrain === "ruinas") traits.push("Se asienta sobre ruinas de una civilización olvidada que aún emergen del suelo.");
  if (climate === "gélido") traits.push("La nieve nunca se derrite del todo; los habitantes visten capas pesadas.");
  if (climate === "mágico") traits.push("El clima cambia de forma impredecible: lluvia de pétalos, sol bajo nieve...");
  if (climate === "brumoso") traits.push("Una niebla densa cubre las calles desde el amanecer hasta el mediodía.");
  if (style === "decadente") traits.push("Sus edificios están construidos sobre las ruinas de su antigua gloria.");
  if (style === "criminal") traits.push("La guardia solo aparece en los barrios ricos; el resto se rige por otras leyes.");
  if (style === "mágico") traits.push("Los conjuros son tan comunes como los martillos.");
  if (wealth === "guerra") traits.push("Patrullas constantes, refugiados llegando, escasez de comida.");
  if (wealth === "decadente") traits.push("Las grandes obras del pasado se desmoronan sin reparar.");
  if (wealth === "rica") traits.push("Las calles principales están pavimentadas y limpias incluso en invierno.");
  if (traits.length < 2) {
    traits.push(pick([
      "Un mercado nocturno se abre cuando la mayoría duerme.",
      "Tiene una tradición anual única que dura tres días.",
      "Las campanas suenan a una hora extraña que solo los lugareños entienden.",
      "Existe un código no escrito entre sus habitantes que los forasteros nunca aprenden bien.",
    ]));
  }

  const secrets = genUnique([
    "Bajo {{lugar}} hay túneles excavados por una mano no humana.",
    "Quien gobierna está siendo manipulado por {{ser}}, {{giro}}.",
    "Existe una sociedad secreta que adora a un dios proscrito desde {{lugar}}.",
    "Las desapariciones recientes apuntan todas a {{lugar}}.",
    "El agua de la ciudad ha sido envenenada poco a poco, {{giro}}.",
    "{{ser}} se esconde entre los habitantes, {{giro}}.",
    "Los registros antiguos están siendo alterados por {{ser}}.",
    "{{cosa}} está oculto en {{lugar}}, y {{ser}} lo busca.",
    "{{serPlural}} controlan {{lugar}} sin que nadie lo sepa.",
    "Un pacto olvidado obliga a la ciudad a entregar algo cada cierto tiempo, {{giro}}.",
    "La prosperidad de la ciudad depende de {{cosa}} que {{ser}} mantiene en secreto.",
    "Hay una entrada a otro lugar oculta en {{lugar}}.",
  ], int(1, 2));

  const city: City = {
    id: "city_" + Date.now() + "_" + Math.floor(Math.random() * 9999),
    name, motto, size, style, wealth, government, terrain, climate, population,
    traits,
    deity: pick(CITY_DEITIES),
    faction: pick(CITY_SHADOW_FACTIONS),
    event: pick(CITY_CURRENT_EVENTS),
    history: pick(CITY_FOUNDINGS),
    districts, buildings, guilds, npcs, rumors, board, secrets,
    createdAt: Date.now(),
  };

  try {
    npcs.forEach((npc) => { if (npc.name) genLearn("ser", npc.name); });
    if (name) genLearn("lugar", "la ciudad de " + name);
    guilds.forEach((g) => genLearn("serPlural", "miembros de " + g.name));
  } catch { /* noop */ }

  return city;
}

/* ===== Procedural expansions ("Indagar") ===== */
export function expandDistrict(): DistrictDetail {
  return {
    atmosphere: "El barrio " + pick(DISTRICT_ATMOS) + ".",
    streets: capDot(pick(DISTRICT_STREETS)),
    landmark: "Destaca " + pick(DISTRICT_LANDMARKS) + ".",
    local: "Aquí vive " + pick(DISTRICT_LOCALS) + ".",
    danger: capDot(pick(DISTRICT_DANGERS)),
  };
}

export function expandGuild(): GuildDetail {
  const title = pick(GUILD_LEADER_TITLES);
  const leaderName = generateNpcName();
  const leaderTrait = pick(GUILD_LEADER_TRAITS);
  const services = pickN(GUILD_SERVICES_POOL, 2).join("; ");
  return {
    leader: `${title} ${leaderName}, que ${leaderTrait}.`,
    sede: capDot(pick(GUILD_SEDES)),
    services: cap(services) + ".",
    fee: "Para entrar se exige " + pick(GUILD_FEES) + ".",
    quest: capDot(pick(GUILD_QUESTS)),
    rivalry: "Con otro gremio de la ciudad " + pick(GUILD_RIVALRIES) + ".",
    secret: capDot(pick(GUILD_SECRETS)),
  };
}

export function expandQuest(): BoardDetail {
  return {
    patron: capDot(pick(QUEST_PATRONS)),
    context: capDot(pick(QUEST_CONTEXTS)),
    complication: capDot(pick(QUEST_COMPLICATIONS)),
    reward: capDot(pick(QUEST_REWARDS)),
    twist: capDot(pick(QUEST_TWISTS)),
  };
}
