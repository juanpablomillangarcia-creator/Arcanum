"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/src/components/PageHeader";
import { useCampaignStore, type Campaign, type CampSession, type CampEntity, type CampThread, type CampRelation, type CampPage } from "@/src/store/campaign";
import { callClaude } from "@/src/lib/ai/client";
import { buildCampaignContext, newId } from "@/src/lib/campaign";
import { CAMP_FICHA_KINDS, CAMP_KIND_COLORS, CAMP_PREP_STEPS, CAMP_REL_TYPES, CAMP_THREAD_STATUS, CAMP_TYPES, CAMP_TYPE_NAMES, CAMP_GUIA_PROMPTS } from "@/src/data/campaign-tables";

type Tab = "diario" | "fichas" | "tramas" | "tablero" | "cuaderno" | "guia";

function CampaignForm({
  existing,
  onSave,
  onCancel,
}: {
  existing?: Campaign;
  onSave: (data: Partial<Campaign>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(existing?.name || "");
  const [premise, setPremise] = useState(existing?.premise || "");
  const [type, setType] = useState(existing?.type || "media");
  const [level, setLevel] = useState(existing?.level || "");
  const [tone, setTone] = useState(existing?.tone || "");

  const submit = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), premise, type, level, tone });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative card max-w-lg w-full flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-3 right-3 text-ink-soft hover:text-ink" onClick={onCancel}>✕</button>
        <div className="font-[var(--font-mono)] text-[11px] tracking-wider uppercase" style={{ color: "var(--acc)" }}>
          {existing ? "Editar" : "Nueva"} campaña
        </div>
        <div>
          <label className="label">Nombre</label>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="La Sombra sobre Valdoran" />
        </div>
        <div>
          <label className="label">Premisa</label>
          <textarea className="field min-h-[80px]" value={premise} onChange={(e) => setPremise(e.target.value)} placeholder="El conflicto central, el tono, lo que está en juego..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Tipo</label>
            <select className="field" value={type} onChange={(e) => setType(e.target.value)}>
              {CAMP_TYPES.map((t) => <option key={t} value={t}>{CAMP_TYPE_NAMES[t]}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Nivel</label>
            <input className="field" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="1-10" />
          </div>
        </div>
        <div>
          <label className="label">Tono / estilo</label>
          <input className="field" value={tone} onChange={(e) => setTone(e.target.value)} placeholder="Oscuro y político, con momentos de humor" />
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={submit}>{existing ? "Guardar" : "Crear"}</button>
          <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

function SessionForm({
  existing,
  sessionNum,
  onSave,
  onCancel,
}: {
  existing?: CampSession;
  sessionNum: number;
  onSave: (data: Partial<CampSession>) => void;
  onCancel: () => void;
}) {
  const [num, setNum] = useState(existing?.num ?? sessionNum);
  const [date, setDate] = useState(existing?.date || new Date().toISOString().split("T")[0]);
  const [title, setTitle] = useState(existing?.title || "");
  const [body, setBody] = useState(existing?.body || "");
  const [prep, setPrep] = useState<Record<string, string>>(existing?.prep || {});

  const setPrepField = (id: string, value: string) => setPrep((p) => ({ ...p, [id]: value }));

  const submit = () => {
    onSave({ num, date, title, body, prep });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative card max-w-lg w-full flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-3 right-3 text-ink-soft hover:text-ink" onClick={onCancel}>✕</button>
        <div className="font-[var(--font-mono)] text-[11px] tracking-wider uppercase" style={{ color: "var(--acc)" }}>
          {existing ? "Editar" : "Nueva"} sesión
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Número</label>
            <input className="field" type="number" value={num} onChange={(e) => setNum(parseInt(e.target.value) || 1)} />
          </div>
          <div>
            <label className="label">Fecha</label>
            <input className="field" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Título</label>
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="El encuentro en la taberna" />
        </div>
        <div>
          <label className="label">Qué ocurrió</label>
          <textarea className="field min-h-[120px]" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Resumen de la sesión..." />
        </div>
        <details className="rounded-md border border-[var(--line)] bg-[var(--bg-deep)]">
          <summary className="cursor-pointer px-3 py-2 font-[var(--font-mono)] text-[11px] tracking-wider uppercase text-ink-soft">
            Preparación de la sesión · método Lazy DM · todo opcional
          </summary>
          <div className="flex flex-col gap-3 p-3 pt-1">
            {CAMP_PREP_STEPS.map((st) => (
              <div key={st.id}>
                <label className="label flex items-center gap-2"><span>{st.icon}</span>{st.title}</label>
                <p className="text-[11px] text-ink-soft mb-1">{st.hint}</p>
                <textarea className="field min-h-[50px]" value={prep[st.id] || ""} onChange={(e) => setPrepField(st.id, e.target.value)} placeholder="Tus notas…" />
              </div>
            ))}
            <div>
              <label className="label flex items-center gap-2"><span>❂</span>Secretos y pistas</label>
              <textarea className="field min-h-[50px]" value={prep.secrets || ""} onChange={(e) => setPrepField("secrets", e.target.value)} placeholder="Datos que los jugadores pueden descubrir en cualquier orden…" />
            </div>
          </div>
        </details>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={submit}>Guardar</button>
          <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default function CampaignPage() {
  const campaigns = useCampaignStore((s) => s.campaigns);
  const currentId = useCampaignStore((s) => s.currentId);
  const addCampaign = useCampaignStore((s) => s.add);
  const updateCampaign = useCampaignStore((s) => s.update);
  const removeCampaign = useCampaignStore((s) => s.remove);
  const setCurrent = useCampaignStore((s) => s.setCurrent);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [tab, setTab] = useState<Tab>("diario");
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [editingSession, setEditingSession] = useState<CampSession | null>(null);
  const [showEntityForm, setShowEntityForm] = useState(false);
  const [editingEntity, setEditingEntity] = useState<CampEntity | null>(null);
  const [showThreadForm, setShowThreadForm] = useState(false);
  const [editingThread, setEditingThread] = useState<CampThread | null>(null);
  const [guiaMessages, setGuiaMessages] = useState<{ role: string; content: string }[]>([]);
  const [guiaLoading, setGuiaLoading] = useState(false);
  const [tableroFocus, setTableroFocus] = useState<string | null>(null);
  const [showRelForm, setShowRelForm] = useState(false);
  const [editingRel, setEditingRel] = useState<CampRelation | null>(null);
  const [cuadFolder, setCuadFolder] = useState<string | null>(null);
  const [cuadPage, setCuadPage] = useState<string | null>(null);
  const [cuadSearch, setCuadSearch] = useState("");
  const [cuadCleaning, setCuadCleaning] = useState(false);
  const [cuadError, setCuadError] = useState("");

  const current = useMemo(() => campaigns.find((c) => c.id === currentId) || null, [campaigns, currentId]);

  const handleCreateCampaign = (data: Partial<Campaign>) => {
    const camp: Campaign = {
      id: newId("camp"),
      name: data.name || "",
      premise: data.premise || "",
      type: data.type || "media",
      level: data.level || "",
      tone: data.tone || "",
      sessions: [],
      entities: [],
      relations: [],
      threads: [],
      notes: [],
      notebook: [],
      notebookFolders: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addCampaign(camp);
    setCurrent(camp.id);
    setShowForm(false);
  };

  const handleUpdateCampaign = (data: Partial<Campaign>) => {
    if (!editing) return;
    updateCampaign(editing.id, data);
    setEditing(null);
    setShowForm(false);
  };

  const handleDeleteCampaign = (id: string) => {
    if (!confirm("¿Borrar esta campaña? No se puede deshacer.")) return;
    removeCampaign(id);
  };

  const handleSaveSession = (data: Partial<CampSession>) => {
    if (!current) return;
    const sessions = [...current.sessions];
    if (editingSession) {
      const idx = sessions.findIndex((s) => s.id === editingSession.id);
      if (idx >= 0) sessions[idx] = { ...sessions[idx], ...data };
    } else {
      sessions.push({
        id: newId("sess"),
        num: data.num || sessions.length + 1,
        date: data.date || "",
        title: data.title || "",
        body: data.body || "",
        prep: data.prep || {},
        createdAt: Date.now(),
      });
    }
    updateCampaign(current.id, { sessions });
    setShowSessionForm(false);
    setEditingSession(null);
  };

  const handleDeleteSession = (id: string) => {
    if (!current) return;
    updateCampaign(current.id, { sessions: current.sessions.filter((s) => s.id !== id) });
  };

  const handleSaveEntity = (entity: CampEntity) => {
    if (!current) return;
    const entities = [...current.entities];
    const idx = entities.findIndex((e) => e.id === entity.id);
    if (idx >= 0) {
      entities[idx] = entity;
    } else {
      entities.push(entity);
    }
    updateCampaign(current.id, { entities });
    setShowEntityForm(false);
    setEditingEntity(null);
  };

  const handleDeleteEntity = (id: string) => {
    if (!current) return;
    updateCampaign(current.id, {
      entities: current.entities.filter((e) => e.id !== id),
      relations: current.relations.filter((r) => r.from !== id && r.to !== id),
    });
  };

  const handleSaveThread = (thread: CampThread) => {
    if (!current) return;
    const threads = [...current.threads];
    const idx = threads.findIndex((t) => t.id === thread.id);
    if (idx >= 0) {
      threads[idx] = thread;
    } else {
      threads.push(thread);
    }
    updateCampaign(current.id, { threads });
    setShowThreadForm(false);
    setEditingThread(null);
  };

  const handleDeleteThread = (id: string) => {
    if (!current) return;
    updateCampaign(current.id, { threads: current.threads.filter((t) => t.id !== id) });
  };

  const handleGuiaAsk = async (prompt: string) => {
    if (!current) return;
    setGuiaLoading(true);
    const context = buildCampaignContext(current);
    const messages = [...guiaMessages, { role: "user", content: prompt }];
    setGuiaMessages(messages);
    try {
      const result = await callClaude({
        systemPrompt: `Eres un asistente experto en dirección de campañas de D&D 5e. Ayudas al DJ con ideas, conexiones y sugerencias basándote en el contenido de su campaña. Responde en español, de forma concisa y práctica.`,
        userPrompt: `Contexto de la campaña:\n${context}\n\nPregunta del DJ: ${prompt}`,
        maxTokens: 1500,
      });
      setGuiaMessages([...messages, { role: "assistant", content: result.text }]);
    } catch (err) {
      setGuiaMessages([...messages, { role: "assistant", content: `Error: ${err instanceof Error ? err.message : "Error"}` }]);
    } finally {
      setGuiaLoading(false);
    }
  };

  const handleSaveRel = (rel: CampRelation) => {
    if (!current) return;
    const relations = [...current.relations];
    const idx = relations.findIndex((r) => r.id === rel.id);
    if (idx >= 0) relations[idx] = rel;
    else relations.push(rel);
    updateCampaign(current.id, { relations });
    setShowRelForm(false);
    setEditingRel(null);
  };

  const handleDeleteRel = (id: string) => {
    if (!current) return;
    updateCampaign(current.id, { relations: current.relations.filter((r) => r.id !== id) });
  };

  const handleSaveFolder = () => {
    if (!current) return;
    const name = prompt("Nombre de la carpeta")?.trim();
    if (!name) return;
    updateCampaign(current.id, { notebookFolders: [...current.notebookFolders, { id: newId("fold"), name }] });
  };

  const handleDeleteFolder = (id: string) => {
    if (!current) return;
    if (!confirm("¿Borrar la carpeta? Sus páginas pasarán a estar sin clasificar.")) return;
    updateCampaign(current.id, {
      notebookFolders: current.notebookFolders.filter((f) => f.id !== id),
      notebook: current.notebook.map((p) => (p.folderId === id ? { ...p, folderId: null } : p)),
    });
    if (cuadFolder === id) setCuadFolder(null);
  };

  const handleNewPage = (folderId: string | null) => {
    if (!current) return;
    const page: CampPage = { id: newId("page"), title: "Página nueva", body: "", folderId };
    updateCampaign(current.id, { notebook: [...current.notebook, page] });
    setCuadPage(page.id);
  };

  const handleUpdatePage = (id: string, updates: Partial<CampPage>) => {
    if (!current) return;
    updateCampaign(current.id, {
      notebook: current.notebook.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  };

  const handleDeletePage = (id: string) => {
    if (!current) return;
    updateCampaign(current.id, { notebook: current.notebook.filter((p) => p.id !== id) });
    if (cuadPage === id) setCuadPage(null);
  };

  const handleCleanPage = async (page: CampPage) => {
    if (!current || !page.body.trim()) return;
    setCuadCleaning(true);
    setCuadError("");
    try {
      const result = await callClaude({
        systemPrompt: "Eres un editor que limpia y ordena texto pegado (apuntes, PDFs, notas sueltas) para un cuaderno de campaña de D&D. Corrige saltos de línea rotos, espacios sobrantes y ortografía evidente, y estructura el texto en párrafos legibles. NO inventes ni resumas contenido: conserva toda la información. Devuelve solo el texto limpio, sin comentarios.",
        userPrompt: page.body,
        maxTokens: 4096,
      });
      handleUpdatePage(page.id, { body: result.text.trim() });
    } catch (err) {
      setCuadError(err instanceof Error ? err.message : "Error al limpiar el texto");
    } finally {
      setCuadCleaning(false);
    }
  };

  // Campaign list (home)
  if (!current) {
    return (
      <div className="page" data-tool="campaign">
        <PageHeader toolId="campaign" />
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-[var(--font-title)] text-2xl text-ink">Mis campañas</h2>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ Nueva campaña</button>
        </div>
        {campaigns.length === 0 ? (
          <div className="card text-center text-ink-soft italic py-12">
            <div className="text-5xl mb-4">❦</div>
            <p>Aún no has tejido ninguna campaña. Crea la primera y empieza a construir tu mundo.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c) => (
              <div key={c.id} className="card flex flex-col gap-2 cursor-pointer hover:border-[var(--line-bright)]" onClick={() => setCurrent(c.id)}>
                <div className="font-[var(--font-title)] text-xl text-ink">{c.name}</div>
                <div className="text-sm text-ink-dim line-clamp-2">{c.premise || "Sin premisa."}</div>
                <div className="flex flex-wrap gap-2 text-xs text-ink-soft">
                  <span className="tag !text-[10px]">{CAMP_TYPE_NAMES[c.type] || c.type}</span>
                  {c.level && <span className="tag !text-[10px]">Nivel {c.level}</span>}
                  <span className="tag !text-[10px]">{c.sessions.length} sesiones</span>
                </div>
                <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                  <button className="btn btn-ghost !text-[11px] !min-h-[28px] !py-0" onClick={() => setCurrent(c.id)}>Abrir</button>
                  <button className="btn btn-ghost !text-[11px] !min-h-[28px] !py-0" onClick={() => { setEditing(c); setShowForm(true); }}>Editar</button>
                  <button className="btn btn-ghost !text-[11px] !min-h-[28px] !py-0" style={{ color: "var(--blood)" }} onClick={() => handleDeleteCampaign(c.id)}>Borrar</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {showForm && (
          <CampaignForm
            existing={editing || undefined}
            onSave={editing ? handleUpdateCampaign : handleCreateCampaign}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        )}
      </div>
    );
  }

  // Campaign workspace
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "diario", label: "Diario", icon: "📖" },
    { id: "fichas", label: "Fichas", icon: "🃏" },
    { id: "tramas", label: "Tramas", icon: "⊞" },
    { id: "tablero", label: "Tablero", icon: "◈" },
    { id: "cuaderno", label: "Cuaderno", icon: "📓" },
    { id: "guia", label: "Guía IA", icon: "✧" },
  ];

  return (
    <div className="page" data-tool="campaign">
      <PageHeader toolId="campaign" />

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-[var(--font-title)] text-2xl text-ink">{current.name}</h2>
          <div className="text-sm text-ink-dim">
            {CAMP_TYPE_NAMES[current.type] || current.type}
            {current.level && ` · Nivel ${current.level}`}
            {` · ${current.sessions.length} sesiones`}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost !text-[11px]" onClick={() => setCurrent(null)}>← Campañas</button>
          <button className="btn btn-ghost !text-[11px]" onClick={() => { setEditing(current); setShowForm(true); }}>Editar</button>
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-[var(--line)] overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 font-[var(--font-mono)] text-xs tracking-wider uppercase whitespace-nowrap transition-colors ${
              tab === t.id
                ? "text-ink border-b-2 border-[var(--acc)]"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Diario */}
      {tab === "diario" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-[var(--font-title)] text-xl text-ink">Diario de sesiones</h3>
            <button className="btn btn-primary" onClick={() => { setEditingSession(null); setShowSessionForm(true); }}>+ Nueva sesión</button>
          </div>
          {current.sessions.length === 0 ? (
            <div className="card text-center text-ink-soft italic py-8">
              El diario está vacío. Registra lo que pasa en cada sesión.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {[...current.sessions].reverse().map((s) => (
                <div key={s.id} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-[var(--font-mono)] text-xs text-ink-soft">Sesión {s.num}</span>
                      {s.date && <span className="text-xs text-ink-soft ml-2">{s.date}</span>}
                    </div>
                    <div className="flex gap-1">
                      <button className="text-xs text-ink-soft hover:text-ink" onClick={() => { setEditingSession(s); setShowSessionForm(true); }}>Editar</button>
                      <button className="text-xs text-ink-soft hover:text-[var(--blood)]" onClick={() => handleDeleteSession(s.id)}>✕</button>
                    </div>
                  </div>
                  {s.title && <div className="font-[var(--font-title)] text-lg text-ink mb-1">{s.title}</div>}
                  {s.body && <div className="text-sm text-ink-dim whitespace-pre-wrap">{s.body}</div>}
                  {[...CAMP_PREP_STEPS, { id: "secrets", icon: "❂", title: "Secretos y pistas" }].some((st) => (s.prep?.[st.id] || "").trim()) && (
                    <details className="mt-2 rounded-md border border-[var(--line)] bg-[var(--bg-deep)]">
                      <summary className="cursor-pointer px-3 py-2 font-[var(--font-mono)] text-[11px] tracking-wider uppercase text-ink-soft">
                        Preparación de la sesión
                      </summary>
                      <div className="flex flex-col gap-2 p-3 pt-1">
                        {[...CAMP_PREP_STEPS, { id: "secrets", icon: "❂", title: "Secretos y pistas" }]
                          .filter((st) => (s.prep?.[st.id] || "").trim())
                          .map((st) => (
                            <div key={st.id} className="rounded border-l-2 border-[var(--acc)] bg-[var(--bg-card-2)] px-3 py-2">
                              <div className="font-[var(--font-title)] text-sm text-ink mb-0.5">{st.icon} {st.title}</div>
                              <div className="text-sm text-ink-dim whitespace-pre-wrap">{s.prep[st.id]}</div>
                            </div>
                          ))}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fichas */}
      {tab === "fichas" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-[var(--font-title)] text-xl text-ink">Entidades</h3>
            <button className="btn btn-primary" onClick={() => {
              setEditingEntity({ id: newId("ent"), kind: "personaje", name: "", desc: "", status: "", lore: "" });
              setShowEntityForm(true);
            }}>+ Añadir ficha</button>
          </div>
          {current.entities.length === 0 ? (
            <div className="card text-center text-ink-soft italic py-8">
              Aún no hay fichas. Añade personajes, criaturas, lugares u objetos.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {current.entities.map((e) => {
                const kind = CAMP_FICHA_KINDS[e.kind] || { icon: "◆", label: e.kind };
                return (
                  <div key={e.id} className="card">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg">{kind.icon}</span>
                      <div className="flex gap-1">
                        <button className="text-xs text-ink-soft hover:text-ink" onClick={() => { setEditingEntity(e); setShowEntityForm(true); }}>Editar</button>
                        <button className="text-xs text-ink-soft hover:text-[var(--blood)]" onClick={() => handleDeleteEntity(e.id)}>✕</button>
                      </div>
                    </div>
                    <div className="font-[var(--font-title)] text-lg text-ink">{e.name}</div>
                    <div className="text-xs text-ink-soft mb-1">{kind.label}{e.status ? ` · ${e.status}` : ""}</div>
                    {e.desc && <div className="text-sm text-ink-dim line-clamp-2">{e.desc}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tramas */}
      {tab === "tramas" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-[var(--font-title)] text-xl text-ink">Hilos argumentales</h3>
            <button className="btn btn-primary" onClick={() => {
              setEditingThread({ id: newId("thread"), title: "", desc: "", status: "activa", priority: 1, future: false, links: [] });
              setShowThreadForm(true);
            }}>+ Nueva trama</button>
          </div>
          {current.threads.length === 0 ? (
            <div className="card text-center text-ink-soft italic py-8">
              No hay tramas aún. Crea hilos argumentales para seguir su evolución.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              {(["activa", "latente", "resuelta"] as const).map((status) => {
                const info = CAMP_THREAD_STATUS[status];
                const threads = current.threads.filter((t) => t.status === status);
                return (
                  <div key={status} className="flex flex-col gap-2">
                    <div className="font-[var(--font-mono)] text-xs tracking-wider uppercase flex items-center gap-2" style={{ color: info.color }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: info.color }} />
                      {info.label} ({threads.length})
                    </div>
                    {threads.map((t) => (
                      <div key={t.id} className="card !p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-[var(--font-title)] text-ink">{t.title}</span>
                          <div className="flex gap-1">
                            <button className="text-xs text-ink-soft hover:text-ink" onClick={() => { setEditingThread(t); setShowThreadForm(true); }}>✎</button>
                            <button className="text-xs text-ink-soft hover:text-[var(--blood)]" onClick={() => handleDeleteThread(t.id)}>✕</button>
                          </div>
                        </div>
                        {t.desc && <div className="text-sm text-ink-dim">{t.desc}</div>}
                        {t.future && <div className="text-xs mt-1" style={{ color: "var(--gold)" }}>Cabo suelto</div>}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tablero de relaciones */}
      {tab === "tablero" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-[var(--font-title)] text-xl text-ink">Tablero de relaciones</h3>
            <button
              className="btn btn-primary"
              disabled={current.entities.length < 2}
              onClick={() => {
                const ents = current.entities;
                setEditingRel({ id: newId("rel"), from: ents[0]?.id || "", to: ents[1]?.id || "", type: "aliado", note: "" });
                setShowRelForm(true);
              }}
            >+ Nueva relación</button>
          </div>

          {current.entities.length < 2 ? (
            <div className="card text-center text-ink-soft italic py-8">
              Necesitas al menos <strong>dos fichas</strong> para crear relaciones. Ve a la pestaña <strong>Fichas</strong> y añade entidades.
            </div>
          ) : !tableroFocus ? (
            <>
              <p className="text-sm text-ink-soft italic">Pulsa una ficha para ver sus relaciones. {current.relations.length === 0 && "Aún no hay relaciones: crea la primera con el botón de arriba."}</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[...current.entities]
                  .map((e) => ({ e, n: current.relations.filter((r) => r.from === e.id || r.to === e.id).length }))
                  .sort((a, b) => b.n - a.n)
                  .map(({ e, n }) => {
                    const col = CAMP_KIND_COLORS[e.kind] || "#888";
                    return (
                      <div key={e.id} className="card cursor-pointer hover:border-[var(--line-bright)]" style={{ borderTopColor: col, borderTopWidth: 2 }} onClick={() => setTableroFocus(e.id)}>
                        <div className="text-2xl" style={{ color: col }}>{CAMP_FICHA_KINDS[e.kind]?.icon || "◆"}</div>
                        <div className="font-[var(--font-title)] text-lg text-ink">{e.name}</div>
                        <div className="text-xs text-ink-soft">{n ? `${n} vínculo${n > 1 ? "s" : ""}` : "sin vínculos"}</div>
                      </div>
                    );
                  })}
              </div>
            </>
          ) : (() => {
            const focus = current.entities.find((e) => e.id === tableroFocus);
            if (!focus) { setTableroFocus(null); return null; }
            const myRels = current.relations.filter((r) => r.from === focus.id || r.to === focus.id);
            const byType: Record<string, CampRelation[]> = {};
            myRels.forEach((r) => { (byType[r.type] = byType[r.type] || []).push(r); });
            return (
              <>
                <div className="flex items-center gap-3">
                  <button className="btn btn-ghost !text-[11px]" onClick={() => setTableroFocus(null)}>‹ Ver todas las fichas</button>
                  <span className="text-sm text-ink-dim">Relaciones de <strong className="text-ink">{focus.name}</strong></span>
                </div>
                {myRels.length === 0 ? (
                  <p className="text-ink-soft italic text-center py-6">{focus.name} no tiene relaciones todavía. Pulsa <strong>+ Nueva relación</strong> para crearle una.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {Object.entries(byType).map(([tp, list]) => {
                      const def = CAMP_REL_TYPES[tp] || CAMP_REL_TYPES.otro;
                      return (
                        <div key={tp} className="flex flex-col gap-2">
                          <div className="font-[var(--font-mono)] text-xs tracking-wider uppercase flex items-center gap-2" style={{ color: def.color }}>
                            <span className="w-2 h-2 rounded-full" style={{ background: def.color }} />{def.label}
                          </div>
                          {list.map((r) => {
                            const otherId = r.from === focus.id ? r.to : r.from;
                            const other = current.entities.find((e) => e.id === otherId);
                            if (!other) return null;
                            return (
                              <div key={r.id} className="card !p-3 flex items-center justify-between gap-2" style={{ borderLeftColor: def.color, borderLeftWidth: 3 }}>
                                <div>
                                  <span className="text-ink cursor-pointer hover:underline" onClick={() => setTableroFocus(other.id)}>{other.name}</span>
                                  {r.note && <span className="text-xs text-ink-soft ml-2 italic">{r.note}</span>}
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <button className="text-xs text-ink-soft hover:text-ink" onClick={() => { setEditingRel(r); setShowRelForm(true); }}>Editar</button>
                                  <button className="text-xs text-ink-soft hover:text-[var(--blood)]" onClick={() => handleDeleteRel(r.id)}>✕</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Cuaderno */}
      {tab === "cuaderno" && (() => {
        const page = current.notebook.find((p) => p.id === cuadPage) || null;
        const q = cuadSearch.trim().toLowerCase();
        const matches = q
          ? current.notebook.filter((p) => p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q))
          : null;
        return (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center gap-2 flex-wrap">
              <h3 className="font-[var(--font-title)] text-xl text-ink">Cuaderno de la campaña</h3>
              <div className="flex gap-2">
                <button className="btn btn-ghost !text-[11px]" onClick={handleSaveFolder}>+ Carpeta</button>
                <button className="btn btn-primary !text-[11px]" onClick={() => handleNewPage(cuadFolder)}>+ Página</button>
              </div>
            </div>

            <input className="field" placeholder="🔎 Buscar en todo el cuaderno…" value={cuadSearch} onChange={(e) => setCuadSearch(e.target.value)} />

            {matches ? (
              matches.length === 0 ? (
                <div className="card text-center text-ink-soft italic py-6">Sin resultados para “{cuadSearch}”.</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {matches.map((p) => (
                    <button key={p.id} className="card text-left hover:border-[var(--line-bright)]" onClick={() => { setCuadSearch(""); setCuadFolder(p.folderId); setCuadPage(p.id); }}>
                      <div className="font-[var(--font-title)] text-ink">{p.title || "(sin título)"}</div>
                      <div className="text-xs text-ink-soft line-clamp-2">{p.body}</div>
                    </button>
                  ))}
                </div>
              )
            ) : current.notebook.length === 0 && current.notebookFolders.length === 0 ? (
              <div className="card text-center text-ink-soft italic py-8">
                El cuaderno está vacío. Crea una carpeta o una página suelta y empieza a escribir.
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
                {/* Folder + page index */}
                <div className="flex flex-col gap-3">
                  {current.notebookFolders.map((f) => (
                    <div key={f.id} className="card !p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-[var(--font-title)] text-ink">📁 {f.name}</span>
                        <div className="flex gap-1">
                          <button className="text-xs text-ink-soft hover:text-ink" onClick={() => handleNewPage(f.id)}>+</button>
                          <button className="text-xs text-ink-soft hover:text-[var(--blood)]" onClick={() => handleDeleteFolder(f.id)}>✕</button>
                        </div>
                      </div>
                      {current.notebook.filter((p) => p.folderId === f.id).map((p) => (
                        <button key={p.id} className={`block w-full text-left text-sm px-2 py-1 rounded ${cuadPage === p.id ? "bg-[var(--bg-card-2)] text-ink" : "text-ink-dim hover:text-ink"}`} onClick={() => setCuadPage(p.id)}>{p.title || "(sin título)"}</button>
                      ))}
                    </div>
                  ))}
                  {current.notebook.some((p) => !p.folderId) && (
                    <div className="card !p-3">
                      <div className="font-[var(--font-title)] text-ink mb-1">Sin clasificar</div>
                      {current.notebook.filter((p) => !p.folderId).map((p) => (
                        <button key={p.id} className={`block w-full text-left text-sm px-2 py-1 rounded ${cuadPage === p.id ? "bg-[var(--bg-card-2)] text-ink" : "text-ink-dim hover:text-ink"}`} onClick={() => setCuadPage(p.id)}>{p.title || "(sin título)"}</button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Page editor */}
                {page ? (
                  <div className="card flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <input className="field !text-lg font-[var(--font-title)]" value={page.title} onChange={(e) => handleUpdatePage(page.id, { title: e.target.value })} placeholder="Título de la página" />
                      <button className="text-xs text-ink-soft hover:text-[var(--blood)] shrink-0" onClick={() => handleDeletePage(page.id)}>Borrar</button>
                    </div>
                    <textarea className="field min-h-[300px]" value={page.body} onChange={(e) => handleUpdatePage(page.id, { body: e.target.value })} placeholder="Escribe o pega tus apuntes…" />
                    <div className="flex items-center gap-2">
                      <button className="btn btn-ghost !text-[11px]" disabled={cuadCleaning || !page.body.trim()} onClick={() => handleCleanPage(page)}>
                        {cuadCleaning ? "Limpiando…" : "✦ Limpiar texto pegado (IA)"}
                      </button>
                      {cuadError && <span className="text-xs text-[var(--blood)]">{cuadError}</span>}
                    </div>
                  </div>
                ) : (
                  <div className="card text-center text-ink-soft italic py-8 self-start">Selecciona una página o crea una nueva.</div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* Guía IA */}
      {tab === "guia" && (
        <div className="flex flex-col gap-4">
          <h3 className="font-[var(--font-title)] text-xl text-ink">Guía de campaña</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {CAMP_GUIA_PROMPTS.map((p) => (
              <button
                key={p.id}
                className="card text-left hover:border-[var(--line-bright)] transition-colors"
                onClick={() => handleGuiaAsk(p.prompt)}
                disabled={guiaLoading}
              >
                <span className="text-lg mr-2">{p.icon}</span>
                <span className="text-sm text-ink">{p.label}</span>
              </button>
            ))}
          </div>
          {guiaMessages.length > 0 && (
            <div className="flex flex-col gap-3 mt-4">
              {guiaMessages.map((m, i) => (
                <div key={i} className={`card ${m.role === "user" ? "!bg-[var(--bg-card-2)]" : ""}`}>
                  <div className="font-[var(--font-mono)] text-[10px] uppercase text-ink-soft mb-1">
                    {m.role === "user" ? "Tú" : "Guía"}
                  </div>
                  <div className="text-sm text-ink-dim whitespace-pre-wrap">{m.content}</div>
                </div>
              ))}
              {guiaLoading && <div className="text-ink-soft italic text-sm">Pensando...</div>}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <CampaignForm
          existing={editing || undefined}
          onSave={editing ? handleUpdateCampaign : handleCreateCampaign}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
      {showSessionForm && (
        <SessionForm
          existing={editingSession || undefined}
          sessionNum={current.sessions.length + 1}
          onSave={handleSaveSession}
          onCancel={() => { setShowSessionForm(false); setEditingSession(null); }}
        />
      )}
      {showEntityForm && editingEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setShowEntityForm(false); setEditingEntity(null); }}>
          <div className="absolute inset-0 bg-black/70" />
          <div className="relative card max-w-lg w-full flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-3 right-3 text-ink-soft hover:text-ink" onClick={() => { setShowEntityForm(false); setEditingEntity(null); }}>✕</button>
            <div className="font-[var(--font-mono)] text-[11px] tracking-wider uppercase" style={{ color: "var(--acc)" }}>
              {current.entities.find((e) => e.id === editingEntity.id) ? "Editar" : "Nueva"} ficha
            </div>
            <div>
              <label className="label">Tipo</label>
              <select className="field" value={editingEntity.kind} onChange={(e) => setEditingEntity({ ...editingEntity, kind: e.target.value })}>
                {Object.entries(CAMP_FICHA_KINDS).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Nombre</label>
              <input className="field" value={editingEntity.name} onChange={(e) => setEditingEntity({ ...editingEntity, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Descripción</label>
              <textarea className="field min-h-[60px]" value={editingEntity.desc} onChange={(e) => setEditingEntity({ ...editingEntity, desc: e.target.value })} />
            </div>
            <div>
              <label className="label">Estado</label>
              <select className="field" value={editingEntity.status} onChange={(e) => setEditingEntity({ ...editingEntity, status: e.target.value })}>
                <option value="">—</option>
                {(CAMP_FICHA_KINDS[editingEntity.kind]?.statuses || []).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Lore / notas</label>
              <textarea className="field min-h-[60px]" value={editingEntity.lore} onChange={(e) => setEditingEntity({ ...editingEntity, lore: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={() => handleSaveEntity(editingEntity)}>Guardar</button>
              <button className="btn btn-ghost" onClick={() => { setShowEntityForm(false); setEditingEntity(null); }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      {showThreadForm && editingThread && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setShowThreadForm(false); setEditingThread(null); }}>
          <div className="absolute inset-0 bg-black/70" />
          <div className="relative card max-w-lg w-full flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-3 right-3 text-ink-soft hover:text-ink" onClick={() => { setShowThreadForm(false); setEditingThread(null); }}>✕</button>
            <div className="font-[var(--font-mono)] text-[11px] tracking-wider uppercase" style={{ color: "var(--acc)" }}>
              {current.threads.find((t) => t.id === editingThread.id) ? "Editar" : "Nueva"} trama
            </div>
            <div>
              <label className="label">Título</label>
              <input className="field" value={editingThread.title} onChange={(e) => setEditingThread({ ...editingThread, title: e.target.value })} />
            </div>
            <div>
              <label className="label">Descripción</label>
              <textarea className="field min-h-[60px]" value={editingThread.desc} onChange={(e) => setEditingThread({ ...editingThread, desc: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Estado</label>
                <select className="field" value={editingThread.status} onChange={(e) => setEditingThread({ ...editingThread, status: e.target.value })}>
                  {Object.entries(CAMP_THREAD_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editingThread.future} onChange={(e) => setEditingThread({ ...editingThread, future: e.target.checked })} className="accent-[var(--acc)]" />
                  <span className="text-sm text-ink">Cabo suelto</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={() => handleSaveThread(editingThread)}>Guardar</button>
              <button className="btn btn-ghost" onClick={() => { setShowThreadForm(false); setEditingThread(null); }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      {showRelForm && editingRel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setShowRelForm(false); setEditingRel(null); }}>
          <div className="absolute inset-0 bg-black/70" />
          <div className="relative card max-w-lg w-full flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-3 right-3 text-ink-soft hover:text-ink" onClick={() => { setShowRelForm(false); setEditingRel(null); }}>✕</button>
            <div className="font-[var(--font-mono)] text-[11px] tracking-wider uppercase" style={{ color: "var(--acc)" }}>
              {current.relations.find((r) => r.id === editingRel.id) ? "Editar" : "Nueva"} relación
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Desde</label>
                <select className="field" value={editingRel.from} onChange={(e) => setEditingRel({ ...editingRel, from: e.target.value })}>
                  {current.entities.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Hacia</label>
                <select className="field" value={editingRel.to} onChange={(e) => setEditingRel({ ...editingRel, to: e.target.value })}>
                  {current.entities.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Tipo</label>
              <select className="field" value={editingRel.type} onChange={(e) => setEditingRel({ ...editingRel, type: e.target.value })}>
                {Object.entries(CAMP_REL_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Nota</label>
              <input className="field" value={editingRel.note} onChange={(e) => setEditingRel({ ...editingRel, note: e.target.value })} placeholder="Opcional" />
            </div>
            <div className="flex gap-2">
              <button className="btn btn-primary" disabled={!editingRel.from || !editingRel.to || editingRel.from === editingRel.to} onClick={() => handleSaveRel(editingRel)}>Guardar</button>
              <button className="btn btn-ghost" onClick={() => { setShowRelForm(false); setEditingRel(null); }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
