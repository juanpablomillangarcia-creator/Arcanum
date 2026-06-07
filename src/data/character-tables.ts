export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

export const POINT_BUY_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
};

export const POINT_BUY_MAX = 15;
export const POINT_BUY_BUDGET = 27;

export const PROF_BONUS: Record<number, number> = {
  1: 2, 2: 2, 3: 2, 4: 2,
  5: 3, 6: 3, 7: 3, 8: 3,
  9: 4, 10: 4, 11: 4, 12: 4,
  13: 5, 14: 5, 15: 5, 16: 5,
  17: 6, 18: 6, 19: 6, 20: 6,
};

export function getProfBonus(level: number): number {
  return PROF_BONUS[level] || 2;
}

export function attrMod(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function modStr(score: number): string {
  const m = attrMod(score);
  return m >= 0 ? `+${m}` : `${m}`;
}

export const ALIGNMENTS = [
  "Legal bueno", "Neutral bueno", "Caótico bueno",
  "Legal neutral", "Neutral", "Caótico neutral",
  "Legal maligno", "Neutral maligno", "Caótico maligno",
];

export const ATTR_KEYS = ["fue", "des", "con", "int", "sab", "car"] as const;
export type AttrKey = (typeof ATTR_KEYS)[number];

export const ATTR_NAMES: Record<AttrKey, string> = {
  fue: "FUE", des: "DES", con: "CON", int: "INT", sab: "SAB", car: "CAR",
};

export const SKILLS: { name: string; attr: AttrKey }[] = [
  { name: "Acrobacias", attr: "des" },
  { name: "Atletismo", attr: "fue" },
  { name: "Conocimiento Arcano", attr: "int" },
  { name: "Engaño", attr: "car" },
  { name: "Historia", attr: "int" },
  { name: "Interpretación", attr: "car" },
  { name: "Intimidación", attr: "car" },
  { name: "Investigación", attr: "int" },
  { name: "Juego de Manos", attr: "des" },
  { name: "Medicina", attr: "sab" },
  { name: "Naturaleza", attr: "int" },
  { name: "Percepción", attr: "sab" },
  { name: "Perspicacia", attr: "sab" },
  { name: "Persuasión", attr: "car" },
  { name: "Religión", attr: "int" },
  { name: "Sigilo", attr: "des" },
  { name: "Supervivencia", attr: "sab" },
  { name: "Trato con Animales", attr: "sab" },
];

export const BACKGROUNDS = [
  "Acólito", "Animador", "Artesano", "Charlatán", "Criminal",
  "Eremita", "Forastero", "Héroe del pueblo", "Huérfano", "Marinero",
  "Noble", "Sabio", "Soldado", "Urchin",
];

export const SPELL_SLOTS: Record<number, Record<string, number>> = {
  1:  { "1": 2 },
  2:  { "1": 3 },
  3:  { "1": 4, "2": 2 },
  4:  { "1": 4, "2": 3 },
  5:  { "1": 4, "2": 3, "3": 2 },
  6:  { "1": 4, "2": 3, "3": 3 },
  7:  { "1": 4, "2": 3, "3": 3, "4": 1 },
  8:  { "1": 4, "2": 3, "3": 3, "4": 2 },
  9:  { "1": 4, "2": 3, "3": 3, "4": 3, "5": 1 },
  10: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 2 },
  11: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 2, "6": 1 },
  12: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 2, "6": 1 },
  13: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 2, "6": 1, "7": 1 },
  14: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 2, "6": 1, "7": 1 },
  15: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 2, "6": 1, "7": 1, "8": 1 },
  16: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 2, "6": 1, "7": 1, "8": 1 },
  17: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 2, "6": 1, "7": 1, "8": 1, "9": 1 },
  18: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 3, "6": 1, "7": 1, "8": 1, "9": 1 },
  19: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 3, "6": 2, "7": 1, "8": 1, "9": 1 },
  20: { "1": 4, "2": 3, "3": 3, "4": 3, "5": 3, "6": 2, "7": 2, "8": 1, "9": 1 },
};

export const RACE_ICONS: Record<string, string> = {
  "Humano": "☩", "Elfo": "✦", "Enano": "⛰", "Mediano": "⚘",
  "Dracónido": "🜂", "Gnomo": "✺", "Semielfo": "☉", "Semiorco": "⚔", "Tiefling": "☽",
};

export const CLASS_ICONS: Record<string, string> = {
  "Bárbaro": "⚔", "Bardo": "♪", "Brujo": "☽", "Clérigo": "☩", "Druida": "❀",
  "Explorador": "➶", "Guerrero": "⛨", "Hechicero": "✺", "Mago": "✦",
  "Monje": "☯", "Paladín": "✝", "Pícaro": "⚜",
};

export const CASTER_CLASSES = ["Bardo", "Brujo", "Clérigo", "Druida", "Hechicero", "Mago", "Paladín", "Explorador"];

export const HIT_DICE: Record<string, string> = {
  "Bárbaro": "d12", "Bardo": "d8", "Brujo": "d8", "Clérigo": "d8",
  "Druida": "d8", "Explorador": "d10", "Guerrero": "d10", "Hechicero": "d6",
  "Mago": "d6", "Monje": "d8", "Paladín": "d10", "Pícaro": "d8",
};
