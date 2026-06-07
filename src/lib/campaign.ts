import type { Campaign } from "@/src/store/campaign";
import { CAMP_FICHA_KINDS, CAMP_REL_TYPES, CAMP_THREAD_STATUS } from "@/src/data/campaign-tables";

export function buildCampaignContext(c: Campaign): string {
  const parts: string[] = [];

  parts.push(`Campaña: ${c.name}`);
  if (c.type) parts.push(`Tipo: ${c.type}`);
  if (c.level) parts.push(`Nivel: ${c.level}`);
  if (c.tone) parts.push(`Tono: ${c.tone}`);
  if (c.premise) parts.push(`Premisa: ${c.premise}`);

  if (c.entities.length) {
    parts.push("\n=== ENTIDADES ===");
    for (const e of c.entities) {
      const kind = CAMP_FICHA_KINDS[e.kind]?.label || e.kind;
      parts.push(`- ${kind}: ${e.name}${e.status ? ` (${e.status})` : ""}`);
      if (e.desc) parts.push(`  ${e.desc}`);
      if (e.lore) parts.push(`  Lore: ${e.lore}`);
    }
  }

  if (c.relations.length) {
    parts.push("\n=== RELACIONES ===");
    for (const r of c.relations) {
      const from = c.entities.find((e) => e.id === r.from)?.name || r.from;
      const to = c.entities.find((e) => e.id === r.to)?.name || r.to;
      const type = CAMP_REL_TYPES[r.type]?.label || r.type;
      parts.push(`- ${from} → ${to}: ${type}${r.note ? ` (${r.note})` : ""}`);
    }
  }

  if (c.threads.length) {
    parts.push("\n=== TRAMAS ===");
    for (const t of c.threads) {
      const status = CAMP_THREAD_STATUS[t.status]?.label || t.status;
      parts.push(`- ${t.title} [${status}]${t.future ? " (cabo suelto)" : ""}`);
      if (t.desc) parts.push(`  ${t.desc}`);
    }
  }

  if (c.sessions.length) {
    parts.push("\n=== SESIONES ===");
    const recent = c.sessions.slice(-5);
    for (const s of recent) {
      parts.push(`Sesión ${s.num}: ${s.title || "(sin título)"}${s.date ? ` — ${s.date}` : ""}`);
      if (s.body) parts.push(`  ${s.body.substring(0, 200)}${s.body.length > 200 ? "..." : ""}`);
    }
  }

  if (c.notes.length) {
    parts.push("\n=== NOTAS RÁPIDAS ===");
    for (const n of c.notes) {
      parts.push(`- ${n.text}`);
    }
  }

  if (c.notebook.length) {
    parts.push("\n=== CUADERNO ===");
    for (const p of c.notebook) {
      parts.push(`- ${p.title || "(sin título)"}: ${p.body.substring(0, 200)}${p.body.length > 200 ? "..." : ""}`);
    }
  }

  return parts.join("\n");
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 99999)}`;
}
