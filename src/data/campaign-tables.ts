export interface FichaKind {
  label: string;
  icon: string;
  plural: string;
  statuses: string[];
}

export const CAMP_FICHA_KINDS: Record<string, FichaKind> = {
  personaje: { label: "Personaje", icon: "☥", plural: "Personajes", statuses: ["vivo", "muerto", "desaparecido", "aliado", "enemigo", "neutral"] },
  criatura: { label: "Criatura", icon: "♆", plural: "Criaturas", statuses: ["por-aparecer", "aliada", "derrotado", "activo"] },
  lugar: { label: "Lugar", icon: "☖", plural: "Lugares", statuses: ["activo", "destruido", "por-descubrir"] },
  objeto: { label: "Objeto", icon: "⚱", plural: "Objetos", statuses: ["activo", "perdido", "destruido", "por-aparecer"] },
};

// Per-kind accent colours for the Tablero de relaciones (arcanum-41.html:32498-32499).
export const CAMP_KIND_COLORS: Record<string, string> = {
  personaje: "#c9a55a",
  criatura: "#b53a3a",
  lugar: "#5ab0a8",
  objeto: "#9a7ac4",
};

export interface PrepStep {
  id: string;
  icon: string;
  title: string;
  hint: string;
}

// Session prep, "Lazy DM" method — all optional (arcanum-41.html:35887). Plus a `secrets`
// field rendered separately. Used by the session editor and read view.
export const CAMP_PREP_STEPS: PrepStep[] = [
  { id: "pcs", icon: "☥", title: "Repasa a los personajes", hint: "¿Qué quiere cada PJ ahora mismo? Ganchos personales, vínculos, objetivos. Empieza siempre por ellos." },
  { id: "start", icon: "⚡", title: "Un inicio fuerte", hint: "Arranca con acción, misterio o una decisión urgente. Que la primera escena enganche en cinco minutos." },
  { id: "scenes", icon: "❖", title: "Escenas posibles", hint: "Esboza 3-5 escenas probables, no un guion. Son posibilidades; los jugadores elegirán el camino." },
  { id: "locations", icon: "☗", title: "Localizaciones memorables", hint: "2-3 lugares con un detalle sensorial potente (olor, sonido, luz) que recordarán después." },
  { id: "npcs", icon: "☉", title: "PNJ importantes", hint: "Quién aparece, qué quiere y un rasgo o voz distintiva para interpretarlo sin pensar." },
  { id: "rewards", icon: "☼", title: "Monstruos y recompensas", hint: "Qué peligros pueden surgir y qué botín, magia o información pueden ganar." },
];

export interface RelType {
  label: string;
  color: string;
}

export const CAMP_REL_TYPES: Record<string, RelType> = {
  aliado: { label: "Aliado", color: "#6b8a5a" },
  enemigo: { label: "Enemigo", color: "#a8463f" },
  familia: { label: "Familia", color: "#c9a55a" },
  amor: { label: "Amor", color: "#b06987" },
  rivalidad: { label: "Rivalidad", color: "#b07a4a" },
  sirve: { label: "Sirve", color: "#7a98b0" },
  conoce: { label: "Conoce", color: "#a89c7d" },
  pertenece: { label: "Pertenece", color: "#8a9bb0" },
  ubicado: { label: "Ubicado", color: "#8a8278" },
  teme: { label: "Teme", color: "#6b3f5a" },
  secreto: { label: "Secreto", color: "#9d6db0" },
  otro: { label: "Otro", color: "#7a6f5a" },
};

export interface ThreadStatus {
  label: string;
  color: string;
}

export const CAMP_THREAD_STATUS: Record<string, ThreadStatus> = {
  activa: { label: "Activa", color: "#6b8a5a" },
  latente: { label: "Latente", color: "#c9a55a" },
  resuelta: { label: "Resuelta", color: "#7a6f5a" },
};

export const CAMP_TYPES = ["oneshot", "corta", "media", "larga"] as const;
export const CAMP_TYPE_NAMES: Record<string, string> = {
  oneshot: "One-shot",
  corta: "Corta (2-6 sesiones)",
  media: "Campaña",
  larga: "Gran campaña",
};

export interface GuiaPrompt {
  id: string;
  label: string;
  icon: string;
  prompt: string;
}

export const CAMP_GUIA_PROMPTS: GuiaPrompt[] = [
  {
    id: "proximos",
    label: "¿Qué pasa después?",
    icon: "➤",
    prompt: "Basándote en el estado actual de la campaña, las tramas activas y los últimos eventos, sugiere 3 posibles direcciones para la próxima sesión.",
  },
  {
    id: "cabos",
    label: "Conectar cabos sueltos",
    icon: "⊕",
    prompt: "Revisa los cabos sueltos y tramas latentes. Sugiere formas de conectarlos con las tramas activas o de resolverlos de manera satisfactoria.",
  },
  {
    id: "giro",
    label: "Giro de trama",
    icon: "↯",
    prompt: "Propón un giro inesperado pero coherente con la campaña que pueda sorprender a los jugadores y abrir nuevas posibilidades narrativas.",
  },
  {
    id: "conexiones",
    label: "Conexiones ocultas",
    icon: "◈",
    prompt: "Sugiere conexiones ocultas entre entidades (personajes, lugares, objetos) que los jugadores aún no conocen pero que enriquecerían la trama.",
  },
  {
    id: "sesion",
    label: "Esqueleto de sesión",
    icon: "☰",
    prompt: "Crea un esqueleto para la próxima sesión: 3-5 escenas clave con ganchos, posibles encuentros y decisiones importantes para los PJs.",
  },
  {
    id: "mio",
    label: "Usar mi contenido",
    icon: "✎",
    prompt: "Usando las entidades, tramas y notas de la campaña, sugiere cómo integrarlas de forma más efectiva en las próximas sesiones.",
  },
];
