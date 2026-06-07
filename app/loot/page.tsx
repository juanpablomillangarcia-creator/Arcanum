"use client";

import { GeneratorTool, type GeneratorConfig } from "@/src/components/GeneratorTool";
import { makeSavedStore } from "@/src/store/savedItems";
import { KEYS } from "@/src/lib/storage";
import { callClaudeJSON } from "@/src/lib/ai/client";
import {
  generateLoot, lootTotalValue,
  LOOT_ORIGINS, LOOT_SOURCES, LOOT_TIERS, LOOT_WEALTH,
  LOOT_ORIGIN_NAMES, LOOT_SOURCE_NAMES, LOOT_RARITY_NAMES,
  type Loot, type LootParams,
} from "@/src/lib/loot";

const useLootStore = makeSavedStore<Loot>(KEYS.loot);

const fmt = (n: number) => n.toLocaleString("es-ES");

const RARITY_COLOR: Record<string, string> = {
  comun: "var(--ink-soft)",
  infrecuente: "#5fa863",
  raro: "#5a8ad6",
  "muy-raro": "#a45ad6",
  legendario: "#d6a25a",
};

function Coins({ loot }: { loot: Loot }) {
  const c = loot.coins;
  const coins: [number, string, string][] = [
    [c.ppt, "platino", "#d8e0ea"],
    [c.po, "oro", "#d6a25a"],
    [c.pp, "plata", "#c0c4cc"],
    [c.pc, "cobre", "#b87a52"],
  ];
  const present = coins.filter(([v]) => v > 0);
  if (present.length === 0) return <div className="text-ink-soft text-sm">Sin monedas</div>;
  return (
    <div className="flex flex-wrap gap-3">
      {present.map(([v, label, color]) => (
        <div key={label} className="card !p-3 text-center min-w-[72px]">
          <div className="font-[var(--font-display)] text-xl" style={{ color }}>{fmt(v)}</div>
          <div className="label mb-0">{label}</div>
        </div>
      ))}
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="label">{title}</div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function LootView({ loot }: { loot: Loot }) {
  const c = loot.coins;
  const empty = !loot.valuables.length && !loot.mundane.length && !loot.magic.length &&
    c.pc + c.pp + c.po + c.ppt === 0;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 text-xs text-ink-soft">
        <span className="tag">Fuente: {LOOT_SOURCE_NAMES[loot.source] || loot.source}</span>
        <span className="tag">Riqueza: {loot.wealth}</span>
        <span className="tag">Tier {loot.tier}+</span>
      </div>

      <Coins loot={loot} />

      {loot.valuables.length > 0 && (
        <Block title="Gemas y objetos de valor">
          {loot.valuables.map((v, i) => (
            <div key={i} className="flex items-center gap-3 card !p-3">
              <span className="text-lg" style={{ color: "var(--acc)" }}>{v.icon}</span>
              <span className="flex-1 text-ink-dim text-[15px]">{v.name}</span>
              <span className="font-[var(--font-mono)] text-sm shrink-0" style={{ color: "var(--gold)" }}>{fmt(v.value)} po</span>
            </div>
          ))}
        </Block>
      )}

      {loot.mundane.length > 0 && (
        <Block title="Objetos y curiosidades">
          {loot.mundane.map((m, i) => (
            <div key={i} className="flex items-center gap-3 card !p-3">
              <span className="text-lg" style={{ color: "var(--acc)" }}>{m.icon}</span>
              <span className="flex-1 text-ink-dim text-[15px]">{m.name}</span>
            </div>
          ))}
        </Block>
      )}

      {loot.magic.length > 0 && (
        <Block title="Objetos mágicos">
          {loot.magic.map((m, i) => (
            <div key={i} className="card !p-3 flex gap-3">
              <span className="text-lg shrink-0" style={{ color: "var(--acc)" }}>✦</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-ink font-[var(--font-title)]">{m.name}</span>
                  <span
                    className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border"
                    style={{ color: RARITY_COLOR[m.rarity], borderColor: RARITY_COLOR[m.rarity] }}
                  >
                    {LOOT_RARITY_NAMES[m.rarity] || m.rarity}
                  </span>
                </div>
                <div className="text-ink-dim text-sm mt-1">{m.effect}</div>
              </div>
            </div>
          ))}
        </Block>
      )}

      {empty && <div className="text-ink-soft text-sm">Este botín está vacío. La mala suerte existe.</div>}

      <div className="pt-2 border-t font-[var(--font-mono)] text-sm" style={{ borderColor: "var(--line)", color: "var(--gold)" }}>
        Valor total aproximado: {fmt(lootTotalValue(loot))} po
      </div>
    </div>
  );
}

const AI_SYSTEM = `Eres un experto Director de Juego de D&D 5e que diseña botines temáticos y evocadores. RESPONDE SIEMPRE EN ESPAÑOL.

Responde ÚNICAMENTE con un objeto JSON válido, sin markdown:
{
  "title": "Nombre evocador del botín",
  "coins": { "pc": número, "pp": número, "po": número, "ppt": número },
  "valuables": [{ "name": "gema u objeto de arte con descripción sensorial", "value": número_en_po }],
  "mundane": [{ "name": "objeto curioso o mundano con sabor narrativo" }],
  "magic": [{ "name": "nombre del objeto mágico", "effect": "efecto en 1-2 frases", "rarity": "comun|infrecuente|raro|muy-raro|legendario" }]
}

Haz que TODO sea coherente con la situación descrita. Los objetos de valor deben tener sabor (no solo "una gema"). Los mágicos deben encajar temáticamente.`;

interface AiLoot {
  title?: string;
  coins?: Partial<Loot["coins"]>;
  valuables?: { name: string; value: number }[];
  mundane?: { name: string }[];
  magic?: { name: string; effect: string; rarity: string }[];
}

async function generateLootAI(p: LootParams): Promise<Loot> {
  const desc = (p.desc || "").trim();
  const tier = parseInt(p.tier) || 5;
  const scale = `Escala de poder pedida (tier ${tier}):
- tier 0: pocas monedas (decenas-cientos po), 0-1 objetos de valor, rara vez 1 mágico común
- tier 5: cientos de po, 1-3 objetos de valor, quizá 1 mágico común/infrecuente
- tier 11: miles de po, varios objetos de valor, 1-2 mágicos infrecuentes/raros
- tier 17: decenas de miles de po, objetos de gran valor, 1-3 mágicos raros/muy raros/legendarios`;

  const userPrompt = `Situación: ${desc || "Un botín genérico de aventura."}

${scale}

Genera el botín en JSON, escala tier ${tier}.`;

  const { data } = await callClaudeJSON<AiLoot>({ systemPrompt: AI_SYSTEM, userPrompt, maxTokens: 1800 });

  return {
    id: "loot_ai_" + Date.now(),
    origin: p.origin || "cofre",
    source: p.source === "random" ? "mago" : p.source,
    wealth: p.wealth || "normal",
    tier,
    title: data.title || undefined,
    coins: {
      pc: Number(data.coins?.pc) || 0,
      pp: Number(data.coins?.pp) || 0,
      po: Number(data.coins?.po) || 0,
      ppt: Number(data.coins?.ppt) || 0,
    },
    valuables: Array.isArray(data.valuables)
      ? data.valuables.filter((v) => v && v.name).map((v) => ({ type: "gema" as const, name: v.name, value: Number(v.value) || 0, icon: "◆" }))
      : [],
    mundane: Array.isArray(data.mundane)
      ? data.mundane.filter((m) => m && m.name).map((m) => ({ name: m.name, icon: "✧" }))
      : [],
    magic: Array.isArray(data.magic)
      ? data.magic.filter((m) => m && m.name).map((m) => ({ name: m.name, effect: m.effect || "", rarity: m.rarity || "infrecuente", icon: "✦" }))
      : [],
    createdAt: Date.now(),
  };
}

const config: GeneratorConfig<LootParams, Loot> = {
  toolId: "loot",
  kicker: "☉  Generadores",
  fields: [
    { key: "origin", label: "Origen", type: "select", options: LOOT_ORIGINS },
    { key: "source", label: "Tipo de fuente", type: "select", options: LOOT_SOURCES },
    { key: "tier", label: "Escala (VD / nivel)", type: "select", options: LOOT_TIERS },
    { key: "wealth", label: "Riqueza", type: "select", options: LOOT_WEALTH },
    { key: "magic", label: "Objetos mágicos", type: "select", options: [
      { value: "1", label: "Permitir" },
      { value: "", label: "Sin objetos mágicos" },
    ] },
    { key: "desc", label: "Situación (solo IA)", type: "textarea", placeholder: "Ej. El alijo de un nigromante que coleccionaba dientes humanos, en una cripta bajo un cementerio." },
  ],
  initialParams: { origin: "cadaver", source: "random", tier: "5", wealth: "normal", magic: "1", desc: "" },
  generate: generateLoot,
  generateAI: generateLootAI,
  resultLabel: (l) => l.title || `${LOOT_ORIGIN_NAMES[l.origin] || "Botín"} (${fmt(lootTotalValue(l))} po)`,
  renderResult: (l) => <LootView loot={l} />,
  useSavedStore: useLootStore,
  generateLabel: "Generar botín",
  aiLabel: "Generar con IA",
};

export default function LootPage() {
  return <GeneratorTool config={config} />;
}
