"use client";

import { useState } from "react";
import { GeneratorTool, type GeneratorConfig } from "@/src/components/GeneratorTool";
import { makeSavedStore } from "@/src/store/savedItems";
import { KEYS } from "@/src/lib/storage";
import { callClaudeJSON } from "@/src/lib/ai/client";
import {
  generateDungeon, expandRoom, DGN_TYPE_NAMES, DGN_TAG_NAMES,
  DGN_TYPES, DGN_SIZES, DGN_ROOMCOUNTS, DGN_FACTIONS, DGN_STATES, DGN_DANGERS,
  type Dungeon, type DgnParams, type DgnRoom, type RoomExtra,
} from "@/src/lib/dungeon";

const useDungeonStore = makeSavedStore<Dungeon>(KEYS.dungeons);

const TAG_COLOR: Record<string, string> = {
  encuentro: "#c45a5a", trampa: "#c97e3a", tesoro: "var(--gold)", acertijo: "#5a8fc9",
  vacio: "#7a7a7a", pista: "#6fa86b", jefe: "#b53a3a",
};

const EXPAND_SYSTEM = `Eres un experto Director de Juego de D&D 5e. Detallas una estancia concreta de un lugar de aventura para que sea jugable. RESPONDE SIEMPRE EN ESPAÑOL.

Responde ÚNICAMENTE con un objeto JSON válido, sin markdown:
{
  "readaloud": "Texto breve para leer en voz alta a los jugadores al entrar (2-3 frases sensoriales)",
  "feature": "Un detalle interactivo o interesante de la estancia",
  "content": "Qué ocurre aquí mecánicamente: combate, trampa, tesoro, acertijo... con detalles concretos",
  "danger": "Una complicación o peligro oculto, solo para el DM"
}

Coherente con el tipo de lugar, quién lo habita y el nivel de peligro.`;

const DEEPEN_SYSTEM = `Eres un experto Director de Juego de D&D 5e. Profundizas en una estancia ya descrita, añadiendo UNA nueva capa de detalle que no repita lo ya dicho. RESPONDE SIEMPRE EN ESPAÑOL.

Responde ÚNICAMENTE con un objeto JSON válido, sin markdown:
{
  "title": "Título corto del nuevo aspecto (3-5 palabras)",
  "text": "El nuevo detalle, concreto y jugable, 2-4 frases"
}

Aporta algo NUEVO y útil, no repitas lo que ya se sabe de la sala.`;

const ASPECT_POOL = [
  "Historia oculta de la sala", "Un PNJ o criatura concreta presente", "Botín o tesoro específico aquí",
  "Una trampa o mecanismo adicional", "Pistas y conexiones con otras salas", "Variante táctica del encuentro",
  "Detalle sensorial inmersivo", "Un giro inesperado para el DM", "Cómo reaccionan los habitantes",
  "Opciones de exploración alternativas",
];

function RoomCard({ room, index, dungeon, update }: {
  room: DgnRoom; index: number; dungeon: Dungeon; update: (d: Dungeon) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [deepLoading, setDeepLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patchRoom = (patch: Partial<DgnRoom>) => {
    const rooms = dungeon.rooms.map((r, i) => (i === index ? { ...r, ...patch } : r));
    update({ ...dungeon, rooms });
  };

  const indagar = () => patchRoom({ detail: expandRoom(room, dungeon.faction) });

  const expandAI = async () => {
    setError(null);
    setLoading(true);
    try {
      const userPrompt = `Lugar: ${dungeon.name} — ${dungeon.premise}
Tipo: ${dungeon.type}, habitado por ${dungeon.faction}, estado ${dungeon.state}, peligro ${dungeon.danger}.
Estancia ${room.num}: "${room.name}" (contenido tipo: ${room.content}). ${room.desc}

Detalla esta estancia en el JSON pedido.`;
      const { data } = await callClaudeJSON<{ readaloud?: string; feature?: string; content?: string; danger?: string }>({
        systemPrompt: EXPAND_SYSTEM, userPrompt, maxTokens: 1200,
      });
      patchRoom({ detail: { readaloud: data.readaloud || "", feature: data.feature || "", content: data.content || "", danger: data.danger || "" } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al detallar la estancia");
    } finally {
      setLoading(false);
    }
  };

  const deepen = async () => {
    setError(null);
    setDeepLoading(true);
    try {
      const extras = room.extras || [];
      const covered = extras.map((e) => e.title).join(", ");
      const nextAspect = ASPECT_POOL.find((a) => !covered.includes(a)) || "Más detalle adicional";
      const d = room.detail;
      const prev = `${d?.feature || ""} ${d?.content || ""} ${d?.danger || ""} ${extras.map((e) => e.text).join(" ")}`;
      const userPrompt = `Lugar: ${dungeon.name} (${dungeon.type}, habitado por ${dungeon.faction}, peligro ${dungeon.danger}).
Estancia ${room.num}: "${room.name}" — ${room.desc}
Lo que ya se sabe: ${prev}

Añade una nueva capa sobre el aspecto: "${nextAspect}". Devuelve el JSON.`;
      const { data } = await callClaudeJSON<{ title?: string; text?: string }>({
        systemPrompt: DEEPEN_SYSTEM, userPrompt, maxTokens: 800,
      });
      const extra: RoomExtra = { title: data.title || nextAspect, text: data.text || "" };
      patchRoom({ extras: [...extras, extra] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al profundizar");
    } finally {
      setDeepLoading(false);
    }
  };

  const d = room.detail;
  return (
    <div className="card !p-0 overflow-hidden">
      <div className="flex items-start gap-3 p-3">
        <span className="font-[var(--font-display)] text-lg shrink-0 w-7 text-center" style={{ color: "var(--gold)" }}>{room.num}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-[var(--font-title)] text-ink text-[15px]">{room.name}</span>
            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 border rounded" style={{ color: TAG_COLOR[room.content], borderColor: TAG_COLOR[room.content] }}>
              {DGN_TAG_NAMES[room.content] || room.content}
            </span>
          </div>
          <div className="text-ink-dim text-sm mt-1">{room.desc}</div>
        </div>
        {!d && (
          <div className="flex flex-col gap-1 shrink-0">
            <button className="btn btn-ghost !py-1 !px-2 text-xs" onClick={indagar}>Indagar</button>
            <button className="btn btn-ghost !py-1 !px-2 text-xs" style={{ color: "var(--arcane)" }} onClick={expandAI} disabled={loading}>
              {loading ? "…" : "✨ IA"}
            </button>
          </div>
        )}
      </div>

      {d && (
        <div className="border-t border-dashed flex flex-col gap-2 p-3 text-sm" style={{ borderColor: "var(--line)" }}>
          {d.readaloud && <Detail label="Leer en voz alta"><em>{d.readaloud}</em></Detail>}
          {d.feature && <Detail label="Detalle">{d.feature}</Detail>}
          {d.content && <Detail label="Qué ocurre">{d.content}</Detail>}
          {d.danger && <Detail label="Peligro (DM)" color="var(--blood)">{d.danger}</Detail>}
          {room.extras?.map((ex, i) => <Detail key={i} label={ex.title} color="var(--arcane)">{ex.text}</Detail>)}
          {deepLoading && <div className="text-ink-soft italic">✨ Profundizando aún más…</div>}
          <button className="btn btn-ghost !py-1 !px-2 text-xs self-start mt-1" style={{ color: "var(--arcane)" }} onClick={deepen} disabled={deepLoading}>
            ✨ Profundizar más
          </button>
        </div>
      )}
      {error && <div className="px-3 pb-3 text-xs" style={{ color: "var(--blood)" }}>{error}</div>}
    </div>
  );
}

function Detail({ label, color, children }: { label: string; color?: string; children: React.ReactNode }) {
  return (
    <div className={color ? "pl-2.5 border-l-2" : ""} style={color ? { borderColor: color } : undefined}>
      <div className="label mb-0" style={color ? { color } : undefined}>{label}</div>
      <div className="text-ink-dim">{children}</div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="label">{title}</div>
      {children}
    </div>
  );
}

function DungeonView({ dungeon, update }: { dungeon: Dungeon; update: (d: Dungeon) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="font-[var(--font-body)] italic text-[15px]" style={{ color: "var(--gold)" }}>{dungeon.premise}</p>
        <p className="font-mono text-[10px] tracking-wider uppercase text-ink-soft mt-1">
          {DGN_TYPE_NAMES[dungeon.type] || dungeon.type} · {dungeon.size} · habitado por {dungeon.faction} · {dungeon.state} · peligro {dungeon.danger}
        </p>
      </div>

      <Block title="Atmósfera"><p className="text-ink-dim text-[15px]">{dungeon.atmosphere}</p></Block>

      <Block title={`Estancias (${dungeon.rooms.length})`}>
        <div className="flex flex-col gap-2 mt-1">
          {dungeon.rooms.map((room, i) => (
            <RoomCard key={room.num} room={room} index={i} dungeon={dungeon} update={update} />
          ))}
        </div>
      </Block>

      <Block title="Peligro recurrente del lugar"><p className="text-ink-dim text-[15px]">{dungeon.hazard}</p></Block>
      <Block title="Recompensa / objetivo"><p className="text-ink-dim text-[15px]">{dungeon.reward}</p></Block>

      {dungeon.secrets.length > 0 && (
        <div className="card !p-3" style={{ borderColor: "var(--blood)" }}>
          <div className="label" style={{ color: "var(--blood)" }}>⚠ Solo para el DM — Secretos</div>
          <ul className="list-disc list-inside text-ink-dim flex flex-col gap-1 text-[15px]">
            {dungeon.secrets.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

const config: GeneratorConfig<DgnParams, Dungeon> = {
  toolId: "dungeon",
  kicker: "☉  Generadores",
  fields: [
    { key: "type", label: "Tipo de lugar", type: "select", options: DGN_TYPES },
    { key: "size", label: "Tamaño", type: "select", options: DGN_SIZES },
    { key: "roomcount", label: "Nº exacto de salas", type: "select", options: DGN_ROOMCOUNTS },
    { key: "faction", label: "Quién lo habita", type: "select", options: DGN_FACTIONS },
    { key: "state", label: "Estado", type: "select", options: DGN_STATES },
    { key: "danger", label: "Nivel de peligro", type: "select", options: DGN_DANGERS },
  ],
  initialParams: { type: "random", size: "mediano", roomcount: "auto", faction: "random", state: "random", danger: "medio" },
  generate: generateDungeon,
  resultLabel: (d) => d.name,
  renderResult: (d, update) => <DungeonView dungeon={d} update={update} />,
  useSavedStore: useDungeonStore,
  generateLabel: "Generar lugar",
};

export default function DungeonPage() {
  return <GeneratorTool config={config} />;
}
