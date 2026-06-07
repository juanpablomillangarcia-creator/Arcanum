"use client";

import { GeneratorTool, type GeneratorConfig } from "@/src/components/GeneratorTool";
import { makeSavedStore } from "@/src/store/savedItems";
import { KEYS } from "@/src/lib/storage";
import { callClaudeJSON } from "@/src/lib/ai/client";
import {
  generateNpc, attrMod, NPC_RACES, NPC_ROLES, NPC_ALIGNMENTS,
  type Npc, type NpcParams,
} from "@/src/lib/npc";

const useNpcStore = makeSavedStore<Npc>(KEYS.npcs);

const opt = (vals: string[], anyLabel: string) => [
  { value: "", label: anyLabel },
  ...vals.map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) })),
];

function NpcView({ npc }: { npc: Npc }) {
  const attrs: [string, number][] = [
    ["FUE", npc.attrs.fue], ["DES", npc.attrs.des], ["CON", npc.attrs.con],
    ["INT", npc.attrs.int], ["SAB", npc.attrs.sab], ["CAR", npc.attrs.car],
  ];
  const stat = (label: string, value: string | number) => (
    <div>
      <div className="label mb-0">{label}</div>
      <div className="text-ink font-[var(--font-mono)]">{value}</div>
    </div>
  );
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <span className="tag">{npc.race}</span>
        <span className="tag">{npc.role}</span>
        <span className="tag">{npc.gender}</span>
        <span className="tag">{npc.alignment}</span>
        <span className="tag">{npc.age} años</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 card !p-3">
        {attrs.map(([k, v]) => (
          <div key={k} className="text-center">
            <div className="label mb-0">{k}</div>
            <div className="font-[var(--font-display)] text-xl text-ink">{v}</div>
            <div className="text-xs" style={{ color: "var(--acc)" }}>{attrMod(v)}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stat("Nivel", npc.level)}
        {stat("VD", npc.cr)}
        {stat("PG", `${npc.hp} (${npc.hpFormula})`)}
        {stat("CA", npc.ac)}
        {stat("Velocidad", `${npc.speed} m`)}
      </div>

      <div className="flex flex-col gap-2 text-[15px]">
        <p><span className="label inline mb-0">Aspecto · </span><span className="text-ink-dim">{npc.appearance}.</span></p>
        <p><span className="label inline mb-0">Voz · </span><span className="text-ink-dim">{npc.voice}</span></p>
        <p><span className="label inline mb-0">Gesto · </span><span className="text-ink-dim">{npc.mannerism}</span></p>
        <p><span className="label inline mb-0">Rasgo · </span><span className="text-ink-dim">{npc.trait}</span></p>
        <p><span className="label inline mb-0">Ideal · </span><span className="text-ink-dim">{npc.ideal}</span></p>
        <p><span className="label inline mb-0">Vínculo · </span><span className="text-ink-dim">{npc.bond}</span></p>
        <p><span className="label inline mb-0">Defecto · </span><span className="text-ink-dim">{npc.flaw}</span></p>
        <p><span className="label inline mb-0">Secreto · </span><span className="text-ink-dim">{npc.secret}</span></p>
      </div>

      {npc.hooks.length > 0 && (
        <div>
          <div className="label">Ganchos de trama</div>
          <ul className="list-disc list-inside text-ink-dim flex flex-col gap-1">
            {npc.hooks.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

const AI_SYSTEM = `Eres un asistente para directores de juego de Dungeons & Dragons 5e. Generas PNJs en español, coherentes y listos para usar en partida. Devuelve SOLO un objeto JSON válido, sin texto adicional.`;

async function generateNpcAI(p: NpcParams): Promise<Npc> {
  const base = generateNpc(p); // procedural baseline for stats/format
  const constraints = [
    p.race && `Raza: ${p.race}`,
    p.role && `Rol: ${p.role}`,
    p.gender && `Género: ${p.gender}`,
    p.alignment && `Alineamiento: ${p.alignment}`,
  ].filter(Boolean).join(". ");

  const userPrompt = `Crea un PNJ de D&D 5e. ${constraints || "Sin restricciones."}
Devuelve un JSON con estas claves de texto en español: name, appearance (una frase), voice, mannerism, trait, ideal, bond, flaw, secret, hooks (array de 2 ganchos de trama cortos). Hazlo memorable y con personalidad.`;

  const { data } = await callClaudeJSON<Partial<Npc>>({
    systemPrompt: AI_SYSTEM,
    userPrompt,
    maxTokens: 1500,
  });

  return {
    ...base,
    name: data.name || base.name,
    appearance: data.appearance || base.appearance,
    voice: data.voice || base.voice,
    mannerism: data.mannerism || base.mannerism,
    trait: data.trait || base.trait,
    ideal: data.ideal || base.ideal,
    bond: data.bond || base.bond,
    flaw: data.flaw || base.flaw,
    secret: data.secret || base.secret,
    hooks: Array.isArray(data.hooks) && data.hooks.length ? data.hooks : base.hooks,
  };
}

const config: GeneratorConfig<NpcParams, Npc> = {
  toolId: "npc",
  kicker: "☉  Generadores",
  fields: [
    { key: "race", label: "Raza", type: "select", options: opt(NPC_RACES, "Aleatoria") },
    { key: "role", label: "Rol", type: "select", options: opt(NPC_ROLES, "Aleatorio") },
    { key: "gender", label: "Género", type: "select", options: opt(["masculino", "femenino", "no binario"], "Aleatorio") },
    { key: "alignment", label: "Alineamiento", type: "select", options: opt(NPC_ALIGNMENTS, "Aleatorio") },
    {
      key: "level", label: "Nivel / poder", type: "select", options: [
        { value: "random_mid", label: "Medio (5-10)" },
        { value: "random_low", label: "Bajo (1-5)" },
        { value: "random_high", label: "Alto (10-15)" },
        { value: "random_epic", label: "Épico (15-20)" },
        { value: "random_any", label: "Cualquiera (1-20)" },
      ],
    },
  ],
  initialParams: { race: "", role: "", gender: "", alignment: "", level: "random_mid" },
  generate: generateNpc,
  generateAI: generateNpcAI,
  resultLabel: (n) => `${n.name} · ${n.role}`,
  renderResult: (n) => <NpcView npc={n} />,
  useSavedStore: useNpcStore,
  generateLabel: "Generar (rápido)",
  aiLabel: "Generar con IA",
};

export default function NpcPage() {
  return <GeneratorTool config={config} />;
}
