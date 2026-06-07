"use client";

import { useState } from "react";
import { GeneratorTool, type GeneratorConfig } from "@/src/components/GeneratorTool";
import { makeSavedStore } from "@/src/store/savedItems";
import { KEYS } from "@/src/lib/storage";
import { callClaudeJSON } from "@/src/lib/ai/client";
import {
  generateCity, expandDistrict, expandGuild, expandQuest,
  CITY_SIZES, CITY_STYLES, CITY_WEALTHS, CITY_GOVERNMENTS, CITY_TERRAINS, CITY_CLIMATES,
  type City, type CityParams, type DistrictDetail, type GuildDetail, type BoardDetail,
} from "@/src/lib/city";

const useCityStore = makeSavedStore<City>(KEYS.cities);

/* ---- shared expandable-card detail row ---- */
function Row({ label, color, children }: { label: string; color?: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className={color ? "pl-2.5 border-l-2" : ""} style={color ? { borderColor: color } : undefined}>
      <div className="label mb-0" style={color ? { color } : undefined}>{label}</div>
      <div className="text-ink-dim text-sm">{children}</div>
    </div>
  );
}

/** Generic "Indagar + IA" expandable block; manages its own loading/error. */
function Expandable<D>({ detail, indagar, expandAI, children }: {
  detail: D | null | undefined;
  indagar: () => void;
  expandAI: () => Promise<void>;
  children: (d: D) => React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const runAI = async () => {
    setError(null); setLoading(true);
    try { await expandAI(); } catch (e) { setError(e instanceof Error ? e.message : "Error"); } finally { setLoading(false); }
  };
  if (detail) {
    return (
      <div className="mt-2 border-t border-dashed pt-2 flex flex-col gap-2" style={{ borderColor: "var(--line)" }}>
        {children(detail)}
      </div>
    );
  }
  return (
    <div className="flex gap-1 mt-2">
      <button className="btn btn-ghost !py-1 !px-2 text-xs" onClick={indagar}>Indagar</button>
      <button className="btn btn-ghost !py-1 !px-2 text-xs" style={{ color: "var(--arcane)" }} onClick={runAI} disabled={loading}>
        {loading ? "…" : "✨ IA"}
      </button>
      {error && <span className="text-xs self-center" style={{ color: "var(--blood)" }}>{error}</span>}
    </div>
  );
}

const ctx = (c: City) => `Ciudad: ${c.name} (${c.size}, estilo ${c.style}, gobierno ${c.government}, ${c.terrain}, prosperidad ${c.wealth}).`;

/* ---- districts ---- */
const DISTRICT_SYS = `Eres un experto Director de Juego de D&D 5e. Detallas un distrito concreto de una ciudad para que sea explorable. RESPONDE SIEMPRE EN ESPAÑOL.

Responde ÚNICAMENTE con un objeto JSON válido, sin markdown:
{
  "atmosphere": "El ambiente sensorial del barrio (olores, sonidos, luz)",
  "streets": "Cómo son las calles y el trazado del distrito",
  "landmark": "Un lugar concreto y memorable dentro del distrito",
  "local": "Un vecino conocido del barrio, con nombre y un rasgo",
  "danger": "Un peligro o tensión latente, solo para el DM"
}

Sé concreto y evocador, coherente con la ciudad.`;

const GUILD_SYS = `Eres un experto Director de Juego de D&D 5e. Detallas un gremio concreto dentro de una ciudad ya establecida. RESPONDE SIEMPRE EN ESPAÑOL.

Responde ÚNICAMENTE con un objeto JSON válido, sin markdown:
{
  "leader": "Título, nombre y una frase que describa al líder del gremio",
  "sede": "Descripción del edificio/sede del gremio en 1 frase",
  "services": "Qué ofrece el gremio a sus miembros, 1-2 frases",
  "fee": "Qué se exige para afiliarse",
  "quest": "Un encargo o misión concreta que el gremio ofrece ahora mismo",
  "rivalry": "Su relación con otros gremios o facciones",
  "secret": "Un secreto del gremio que solo el DM debería conocer"
}

Sé evocador, específico y coherente con el contexto de la ciudad. Evita clichés genéricos.`;

const QUEST_SYS = `Eres un experto Director de Juego de D&D 5e. Desarrollas una entrada de tablón de misiones dentro de una ciudad concreta hasta convertirla en una misión jugable. RESPONDE SIEMPRE EN ESPAÑOL.

Responde ÚNICAMENTE con un objeto JSON válido, sin markdown:
{
  "patron": "Quién pone el anuncio y por qué, con un detalle de personalidad",
  "context": "Trasfondo de la situación: qué pasa y por qué importa ahora",
  "complication": "Una complicación inesperada que enredará a los aventureros",
  "reward": "La recompensa concreta, con cifras o detalles tangibles",
  "twist": "Un giro o verdad oculta que solo el DM debería conocer"
}

Sé concreto y evocador. Coherente con el tono de la ciudad.`;

/** Parse a board entry's leading "<strong>Label:</strong> rest" into pieces. */
function boardParts(text: string): { label: string; rest: string } {
  const m = text.match(/^<strong>(.*?)<\/strong>\s*(.*)$/);
  if (m) return { label: m[1], rest: m[2] };
  return { label: "", rest: text.replace(/<[^>]+>/g, "") };
}

function CityView({ city, update }: { city: City; update: (c: City) => void }) {
  const patch = <K extends keyof City>(key: K, value: City[K]) => update({ ...city, [key]: value });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="italic" style={{ color: "var(--gold)" }}>&ldquo;{city.motto}&rdquo;</p>
        <p className="font-mono text-[10px] tracking-wider uppercase text-ink-soft mt-1">
          {city.size} · {city.population.toLocaleString("es-ES")} hab. · {city.style} · {city.wealth} · {city.government} · {city.terrain} · {city.climate}
        </p>
      </div>

      {city.traits.length > 0 && (
        <div>
          <div className="label">✦ Carácter de la ciudad</div>
          <ul className="list-disc list-inside text-ink-dim flex flex-col gap-1 text-[15px]">
            {city.traits.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      )}

      <div>
        <div className="label">Trasfondo de la ciudad</div>
        <div className="flex flex-col gap-2">
          <Row label="Fundación">La ciudad {city.history}.</Row>
          <Row label="Fe dominante">Se venera a {city.deity}.</Row>
          <Row label="Ahora mismo">Estos días {city.event}.</Row>
          <Row label="Poder en la sombra (DM)" color="var(--blood)">Opera en secreto {city.faction}.</Row>
        </div>
      </div>

      <div>
        <div className="label">Distritos</div>
        <div className="flex flex-col gap-2">
          {city.districts.map((d, i) => (
            <div key={i} className="card !p-3">
              <div className="font-[var(--font-title)] text-ink text-[15px]">{d.name}</div>
              <div className="text-ink-dim text-sm">{d.desc}</div>
              <Expandable
                detail={d.detail}
                indagar={() => patch("districts", city.districts.map((x, j) => (j === i ? { ...x, detail: expandDistrict() } : x)))}
                expandAI={async () => {
                  const { data } = await callClaudeJSON<DistrictDetail>({ systemPrompt: DISTRICT_SYS, userPrompt: `${ctx(city)}\nDistrito: "${d.name}" — ${d.desc}\n\nDetalla este distrito en el JSON pedido.`, maxTokens: 1200 });
                  patch("districts", city.districts.map((x, j) => (j === i ? { ...x, detail: data } : x)));
                }}
              >
                {(x) => <>
                  <Row label="Ambiente">{x.atmosphere}</Row>
                  <Row label="Calles">{x.streets}</Row>
                  <Row label="Lugar notable">{x.landmark}</Row>
                  <Row label="Vecino conocido">{x.local}</Row>
                  <Row label="Peligro (DM)" color="var(--blood)">{x.danger}</Row>
                </>}
              </Expandable>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="label">Edificios destacables</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {city.buildings.map((b, i) => (
            <div key={i} className="flex items-center gap-3 card !p-3">
              <span className="text-lg">{b.icon}</span>
              <div className="min-w-0">
                <div className="text-ink text-[15px] truncate">{b.name}</div>
                <div className="label mb-0">{b.type}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="label">Gremios activos</div>
        <div className="flex flex-col gap-2">
          {city.guilds.map((g, i) => (
            <div key={i} className="card !p-3">
              <div className="font-[var(--font-title)] text-ink text-[15px]">{g.name}</div>
              <Expandable
                detail={g.detail}
                indagar={() => patch("guilds", city.guilds.map((x, j) => (j === i ? { ...x, detail: expandGuild() } : x)))}
                expandAI={async () => {
                  const { data } = await callClaudeJSON<GuildDetail>({ systemPrompt: GUILD_SYS, userPrompt: `${ctx(city)}\nGremio a detallar: "${g.name}".\n\nGenera el JSON con el detalle de este gremio en esta ciudad concreta.`, maxTokens: 1200 });
                  patch("guilds", city.guilds.map((x, j) => (j === i ? { ...x, detail: data } : x)));
                }}
              >
                {(d) => <>
                  <Row label="Líder">{d.leader}</Row>
                  <Row label="Sede">{d.sede}</Row>
                  <Row label="Servicios">{d.services}</Row>
                  <Row label="Afiliación">{d.fee}</Row>
                  <Row label="Encargo disponible">{d.quest}</Row>
                  <Row label="Rivalidades">{d.rivalry}</Row>
                  <Row label="Secreto (DM)" color="var(--blood)">{d.secret}</Row>
                </>}
              </Expandable>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="label">Figuras clave</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {city.npcs.map((n, i) => (
            <div key={i} className="flex items-center gap-3 card !p-3">
              <span className="text-lg" style={{ color: "var(--acc)" }}>☉</span>
              <div className="min-w-0">
                <div className="text-ink text-[15px] truncate">{n.name}</div>
                <div className="label mb-0">{n.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="label">Rumores que se oyen</div>
        <ul className="list-disc list-inside text-ink-dim flex flex-col gap-1 text-[15px]">
          {city.rumors.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </div>

      <div>
        <div className="label">Tablón de anuncios</div>
        <div className="flex flex-col gap-2">
          {city.board.map((b, i) => {
            const { label, rest } = boardParts(b.text);
            return (
              <div key={i} className="card !p-3">
                <div className="text-ink-dim text-sm">
                  {label && <strong className="text-ink">{label} </strong>}{rest}
                </div>
                <Expandable
                  detail={b.detail}
                  indagar={() => patch("board", city.board.map((x, j) => (j === i ? { ...x, detail: expandQuest() } : x)))}
                  expandAI={async () => {
                    const plain = b.text.replace(/<[^>]+>/g, "");
                    const { data } = await callClaudeJSON<BoardDetail>({ systemPrompt: QUEST_SYS, userPrompt: `${ctx(city)}\nAnuncio del tablón: "${plain}".\n\nDesarrolla esta misión en el JSON pedido.`, maxTokens: 1200 });
                    patch("board", city.board.map((x, j) => (j === i ? { ...x, detail: data } : x)));
                  }}
                >
                  {(d) => <>
                    <Row label="Quién lo pone">{d.patron}</Row>
                    <Row label="Contexto">{d.context}</Row>
                    <Row label="Complicación">{d.complication}</Row>
                    <Row label="Recompensa">{d.reward}</Row>
                    <Row label="Giro (DM)" color="var(--blood)">{d.twist}</Row>
                  </>}
                </Expandable>
              </div>
            );
          })}
        </div>
      </div>

      {city.secrets.length > 0 && (
        <div className="card !p-3" style={{ borderColor: "var(--blood)" }}>
          <div className="label" style={{ color: "var(--blood)" }}>⚠ Solo para el DM — Secretos</div>
          <ul className="list-disc list-inside text-ink-dim flex flex-col gap-1 text-[15px]">
            {city.secrets.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

const config: GeneratorConfig<CityParams, City> = {
  toolId: "city",
  kicker: "☉  Generadores",
  fields: [
    { key: "size", label: "Tamaño", type: "select", options: CITY_SIZES },
    { key: "style", label: "Estilo / ambiente", type: "select", options: CITY_STYLES },
    { key: "wealth", label: "Prosperidad", type: "select", options: CITY_WEALTHS },
    { key: "government", label: "Gobierno", type: "select", options: CITY_GOVERNMENTS },
    { key: "terrain", label: "Terreno / ubicación", type: "select", options: CITY_TERRAINS },
    { key: "climate", label: "Clima dominante", type: "select", options: CITY_CLIMATES },
  ],
  initialParams: { size: "pueblo", style: "random", wealth: "modesta", government: "random", terrain: "random", climate: "random" },
  generate: generateCity,
  resultLabel: (c) => c.name,
  renderResult: (c, update) => <CityView city={c} update={update} />,
  useSavedStore: useCityStore,
  generateLabel: "Generar ciudad",
};

export default function CityPage() {
  return <GeneratorTool config={config} />;
}
