"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { PageHeader } from "@/src/components/PageHeader";
import { useBestiaryStore } from "@/src/store/bestiary";
import { useEncounterStore } from "@/src/store/encounter";
import { useTrackerStore } from "@/src/store/tracker";
import { callClaudeJSON } from "@/src/lib/ai/client";
import { crToXP, getAllCreatures } from "@/src/lib/bestiary";
import {
  generateEncounter,
  calculateEncounterDifficulty,
  CREATURE_TYPE_OPTIONS,
  type EncounterParams,
  type EncounterResult,
  type EncounterCreature,
} from "@/src/lib/encounter";
import {
  getPartyThresholds,
  DIFFICULTY_NAMES,
  type Difficulty,
} from "@/src/data/encounter-tables";

const AI_SYSTEM = `Eres un experto Director de Juego de D&D 5e. Tu tarea es proponer encuentros temáticos balanceados usando criaturas concretas de un Bestiario dado.

REGLAS CRÍTICAS:
1. Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown.
2. Todos los nombres de criatura deben ser IDÉNTICOS a los del Bestiario. No inventes nombres.
3. Los textos en español.

ESTRUCTURA EXACTA DEL JSON:
{
  "creatures": [
    { "name": "Nombre exacto del Bestiario", "qty": 3 },
    { "name": "Otro nombre exacto", "qty": 1 }
  ],
  "narrative": "Descripción evocadora de 2-3 frases."
}`;

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="label mb-0">{label}</span>
      <div className="flex items-center gap-2">
        <button
          className="btn btn-ghost !min-h-[32px] !py-0 !px-3 !text-base"
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          −
        </button>
        <span className="font-[var(--font-display)] text-xl text-ink w-8 text-center">{value}</span>
        <button
          className="btn btn-ghost !min-h-[32px] !py-0 !px-3 !text-base"
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function EncounterPage() {
  const homebrew = useBestiaryStore((s) => s.homebrew);
  const saved = useEncounterStore((s) => s.saved);
  const addSaved = useEncounterStore((s) => s.add);
  const removeSaved = useEncounterStore((s) => s.remove);
  const addCombatant = useTrackerStore((s) => s.add);

  const [partySize, setPartySize] = useState(4);
  const [partyLevel, setPartyLevel] = useState(5);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [minEnemies, setMinEnemies] = useState(1);
  const [maxEnemies, setMaxEnemies] = useState(5);
  const [filterType, setFilterType] = useState("");
  const [filterSource, setFilterSource] = useState("");

  const [proposal, setProposal] = useState<EncounterResult | null>(null);
  const [aiTheme, setAiTheme] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [saveName, setSaveName] = useState("");

  const allCreatures = useMemo(() => getAllCreatures(homebrew), [homebrew]);
  const thresholds = useMemo(() => getPartyThresholds(partySize, partyLevel), [partySize, partyLevel]);

  const params: EncounterParams = useMemo(() => ({
    partySize,
    partyLevel,
    difficulty,
    minEnemies: Math.min(minEnemies, maxEnemies),
    maxEnemies: Math.max(minEnemies, maxEnemies),
    filterType,
    filterSource,
  }), [partySize, partyLevel, difficulty, minEnemies, maxEnemies, filterType, filterSource]);

  const handleGenerate = useCallback(() => {
    const result = generateEncounter(params, allCreatures);
    setProposal(result);
  }, [params, allCreatures]);

  const handleAI = useCallback(async () => {
    if (!aiTheme.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const creaturesList = allCreatures.map((c) => `${c.name} (VD ${c.cr || "?"})`).join(", ");
      const { data } = await callClaudeJSON<{
        creatures: { name: string; qty: number }[];
        narrative?: string;
      }>({
        systemPrompt: AI_SYSTEM,
        userPrompt: `Grupo: ${partySize} PJs nivel ${partyLevel}
Dificultad: ${difficulty}
Enemigos: entre ${minEnemies} y ${maxEnemies}
Tema: ${aiTheme}

Criaturas disponibles:
${creaturesList}`,
        maxTokens: 1500,
      });

      if (!data.creatures?.length) throw new Error("Sin criaturas");

      const proposalCreatures: EncounterCreature[] = [];
      for (const c of data.creatures) {
        const found = allCreatures.find(
          (x) => x.name.toLowerCase() === (c.name || "").toLowerCase(),
        );
        if (found) {
          proposalCreatures.push({
            id: found.id,
            name: found.name,
            cr: found.cr,
            qty: Math.max(1, c.qty || 1),
            meta: found.meta || "",
          });
        }
      }
      if (!proposalCreatures.length) throw new Error("Ninguna criatura encontrada");

      const r = calculateEncounterDifficulty(proposalCreatures, partySize, partyLevel);
      setProposal({ creatures: proposalCreatures, narrative: data.narrative, ...r });
      setAiTheme("");
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Error");
    } finally {
      setAiLoading(false);
    }
  }, [aiTheme, allCreatures, partySize, partyLevel, difficulty, minEnemies, maxEnemies]);

  const handleSave = useCallback(() => {
    if (!proposal) return;
    const name = saveName.trim() || `Encuentro ${new Date().toLocaleDateString("es")}`;
    addSaved({
      name,
      partySize,
      partyLevel,
      difficulty: proposal.difficulty,
      creatures: proposal.creatures,
      adjustedXP: proposal.adjustedXP,
      savedAt: Date.now(),
    });
    setSaveName("");
  }, [proposal, saveName, partySize, partyLevel, addSaved]);

  const handleLoad = useCallback(
    (idx: number) => {
      const e = saved[idx];
      if (!e) return;
      setPartySize(e.partySize);
      setPartyLevel(e.partyLevel);
      const r = calculateEncounterDifficulty(e.creatures, e.partySize, e.partyLevel);
      setProposal({ creatures: e.creatures, ...r });
    },
    [saved],
  );

  const handleSendToTracker = useCallback(() => {
    if (!proposal) return;
    for (const c of proposal.creatures) {
      for (let i = 0; i < c.qty; i++) {
        addCombatant({
          name: c.qty > 1 ? `${c.name} ${i + 1}` : c.name,
          hp: 0,
          ca: 0,
          side: "enemy",
          init: 0,
        });
      }
    }
  }, [proposal, addCombatant]);

  return (
    <div className="page" data-tool="encounter">
      <PageHeader toolId="encounter" />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left panel: config */}
        <aside className="flex flex-col gap-4">
          <div className="card flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Stepper label="PJs" value={partySize} min={1} max={10} onChange={setPartySize} />
              <Stepper label="Nivel" value={partyLevel} min={1} max={20} onChange={setPartyLevel} />
            </div>

            <div>
              <span className="label">Dificultad</span>
              <div className="grid grid-cols-4 gap-1">
                {(["easy", "medium", "hard", "deadly"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`py-1.5 rounded text-xs font-[var(--font-mono)] uppercase tracking-wider transition-colors ${
                      difficulty === d
                        ? "bg-[color-mix(in_srgb,var(--acc)_20%,transparent)] text-ink border border-[color-mix(in_srgb,var(--acc)_50%,transparent)]"
                        : "text-ink-soft border border-[var(--line)] hover:text-ink"
                    }`}
                  >
                    {DIFFICULTY_NAMES[d]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Stepper label="Mín" value={minEnemies} min={1} max={30} onChange={(v) => { setMinEnemies(v); if (v > maxEnemies) setMaxEnemies(v); }} />
              <Stepper label="Máx" value={maxEnemies} min={1} max={30} onChange={(v) => { setMaxEnemies(v); if (v < minEnemies) setMinEnemies(v); }} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select className="field !text-sm !min-h-[36px]" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                {CREATURE_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t || "Todos los tipos"}</option>
                ))}
              </select>
              <select className="field !text-sm !min-h-[36px]" value={filterSource} onChange={(e) => setFilterSource(e.target.value)}>
                <option value="">Todas</option>
                <option value="srd">SRD</option>
                <option value="homebrew">Homebrew</option>
              </select>
            </div>
          </div>

          <div className="card">
            <span className="label">Umbrales del grupo</span>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {(["easy", "medium", "hard", "deadly"] as const).map((d) => (
                <div key={d} className="text-center card !p-2">
                  <div className="text-[10px] font-[var(--font-mono)] uppercase text-ink-soft">{DIFFICULTY_NAMES[d]}</div>
                  <div className="font-[var(--font-display)] text-lg text-ink">{thresholds[d].toLocaleString("es")} PX</div>
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-primary w-full" onClick={handleGenerate}>
            Generar encuentro
          </button>

          <div className="flex flex-col gap-2 pt-2 border-t border-[var(--line)]">
            <div className="flex gap-2">
              <input
                className="field flex-1 !text-sm"
                placeholder="Tema para la IA..."
                value={aiTheme}
                onChange={(e) => setAiTheme(e.target.value)}
              />
              <button className="btn btn-acc shrink-0" onClick={handleAI} disabled={aiLoading}>
                {aiLoading ? "..." : "IA"}
              </button>
            </div>
            {aiError && <p className="text-xs" style={{ color: "var(--blood)" }}>{aiError}</p>}
          </div>
        </aside>

        {/* Right panel: result */}
        <div className="flex flex-col gap-4 min-w-0">
          {proposal ? (
            <div className="card flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-[var(--font-title)] text-2xl text-ink">Propuesta de encuentro</h2>
                  <div className="text-sm text-ink-dim">
                    {proposal.totalMonsters} enemigos · grupo de {partySize} PJs N{partyLevel}
                  </div>
                </div>
                <span
                  className="tag !text-xs"
                  style={{
                    color:
                      proposal.difficulty === "deadly" ? "var(--blood)" :
                      proposal.difficulty === "hard" ? "var(--gold)" :
                      proposal.difficulty === "medium" ? "var(--emerald)" :
                      "var(--frost)",
                  }}
                >
                  {DIFFICULTY_NAMES[proposal.difficulty as Difficulty] || proposal.difficulty}
                </span>
              </div>

              {proposal.narrative && (
                <div className="text-sm italic text-ink-dim border-l-2 pl-3" style={{ borderColor: "var(--acc)" }}>
                  {proposal.narrative}
                </div>
              )}

              <div className="flex flex-col gap-1">
                {proposal.creatures.map((c, i) => {
                  const xp = crToXP(c.cr);
                  return (
                    <div key={i} className="flex items-center gap-3 py-1.5 border-b border-[var(--line)] last:border-0">
                      <span className="font-[var(--font-mono)] text-sm text-ink-soft w-8">×{c.qty}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-ink truncate">{c.name}</div>
                        <div className="text-xs text-ink-soft">{c.meta}</div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-ink">{xp.toLocaleString("es")} PX c/u</div>
                        <div className="text-ink-soft text-xs">= {(xp * c.qty).toLocaleString("es")} PX</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between"><span className="text-ink-soft">PX bruto</span><strong>{proposal.rawXP.toLocaleString("es")}</strong></div>
                <div className="flex justify-between"><span className="text-ink-soft">Multiplicador</span><strong>×{proposal.mult}</strong></div>
                <div className="flex justify-between"><span className="text-ink-soft">PX ajustados</span><strong>{proposal.adjustedXP.toLocaleString("es")}</strong></div>
                <div className="flex justify-between"><span className="text-ink-soft">Umbral {DIFFICULTY_NAMES[difficulty]}</span><strong>{thresholds[difficulty].toLocaleString("es")}</strong></div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button className="btn btn-primary" onClick={handleGenerate}>Re-generar</button>
                <Link href="/tracker" className="btn btn-ghost" onClick={handleSendToTracker}>Mesa de Combate</Link>
                <button className="btn btn-ghost" onClick={() => { handleSave(); }}>Guardar</button>
                <button className="btn btn-ghost" onClick={() => setProposal(null)}>Limpiar</button>
              </div>

              <div className="flex gap-2">
                <input
                  className="field flex-1 !text-sm"
                  placeholder="Nombre del encuentro..."
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="card text-ink-soft text-center italic">
              Configura tu grupo y pulsa <strong>Generar encuentro</strong>.
            </div>
          )}

          {saved.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-[var(--font-mono)] text-[11px] tracking-[0.3em] uppercase text-ink-soft">
                  Guardados ({saved.length})
                </h3>
              </div>
              <div className="flex flex-col gap-2">
                {saved.map((e, i) => (
                  <div key={i} className="card !p-3 flex items-center justify-between gap-2">
                    <button className="text-left flex-1 min-w-0" onClick={() => handleLoad(i)}>
                      <div className="text-ink truncate font-[var(--font-title)]">{e.name}</div>
                      <div className="text-xs text-ink-soft">
                        {e.partySize} PJs N{e.partyLevel} · {e.difficulty.toUpperCase()} · {e.creatures.reduce((s, c) => s + c.qty, 0)} enemigos · {e.adjustedXP.toLocaleString("es")} PX
                      </div>
                    </button>
                    <button className="text-ink-soft hover:text-[var(--blood)] px-2" onClick={() => removeSaved(i)}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
