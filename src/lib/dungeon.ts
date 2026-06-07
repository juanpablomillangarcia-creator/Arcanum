// Procedural dungeon/location generation, ported from arcanum-41.html (dgnGenerate & helpers).

import {
  DGN_NAME_PARTS, DGN_PREMISES, DGN_ATMOS, DGN_ROOM_NAMES, DGN_ROOM_DESCS,
  DGN_ROOM_DETAIL_FEATURES, DGN_ROOM_DETAIL_DANGERS, DGN_HAZARDS, DGN_REWARDS, DGN_SECRETS,
  DGN_TYPE_NAMES, DGN_TAG_NAMES,
} from "@/src/data/dungeon-tables";
import { genFill, genUnique, genLearn } from "@/src/lib/gen-fill";

export { DGN_TYPE_NAMES, DGN_TAG_NAMES };

export interface RoomExtra { title: string; text: string; }
export interface RoomDetail {
  loading?: boolean;
  readaloud?: string;
  feature?: string;
  content?: string;
  danger?: string;
}
export interface DgnRoom {
  num: number;
  name: string;
  content: string;
  desc: string;
  detail: RoomDetail | null;
  extras?: RoomExtra[];
}
export interface Dungeon {
  id: string;
  name: string;
  type: string;
  size: string;
  faction: string;
  state: string;
  danger: string;
  premise: string;
  atmosphere: string;
  rooms: DgnRoom[];
  hazard: string;
  reward: string;
  secrets: string[];
  createdAt: number;
}

export interface DgnParams extends Record<string, string> {
  type: string;
  size: string;
  roomcount: string;
  faction: string;
  state: string;
  danger: string;
}

export const DGN_TYPES = [
  { value: "random", label: "— Aleatorio —" },
  { value: "mazmorra", label: "Mazmorra clásica" },
  { value: "cueva", label: "Cueva natural" },
  { value: "castillo", label: "Castillo / fortaleza" },
  { value: "templo", label: "Templo / cripta" },
  { value: "torre", label: "Torre de mago" },
  { value: "ruinas", label: "Ruinas antiguas" },
  { value: "mina", label: "Mina abandonada" },
  { value: "guarida", label: "Guarida de bestia" },
  { value: "campamento", label: "Campamento / fuerte" },
  { value: "bosque", label: "Zona salvaje / bosque" },
  { value: "pantano", label: "Pantano / ciénaga" },
  { value: "barco", label: "Navío / pecio" },
  { value: "plano", label: "Plano elemental" },
  { value: "feywild", label: "Reino feérico" },
  { value: "abismo", label: "Abismo / infierno" },
  { value: "onirico", label: "Reino onírico" },
  { value: "astral", label: "Vacío astral" },
];

export const DGN_SIZES = [
  { value: "pequeño", label: "Pequeño (3-4 zonas)" },
  { value: "mediano", label: "Mediano (5-7 zonas)" },
  { value: "grande", label: "Grande (8-11 zonas)" },
  { value: "colosal", label: "Colosal (12-16 zonas)" },
];

export const DGN_ROOMCOUNTS = [
  { value: "auto", label: "Automático (según tamaño)" },
  ...[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20].map((n) => ({ value: String(n), label: `${n} salas` })),
];

export const DGN_FACTIONS = [
  { value: "random", label: "— Aleatorio —" },
  { value: "nomuertos", label: "No-muertos" },
  { value: "cultistas", label: "Cultistas" },
  { value: "bestias", label: "Bestias salvajes" },
  { value: "aberraciones", label: "Aberraciones" },
  { value: "bandidos", label: "Bandidos / saqueadores" },
  { value: "goblinoides", label: "Goblinoides / orcos" },
  { value: "constructos", label: "Autómatas / constructos" },
  { value: "fey", label: "Seres feéricos" },
  { value: "demonios", label: "Demonios / diablos" },
  { value: "dragon", label: "Un dragón y sus secuaces" },
  { value: "vacio", label: "Nadie vivo (abandonado)" },
];

export const DGN_STATES = [
  { value: "random", label: "— Aleatorio —" },
  { value: "activo", label: "Activo y ocupado" },
  { value: "ruinas", label: "En ruinas" },
  { value: "abandonado", label: "Abandonado" },
  { value: "sellado", label: "Sellado / olvidado" },
  { value: "corrupto", label: "Corrompido por magia" },
];

export const DGN_DANGERS = [
  { value: "bajo", label: "Bajo (niveles 1-4)" },
  { value: "medio", label: "Medio (niveles 5-10)" },
  { value: "alto", label: "Alto (niveles 11-16)" },
  { value: "mortal", label: "Mortal (niveles 17+)" },
];

function pick<T>(a: T[]): T { return a[Math.floor(Math.random() * a.length)]; }
function int(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function genName(type: string): string {
  const themed: Record<string, string> = {
    plano: "Confín Elemental", feywild: "Claro Encantado", abismo: "Sima Infernal",
    onirico: "Umbral de los Sueños", astral: "Deriva Astral",
  };
  if (themed[type] && Math.random() < 0.5) return themed[type] + " " + pick(DGN_NAME_PARTS.de);
  return pick(DGN_NAME_PARTS.pre) + " " + pick(DGN_NAME_PARTS.de);
}

function makeRoom(nameKey: string, content: string, num: number): DgnRoom {
  const names = DGN_ROOM_NAMES[nameKey] || DGN_ROOM_NAMES.sala;
  let desc: string;
  if (content === "jefe") desc = "La cámara más importante del lugar. Aquí reside su señor o su mayor amenaza, y probablemente la recompensa final.";
  else if (content === "vacio" && num === 1) desc = "El punto de entrada al lugar. La primera impresión de lo que aguarda dentro.";
  else desc = pick(DGN_ROOM_DESCS[content] || DGN_ROOM_DESCS.vacio);
  return { num, name: pick(names), content, desc, detail: null };
}

function buildRooms(size: string, exactCount: string): DgnRoom[] {
  let n: number;
  if (exactCount && exactCount !== "auto") {
    n = Math.max(2, Math.min(20, parseInt(exactCount)));
  } else {
    const counts: Record<string, [number, number]> = { pequeño: [3, 4], mediano: [5, 7], grande: [8, 11], colosal: [12, 16] };
    const [min, max] = counts[size] || [5, 7];
    n = int(min, max);
  }
  const rooms: DgnRoom[] = [];
  rooms.push(makeRoom("entrada", "vacio", 1));
  const contentPool = ["encuentro", "encuentro", "trampa", "tesoro", "acertijo", "vacio", "pista", "encuentro"];
  const namePool = ["pasillo", "sala", "guardia", "almacen", "dormitorio", "ritual", "especial"];
  for (let i = 2; i < n; i++) {
    const content = pick(contentPool);
    const nameKey = content === "tesoro" ? "tesoro" : content === "ritual" ? "ritual" : pick(namePool);
    rooms.push(makeRoom(nameKey, content, i));
  }
  rooms.push(makeRoom("final", "jefe", n));
  return rooms;
}

export function generateDungeon(p: DgnParams): Dungeon {
  const types = Object.keys(DGN_PREMISES);
  const factions = ["nomuertos", "cultistas", "bestias", "aberraciones", "bandidos", "goblinoides", "constructos", "fey", "demonios", "dragon", "vacio"];
  const states = ["activo", "ruinas", "abandonado", "sellado", "corrupto"];

  const pickOr = (v: string, fallback: string[]) => (v && v !== "random" ? v : pick(fallback));
  const type = pickOr(p.type, types);
  const size = p.size || "mediano";
  const faction = pickOr(p.faction, factions);
  const state = pickOr(p.state, states);
  const danger = p.danger || "medio";

  const dungeon: Dungeon = {
    id: "dgn_" + Date.now(),
    name: genName(type),
    type, size, faction, state, danger,
    premise: DGN_PREMISES[type] || DGN_PREMISES.mazmorra,
    atmosphere: cap(pick(DGN_ATMOS[type] || DGN_ATMOS.mazmorra)) + ".",
    rooms: buildRooms(size, p.roomcount || "auto"),
    hazard: genFill(pick(DGN_HAZARDS)),
    reward: genFill(pick(DGN_REWARDS)),
    secrets: genUnique(DGN_SECRETS, int(1, 2)),
    createdAt: Date.now(),
  };
  try { if (dungeon.name) genLearn("lugar", dungeon.name); } catch { /* noop */ }
  return dungeon;
}

/* ===== Procedural room expansion ("Indagar") ===== */
function factionEnemies(faction: string, isBoss: boolean): string {
  const map: Record<string, string> = {
    nomuertos: isBoss ? "un señor de la muerte (lich, vampiro o caballero de la muerte) y su séquito" : "esqueletos, zombis o espectros",
    cultistas: isBoss ? "el líder del culto y sus fanáticos más devotos" : "cultistas y quizá una criatura invocada",
    bestias: isBoss ? "la bestia alfa, más grande y feroz" : "bestias salvajes territoriales",
    aberraciones: isBoss ? "una aberración mayor de muchos ojos y tentáculos" : "aberraciones menores y horrores reptantes",
    bandidos: isBoss ? "el capitán de los bandidos y sus mejores hombres" : "bandidos armados",
    goblinoides: isBoss ? "un jefe hobgoblin o un osgo enorme" : "goblins, hobgoblins y sus mascotas",
    constructos: isBoss ? "un golem o autómata guardián de gran tamaño" : "autómatas y guardianes animados",
    fey: isBoss ? "un archifey caprichoso y poderoso" : "criaturas feéricas traviesas o engañosas",
    demonios: isBoss ? "un demonio o diablo mayor que comanda a los demás" : "demonios o diablos menores",
    dragon: isBoss ? "el dragón, dueño y señor del lugar" : "secuaces y kóbolds al servicio del dragón",
    vacio: isBoss ? "algo que no debería seguir aquí tras tanto tiempo" : "nada vivo, pero el lugar guarda peligros propios",
  };
  return map[faction] || map.bandidos;
}

function roomContentDetail(content: string, faction: string): string {
  switch (content) {
    case "encuentro": case "jefe":
      return "Combate: " + factionEnemies(faction, content === "jefe") + " Ajusta el número al tamaño del grupo. Puedes generar las criaturas exactas en la Balanza del Combate.";
    case "trampa":
      return "Trampa: " + pick(["dardos envenenados desde las paredes", "un foso oculto con pinchos", "una losa que libera gas", "una runa explosiva en el umbral", "un techo que desciende lentamente"]) + ". CD de detección y desarme según el nivel del grupo.";
    case "tesoro":
      return "Tesoro: genera el contenido exacto en el Cofre del Tesoro, escalado al nivel de peligro del lugar.";
    case "acertijo":
      return "Acertijo: " + pick(["placas con símbolos que hay que pulsar en orden", "una pregunta grabada cuya respuesta abre la puerta", "espejos que deben orientarse para guiar un haz de luz", "pesos que equilibrar en una balanza antigua"]) + ".";
    case "pista":
      return "Pista: " + pick(["un diario revela el propósito del lugar", "un mapa parcial muestra lo que falta por explorar", "marcas advierten del peligro de la cámara final", "un mensaje moribundo nombra al verdadero enemigo"]) + ".";
    default:
      return "Aparentemente vacía, ideal para un respiro... o para una emboscada inesperada.";
  }
}

/** Procedural ("Indagar") detail for a room — no API key needed. */
export function expandRoom(room: DgnRoom, faction: string): RoomDetail {
  return {
    feature: "Al examinar la estancia se descubre " + pick(DGN_ROOM_DETAIL_FEATURES) + ".",
    danger: cap(pick(DGN_ROOM_DETAIL_DANGERS)) + ".",
    content: roomContentDetail(room.content, faction),
  };
}
