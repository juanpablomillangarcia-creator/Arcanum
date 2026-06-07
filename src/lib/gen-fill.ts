// Shared template-fill engine, ported from arcanum-41.html (genPick/genFill/genUnique/genLearn).
// Templates use {{bank}} placeholders resolved from GEN_BANKS plus session-learned pieces.

import { GEN_BANKS } from "@/src/data/gen-banks";

const learned: Record<string, string[]> = {};

export function genPick(bank: string): string {
  let pool = GEN_BANKS[bank] ? [...GEN_BANKS[bank]] : [];
  if (learned[bank]?.length) pool = pool.concat(learned[bank]);
  if (!pool.length) return "";
  return pool[Math.floor(Math.random() * pool.length)];
}

export function genFill(template: string): string {
  let text = template.replace(/\{\{(\w+)\}\}/g, (_m, bank: string) => genPick(bank));
  text = text.replace(/\ba el\b/g, "al").replace(/\bde el\b/g, "del").replace(/\bllos\b/g, "los");
  return text;
}

export function genUnique(templates: string[], n: number, maxTries?: number): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  let tries = 0;
  const cap = maxTries || n * 40;
  while (out.length < n && tries < cap) {
    tries++;
    const tpl = templates[Math.floor(Math.random() * templates.length)];
    const text = genFill(tpl);
    if (!seen.has(text)) { seen.add(text); out.push(text); }
  }
  return out;
}

/** Collect generated names so later generations can reference them. */
export function genLearn(bank: string, value: string): void {
  if (!value || typeof value !== "string") return;
  value = value.trim();
  if (value.length < 2 || value.length > 60) return;
  if (!learned[bank]) learned[bank] = [];
  if (!learned[bank].includes(value) && !(GEN_BANKS[bank] || []).includes(value)) {
    learned[bank].push(value);
    if (learned[bank].length > 60) learned[bank].shift();
  }
}
