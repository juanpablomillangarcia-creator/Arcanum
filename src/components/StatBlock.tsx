"use client";

import type { SrdEntry, SrdSection } from "@/src/data/srd";
import { formatSectionHtml } from "@/src/lib/search";

const HEADER_TITLES = new Set([
  "clase de armadura", "ca", "puntos de golpe", "pg", "velocidad",
  "características", "atributos",
  "tiradas de salvación", "salvaciones",
  "habilidades", "sentidos", "idiomas", "desafío", "valor de desafío", "vd",
  "vulnerabilidades al daño", "vulnerabilidades",
  "resistencias al daño", "resistencias",
  "inmunidades al daño", "inmunidades a estados", "inmunidades a condiciones",
]);

const ACTION_HEADERS = new Set(["acciones", "reacciones", "acciones legendarias", "acciones adicionales", "rasgos"]);

function getSec(sections: SrdSection[], names: string[]): string | null {
  const lower = names.map((n) => n.toLowerCase());
  for (const s of sections) {
    if (lower.includes(s.t.toLowerCase())) return s.d;
  }
  return null;
}

function parseAttrs(attrStr: string): { name: string; score: string; mod: string }[] {
  const order = ["FUE", "DES", "CON", "INT", "SAB", "CAR"];
  const found: Record<string, { score: string; mod: string }> = {};
  const re = /(FUE|DES|CON|INT|SAB|CAR)\s+(\d+)\s*\(([+\-]?\d+)\)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(attrStr)) !== null) {
    found[m[1].toUpperCase()] = { score: m[2], mod: m[3] };
  }
  return order.map((a) => ({
    name: a,
    score: found[a]?.score ?? "—",
    mod: found[a]?.mod ?? "+0",
  }));
}

function formatActions(text: string): { name: string; desc: string }[] {
  if (!text) return [];
  let parts = text.split(/\s+—\s+/).map((s) => s.trim()).filter(Boolean);
  if (parts.length === 1) {
    const m = [...text.matchAll(/([A-ZÁÉÍÓÚÑ][^:.]{1,40}?):\s/g)];
    if (m.length >= 2) {
      parts = text
        .split(/(?=[A-ZÁÉÍÓÚÑ][^:.]{1,40}?:\s)/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return parts.map((p) => {
    const m = p.match(/^([^:]{1,45}?):\s*([\s\S]+)$/);
    if (m) return { name: m[1].trim(), desc: m[2].trim() };
    return { name: "", desc: p };
  });
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 py-0.5 text-sm">
      <span className="font-[var(--font-title)] font-semibold text-ink shrink-0">{label}</span>
      <span className="text-ink-dim">{value}</span>
    </div>
  );
}

export function StatBlock({ entry }: { entry: SrdEntry }) {
  const secs = entry.sections || [];
  const ca = getSec(secs, ["Clase de Armadura", "CA"]);
  const hp = getSec(secs, ["Puntos de Golpe", "PG"]);
  const speed = getSec(secs, ["Velocidad"]);
  const attrs = getSec(secs, ["Características", "Atributos"]);
  const saves = getSec(secs, ["Tiradas de Salvación", "Salvaciones"]);
  const skills = getSec(secs, ["Habilidades"]);
  const senses = getSec(secs, ["Sentidos"]);
  const langs = getSec(secs, ["Idiomas"]);
  const cr = getSec(secs, ["Desafío", "Valor de Desafío", "VD"]);
  const dmgVuln = getSec(secs, ["Vulnerabilidades al Daño", "Vulnerabilidades"]);
  const dmgRes = getSec(secs, ["Resistencias al Daño", "Resistencias"]);
  const dmgImm = getSec(secs, ["Inmunidades al Daño"]);
  const condImm = getSec(secs, ["Inmunidades a Estados", "Inmunidades a Condiciones"]);

  const bodySecs = secs.filter(
    (s) => !HEADER_TITLES.has(s.t.toLowerCase()) && !/━━━/.test(s.t),
  );

  const attrRows = attrs ? parseAttrs(attrs) : [];

  return (
    <div className="flex flex-col gap-0 border border-[var(--line-bright)] rounded-lg overflow-hidden">
      <div className="bg-[var(--bg-card-2)] px-4 py-3 border-b border-[var(--line)]">
        <h2 className="font-[var(--font-display)] text-2xl text-ink leading-tight">{entry.name}</h2>
        <div className="font-[var(--font-mono)] text-[11px] tracking-wider uppercase mt-0.5" style={{ color: "var(--acc)" }}>
          {entry.meta || ""}
        </div>
      </div>

      {entry.text && (
        <div className="px-4 py-2 text-sm italic text-ink-soft border-b border-[var(--line)]">
          {entry.text}
        </div>
      )}

      <div className="px-4 py-2 border-b border-[var(--line)] flex flex-col gap-0.5">
        {ca && <StatLine label="Clase de Armadura" value={ca} />}
        {hp && <StatLine label="Puntos de Golpe" value={hp} />}
        {speed && <StatLine label="Velocidad" value={speed} />}
      </div>

      {attrRows.length > 0 && (
        <div className="grid grid-cols-6 border-b border-[var(--line)]">
          {attrRows.map((a) => (
            <div key={a.name} className="text-center py-2 border-r last:border-r-0 border-[var(--line)]">
              <div className="font-[var(--font-mono)] text-[10px] tracking-wider text-ink-soft">{a.name}</div>
              <div className="font-[var(--font-display)] text-lg text-ink">{a.score}</div>
              <div className="text-xs" style={{ color: "var(--acc)" }}>
                {a.mod.startsWith("+") || a.mod.startsWith("-") ? `(${a.mod})` : `(+${a.mod})`}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 py-2 border-b border-[var(--line)] flex flex-col gap-0.5">
        {saves && <StatLine label="Salvaciones" value={saves} />}
        {skills && <StatLine label="Habilidades" value={skills} />}
        {dmgVuln && <StatLine label="Vulnerabilidades" value={dmgVuln} />}
        {dmgRes && <StatLine label="Resistencias" value={dmgRes} />}
        {dmgImm && <StatLine label="Inmunidades al daño" value={dmgImm} />}
        {condImm && <StatLine label="Inmunidades a estados" value={condImm} />}
        {senses && <StatLine label="Sentidos" value={senses} />}
        {langs && <StatLine label="Idiomas" value={langs} />}
        {cr && <StatLine label="Desafío" value={cr} />}
      </div>

      {bodySecs.length > 0 && (
        <div className="px-4 py-3 flex flex-col gap-3">
          {bodySecs.map((s, i) => {
            const isAction = ACTION_HEADERS.has(s.t.toLowerCase());
            if (isAction) {
              const actions = formatActions(s.d);
              return (
                <div key={i}>
                  <div className="font-[var(--font-title)] text-lg text-ink border-b border-[var(--line)] pb-0.5 mb-2">
                    {s.t}
                  </div>
                  <div className="flex flex-col gap-2">
                    {actions.map((a, j) => (
                      <div key={j} className="text-sm">
                        {a.name && <span className="font-semibold text-ink">{a.name}. </span>}
                        <span className="text-ink-dim" dangerouslySetInnerHTML={{ __html: formatSectionHtml(a.desc) }} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <div key={i} className="text-sm">
                <span className="font-semibold text-ink">{s.t}. </span>
                <span className="text-ink-dim" dangerouslySetInnerHTML={{ __html: formatSectionHtml(s.d) }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
