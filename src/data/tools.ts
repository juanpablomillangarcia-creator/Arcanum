// Tool registry — ported verbatim from arcanum-41.html (TOOLS / TOOL_GROUPS, ~line 9141).
// Each tool maps to a route at /<id> and carries an accent color token (--acc-<accent>).

export type GroupId = "mesa" | "preparar" | "generar" | "biblioteca";

export interface Tool {
  id: string;
  name: string;
  desc: string;
  icon: string; // unicode rune, kept from the source
  group: GroupId;
  ready: boolean;
  hero?: boolean;
  /** CSS accent token suffix: var(--acc-<accent>). Defaults to id when omitted. */
  accent?: string;
}

export interface ToolGroup {
  id: GroupId;
  label: string;
}

export const TOOLS: Tool[] = [
  { id: "campaign", name: "Tejedor de Campañas", desc: "Crea y gestiona campañas vivas: sesiones, personajes, lugares, tramas y relaciones.", icon: "❦", ready: true, hero: true, group: "preparar", accent: "prep" },
  { id: "encounter", name: "Balanza del Combate", desc: "Genera encuentros equilibrados para tu grupo.", icon: "⚔", ready: true, group: "preparar", accent: "encounter" },
  { id: "dungeon", name: "Atlas de Lugares", desc: "Mazmorras, cuevas, castillos, ruinas, planos y dimensiones.", icon: "☗", ready: true, group: "preparar", accent: "dungeon" },

  { id: "dice", name: "Cámara de los Dados", desc: "Tiradas estándar, ventaja/desventaja, y los Dados del Caos.", icon: "⚂", ready: true, group: "mesa", accent: "dice" },
  { id: "tracker", name: "Mesa de Combate", desc: "Rastreador de iniciativa: turnos, PG y estados en plena batalla.", icon: "⚜", ready: true, group: "mesa", accent: "tracker" },
  { id: "oracle", name: "El Oráculo", desc: "Tablas de improvisación: el sí/no del destino, ganchos, salas, complicaciones, rumores y reacciones.", icon: "❂", ready: true, group: "mesa", accent: "oracle" },

  { id: "character", name: "Forja de Personajes", desc: "Crea PJs paso a paso, casi todo a clics.", icon: "☥", ready: true, group: "generar", accent: "character" },
  { id: "npc", name: "Generador de NPCs", desc: "Habitantes del mundo con personalidad y stats.", icon: "☉", ready: true, group: "generar", accent: "npc" },
  { id: "city", name: "Cartógrafo de Ciudades", desc: "Ciudades vivas: gobierno, distritos, NPCs clave y ganchos.", icon: "☖", ready: true, group: "generar", accent: "city" },
  { id: "loot", name: "Cofre del Tesoro", desc: "Genera botín y tesoros detallados según la situación.", icon: "☼", ready: true, group: "generar", accent: "loot" },
  { id: "spellforge", name: "Cinceladora de Hechizos", desc: "Crea hechizos homebrew de cualquier clase y nivel.", icon: "✶", ready: true, group: "generar", accent: "spell" },
  { id: "relic", name: "Taller de Reliquias", desc: "Forja objetos mágicos homebrew de toda índole.", icon: "⚱", ready: true, group: "generar", accent: "item" },

  { id: "search", name: "Compendio", desc: "Buscador del SRD: hechizos, monstruos, reglas, objetos.", icon: "⌬", ready: true, group: "biblioteca", accent: "search" },
  { id: "monster", name: "Bestiario", desc: "Explora monstruos del SRD y crea criaturas homebrew.", icon: "♆", ready: true, group: "biblioteca", accent: "monster" },
];

export const TOOL_GROUPS: ToolGroup[] = [
  { id: "mesa", label: "En la mesa" },
  { id: "preparar", label: "Preparar la partida" },
  { id: "generar", label: "Generadores" },
  { id: "biblioteca", label: "Biblioteca" },
];

export const toolById = (id: string): Tool | undefined => TOOLS.find((t) => t.id === id);

export const accentOf = (tool: Tool): string => tool.accent ?? tool.id;
