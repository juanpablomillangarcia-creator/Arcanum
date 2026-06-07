import { SRD_DATA, type SrdEntry, type SrdSection } from "@/src/data/srd";

export type { SrdEntry, SrdSection };

export interface CompType {
  id: string;
  label: string;
  icon: string;
}

export const COMP_TYPES: CompType[] = [
  { id: "todos", label: "Todo", icon: "⌬" },
  { id: "hechizo", label: "Hechizos", icon: "✦" },
  { id: "monstruo", label: "Monstruos", icon: "♆" },
  { id: "clase", label: "Clases", icon: "☥" },
  { id: "raza", label: "Razas", icon: "☉" },
  { id: "objeto", label: "Equipo", icon: "⚱" },
  { id: "arma", label: "Armas", icon: "⚔" },
  { id: "armadura", label: "Armaduras", icon: "⛨" },
  { id: "trasfondo", label: "Trasfondos", icon: "☖" },
  { id: "condicion", label: "Estados", icon: "⌭" },
  { id: "habilidad", label: "Habilidades", icon: "☗" },
  { id: "idioma", label: "Idiomas", icon: "☊" },
  { id: "alineamiento", label: "Alineamientos", icon: "⚖" },
  { id: "regla", label: "Reglas", icon: "⚙" },
];

export interface SubFilter {
  id: string;
  label: string;
}

export const SPELL_LEVEL_FILTERS: SubFilter[] = [
  { id: "truco", label: "Truco" },
  { id: "1", label: "1" }, { id: "2", label: "2" }, { id: "3", label: "3" },
  { id: "4", label: "4" }, { id: "5", label: "5" }, { id: "6", label: "6" },
  { id: "7", label: "7" }, { id: "8", label: "8" }, { id: "9", label: "9" },
];

export const CR_FILTERS: SubFilter[] = [
  "0", "1/8", "1/4", "1/2", "1", "2", "3", "5", "10", "13", "21",
].map((c) => ({ id: c, label: `VD ${c}` }));

export const EQUIPMENT_SUB_FILTERS: SubFilter[] = [
  { id: "arma", label: "Armas" },
  { id: "armadura", label: "Armaduras" },
  { id: "consumible", label: "Consumibles" },
  { id: "equipo", label: "Equipo" },
];

export type CompSource = "all" | "srd" | "homebrew";

export interface CompFilters {
  type: string;
  source: CompSource;
  search: string;
  subfilter: string | null;
}

export function getSubFilters(typeId: string): SubFilter[] | null {
  if (typeId === "hechizo") return SPELL_LEVEL_FILTERS;
  if (typeId === "monstruo") return CR_FILTERS;
  if (typeId === "objeto") return EQUIPMENT_SUB_FILTERS;
  return null;
}

export function getAllEntries(homebrew: SrdEntry[]): (SrdEntry & { source: string })[] {
  // SRD_DATA has a few duplicate monster entries (extraction artifact); dedupe by
  // type+name so the Compendio shows each entry once.
  const seen = new Set<string>();
  const srd = SRD_DATA
    .filter((e) => {
      const key = `${e.type}::${e.name.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((e) => ({ ...e, source: "srd" }));
  const hb = homebrew.map((e) => ({ ...e, source: "homebrew" }));
  return [...srd, ...hb];
}

export function filterEntries(
  entries: (SrdEntry & { source: string })[],
  filters: CompFilters,
): (SrdEntry & { source: string })[] {
  let result = entries;

  if (filters.type !== "todos") {
    result = result.filter((e) => e.type === filters.type);
  }
  if (filters.source !== "all") {
    result = result.filter((e) => e.source === filters.source);
  }
  if (filters.subfilter) {
    result = result.filter((e) => e.subtype === filters.subfilter);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.text || "").toLowerCase().includes(q) ||
        (e.meta || "").toLowerCase().includes(q),
    );
  }

  return result.sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function typeCount(
  entries: (SrdEntry & { source: string })[],
  typeId: string,
): number {
  if (typeId === "todos") return entries.length;
  return entries.filter((e) => e.type === typeId).length;
}

export function typeLabel(typeId: string): string {
  return (COMP_TYPES.find((t) => t.id === typeId)?.label || typeId).replace(/s$/, "");
}

export function formatSectionHtml(text: string): string {
  if (!text) return "";
  let out = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  out = out.replace(/━━━\s*(.+?)\s*━━━/g, '<h4 class="font-[var(--font-title)] text-lg text-ink mt-4 mb-1">$1</h4>');

  if (/Nivel\s+\d+/.test(out)) {
    const parts = out.split(/(?=Nivel\s+\d+(?:\s*\([^)]+\))?\s*[:·])/);
    if (parts.length > 1) {
      const intro = parts[0].trim();
      const levels = parts
        .slice(1)
        .map((p) => {
          const m = p.match(/^(Nivel\s+\d+(?:\s*\([^)]+\))?)\s*[:·]\s*([\s\S]+)$/);
          if (m)
            return `<div class="flex gap-2 mb-1"><span class="tag shrink-0 !text-[10px]">${m[1]}</span><span class="text-ink-dim text-sm">${m[2].trim()}</span></div>`;
          return `<div class="text-sm text-ink-dim">${p}</div>`;
        })
        .join("");
      return (intro ? `<p class="text-sm text-ink-dim mb-2">${intro}</p>` : "") + levels;
    }
  }

  const emDashCount = (out.match(/\s—\s/g) || []).length;
  if (emDashCount >= 2 && out.length > 200) {
    const items = out
      .split(/\s—\s/)
      .map((s) => s.trim())
      .filter(Boolean);
    return "<ul class='list-disc list-inside flex flex-col gap-1 text-sm text-ink-dim'>" + items.map((i) => `<li>${i}</li>`).join("") + "</ul>";
  }

  if (
    /\.\s+[A-ZÁÉÍÓÚÑ][\wáéíóúñ]+(?:\s+[\wáéíóúñ]+){0,4}:\s/.test(out) &&
    out.length > 200
  ) {
    const items = out
      .split(/(?=\.\s+[A-ZÁÉÍÓÚÑ][\wáéíóúñ]+(?:\s+[\wáéíóúñ]+){0,4}:\s)/)
      .map((s) => s.trim().replace(/^\.\s*/, ""))
      .filter(Boolean);
    if (items.length >= 3) {
      return (
        "<ul class='list-disc list-inside flex flex-col gap-1 text-sm text-ink-dim'>" +
        items
          .map((i) => {
            const m = i.match(/^([^:]+:)\s*([\s\S]+)$/);
            if (m) return `<li><strong class="text-ink">${m[1]}</strong> ${m[2]}</li>`;
            return `<li>${i}</li>`;
          })
          .join("") +
        "</ul>"
      );
    }
  }

  return `<p class="text-sm text-ink-dim">${out}</p>`;
}
