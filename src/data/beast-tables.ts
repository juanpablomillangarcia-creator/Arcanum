export interface CrEntry {
  prof: number;
  ca: number;
  hp: [number, number];
  atk: number;
  dmgPerRound: [number, number];
  save: number;
}

export const BEAST_CR_TABLE: Record<string, CrEntry> = {
  "0":   { prof: 2, ca: 13, hp: [3, 6],      atk: 3,  dmgPerRound: [0, 1],     save: 13 },
  "1/8": { prof: 2, ca: 13, hp: [7, 35],     atk: 3,  dmgPerRound: [2, 3],     save: 13 },
  "1/4": { prof: 2, ca: 13, hp: [36, 49],    atk: 3,  dmgPerRound: [4, 5],     save: 13 },
  "1/2": { prof: 2, ca: 13, hp: [50, 70],    atk: 3,  dmgPerRound: [6, 8],     save: 13 },
  "1":   { prof: 2, ca: 13, hp: [71, 85],    atk: 3,  dmgPerRound: [9, 14],    save: 13 },
  "2":   { prof: 2, ca: 13, hp: [86, 100],   atk: 3,  dmgPerRound: [15, 20],   save: 13 },
  "3":   { prof: 2, ca: 13, hp: [101, 115],  atk: 4,  dmgPerRound: [21, 26],   save: 13 },
  "4":   { prof: 2, ca: 14, hp: [116, 130],  atk: 5,  dmgPerRound: [27, 32],   save: 14 },
  "5":   { prof: 3, ca: 15, hp: [131, 145],  atk: 6,  dmgPerRound: [33, 38],   save: 15 },
  "6":   { prof: 3, ca: 15, hp: [146, 160],  atk: 6,  dmgPerRound: [39, 44],   save: 15 },
  "7":   { prof: 3, ca: 15, hp: [161, 175],  atk: 6,  dmgPerRound: [45, 50],   save: 15 },
  "8":   { prof: 3, ca: 16, hp: [176, 190],  atk: 7,  dmgPerRound: [51, 56],   save: 16 },
  "9":   { prof: 4, ca: 16, hp: [191, 205],  atk: 7,  dmgPerRound: [57, 62],   save: 16 },
  "10":  { prof: 4, ca: 17, hp: [206, 220],  atk: 7,  dmgPerRound: [63, 68],   save: 16 },
  "11":  { prof: 4, ca: 17, hp: [221, 235],  atk: 8,  dmgPerRound: [69, 74],   save: 17 },
  "12":  { prof: 4, ca: 17, hp: [236, 250],  atk: 8,  dmgPerRound: [75, 80],   save: 17 },
  "13":  { prof: 5, ca: 18, hp: [251, 265],  atk: 8,  dmgPerRound: [81, 86],   save: 18 },
  "15":  { prof: 5, ca: 18, hp: [281, 295],  atk: 8,  dmgPerRound: [93, 98],   save: 18 },
  "17":  { prof: 6, ca: 19, hp: [311, 325],  atk: 10, dmgPerRound: [105, 110], save: 19 },
  "20":  { prof: 6, ca: 19, hp: [356, 400],  atk: 10, dmgPerRound: [123, 140], save: 19 },
};

export const CR_TO_XP: Record<string, number> = {
  "0": 10, "1/8": 25, "1/4": 50, "1/2": 100,
  "1": 200, "2": 450, "3": 700, "4": 1100, "5": 1800, "6": 2300, "7": 2900, "8": 3900, "9": 5000, "10": 5900,
  "11": 7200, "12": 8400, "13": 10000, "14": 11500, "15": 13000, "16": 15000, "17": 18000, "18": 20000, "19": 22000, "20": 25000,
  "21": 33000, "22": 41000, "23": 50000, "24": 62000, "25": 75000, "26": 90000, "27": 105000, "28": 120000, "29": 135000, "30": 155000,
};

export function crToXP(cr: string): number {
  return CR_TO_XP[String(cr)] || 0;
}

export function crSortValue(cr: string): number {
  if (cr === "0") return 0;
  if (cr === "1/8") return 0.125;
  if (cr === "1/4") return 0.25;
  if (cr === "1/2") return 0.5;
  return parseFloat(cr) || 0;
}

export const BEAST_GEN = {
  names: {
    pre: [
      "Acechador", "Devorador", "Heraldo", "Guardián", "Carroñero",
      "Vástago", "Azote", "Centinela", "Profanador", "Cazador",
      "Behemot", "Espectro", "Verdugo", "Aullador", "Reptante",
      "Coloso", "Aberración", "Fauces", "Garra", "Sombra",
    ],
    de: [
      "de las Cavernas", "de Sangre", "del Abismo", "de Ceniza", "de Hueso",
      "de la Niebla", "del Pantano", "de Hierro", "de Espinas", "del Vacío",
      "de la Tumba", "Carmesí", "de Escarcha", "de las Profundidades", "del Trueno",
      "Putrefacto", "de Cristal", "de la Ruina", "Errante", "de los Yermos",
    ],
  },
  types: [
    "aberración", "bestia", "celestial", "dragón", "elemental",
    "feérico", "gigante", "humanoide", "infernal", "monstruosidad",
    "no-muerto", "planta", "autómata", "légamo",
  ],
  sizes: ["diminuto", "pequeño", "mediano", "mediano", "grande", "grande", "enorme", "gargantuesco"],
  alignments: [
    "sin alineamiento", "caótico maligno", "neutral maligno", "legal maligno",
    "neutral", "caótico neutral", "legal neutral",
  ],
  traitTemplates: [
    { name: "Visión en la oscuridad", desc: "Percibe en la oscuridad hasta 18 m." },
    { name: "Anfibio", desc: "Puede respirar aire y agua." },
    { name: "Sigiloso", desc: "Tiene ventaja en pruebas de Sigilo en su terreno natural." },
    { name: "Resistencia mágica", desc: "Tiene ventaja en salvaciones contra conjuros y efectos mágicos." },
    { name: "Sentido del temblor", desc: "Percibe vibraciones a 18 m si ambos tocan el suelo." },
    { name: "Carga", desc: "Si se mueve 6 m en línea recta hacia un objetivo antes de impactar, inflige {{dmg}} adicional." },
    { name: "Regeneración", desc: "Recupera {{regen}} PG al inicio de su turno si le quedan puntos de golpe." },
    { name: "Olfato agudo", desc: "Tiene ventaja en pruebas de Sabiduría (Percepción) basadas en el olfato." },
    { name: "Aguante implacable", desc: "Si recibe daño que lo reduciría a 0 PG, queda en 1 PG en su lugar (1/día)." },
  ],
  attackVerbs: [
    "Mordisco", "Garra", "Golpe aplastante", "Embestida", "Coletazo",
    "Pinza", "Tentáculo", "Pico", "Cuerno", "Zarpazo", "Mandíbula", "Pisotón",
  ],
  specialAttacks: [
    {
      name: "Aliento elemental",
      desc: "(Recarga 5-6) Exhala una ráfaga de {{elem}} en un cono de 4,5 m. Cada criatura hace salvación de Destreza CD {{save}}: {{breath}} de daño de {{elem}} si falla, o la mitad con éxito.",
    },
    {
      name: "Mirada paralizante",
      desc: "Una criatura a 9 m que vea sus ojos hace salvación de Constitución CD {{save}} o queda paralizada 1 minuto (repite al final de cada turno).",
    },
    {
      name: "Grito aterrador",
      desc: "(Recarga 6) Cada criatura a 9 m hace salvación de Sabiduría CD {{save}} o queda asustada 1 minuto.",
    },
    {
      name: "Engullir",
      desc: "Hace un ataque de mordisco contra una criatura igual o menor; si impacta, la engulle: queda apresada y cegada y sufre {{breath}} de daño ácido al inicio de cada turno.",
    },
  ],
  damageTypes: ["fuego", "frío", "ácido", "veneno", "relámpago", "necrótico", "psíquico", "trueno"],
};

export type PowerLevel = "sencilla" | "normal" | "peligrosa" | "legendaria";

export interface PowerProfile {
  hpMul: number;
  caAdd: number;
  dmgMul: number;
  nTraitBonus: number;
  legendary: boolean;
  label: string;
}

export const POWER_PROFILES: Record<PowerLevel, PowerProfile> = {
  sencilla:   { hpMul: 0.8,  caAdd: -1, dmgMul: 0.85, nTraitBonus: 0, legendary: false, label: "criatura sencilla" },
  normal:     { hpMul: 1.0,  caAdd: 0,  dmgMul: 1.0,  nTraitBonus: 0, legendary: false, label: "criatura típica" },
  peligrosa:  { hpMul: 1.15, caAdd: 1,  dmgMul: 1.15, nTraitBonus: 1, legendary: false, label: "criatura peligrosa" },
  legendaria: { hpMul: 1.35, caAdd: 2,  dmgMul: 1.25, nTraitBonus: 2, legendary: true,  label: "criatura legendaria" },
};
