// JSON extraction + repair — ported verbatim from arcanum-41.html (extractJSON /
// tryRepairJSON, ~line 35061). Critical for handling responses truncated at the token limit.

export function tryRepairJSON(text: string, start: number): unknown | null {
  if (start < 0) start = text.indexOf("{");
  if (start < 0) return null;
  let s = text.substring(start);
  s = s.replace(/```[\s\S]*$/, "");
  const stack: string[] = [];
  let inString = false;
  let escape = false;
  let lastValidComma = -1;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\") { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{" || ch === "[") stack.push(ch);
    else if (ch === "}" || ch === "]") stack.pop();
    else if (ch === "," && stack.length) lastValidComma = i;
  }
  let candidate = s;
  if (inString) candidate += '"';
  candidate = candidate.replace(/,\s*$/, "");
  for (let i = stack.length - 1; i >= 0; i--) candidate += stack[i] === "{" ? "}" : "]";
  try { return JSON.parse(candidate); } catch { /* try next */ }

  if (lastValidComma > 0) {
    let c2 = s.substring(0, lastValidComma);
    const stack2: string[] = [];
    let inStr2 = false;
    let esc2 = false;
    for (let i = 0; i < c2.length; i++) {
      const ch = c2[i];
      if (esc2) { esc2 = false; continue; }
      if (ch === "\\") { esc2 = true; continue; }
      if (ch === '"') { inStr2 = !inStr2; continue; }
      if (inStr2) continue;
      if (ch === "{" || ch === "[") stack2.push(ch);
      else if (ch === "}" || ch === "]") stack2.pop();
    }
    if (inStr2) c2 += '"';
    for (let i = stack2.length - 1; i >= 0; i--) c2 += stack2[i] === "{" ? "}" : "]";
    try { return JSON.parse(c2); } catch { /* give up */ }
  }
  return null;
}

export function extractJSON<T = unknown>(text: string): T {
  try { return JSON.parse(text) as T; } catch { /* continue */ }

  const m1 = text.match(/```json\s*([\s\S]+?)\s*```/);
  if (m1) {
    try { return JSON.parse(m1[1]) as T; } catch { /* continue */ }
  }

  const start = text.indexOf("{");
  if (start >= 0) {
    let depth = 0;
    let end = -1;
    let inString = false;
    let escape = false;
    for (let i = start; i < text.length; i++) {
      const ch = text[i];
      if (escape) { escape = false; continue; }
      if (ch === "\\") { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }
    if (end > 0) {
      try { return JSON.parse(text.substring(start, end + 1)) as T; } catch { /* continue */ }
    }
  }

  const repaired = tryRepairJSON(text, start);
  if (repaired) return repaired as T;
  throw new Error("No se pudo extraer un JSON válido de la respuesta de la IA.");
}
