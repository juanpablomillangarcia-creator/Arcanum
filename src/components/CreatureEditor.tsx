"use client";

import { useState } from "react";
import type { Creature, CreatureAction } from "@/src/lib/bestiary";
import { BEAST_GEN } from "@/src/data/beast-tables";

const CR_OPTIONS = ["0", "1/8", "1/4", "1/2", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"];
const SIZE_OPTIONS = ["diminuto", "pequeño", "mediano", "grande", "enorme", "gargantuesco"];
const TYPE_OPTIONS = BEAST_GEN.types;
const ALIGNMENT_OPTIONS = BEAST_GEN.alignments;

function ActionListEditor({
  label,
  actions,
  onChange,
}: {
  label: string;
  actions: CreatureAction[];
  onChange: (actions: CreatureAction[]) => void;
}) {
  const update = (i: number, field: keyof CreatureAction, value: string) => {
    const next = [...actions];
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  };
  const remove = (i: number) => onChange(actions.filter((_, idx) => idx !== i));
  const add = () => onChange([...actions, { name: "", desc: "" }]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="label mb-0">{label}</span>
        <button className="text-xs text-ink-soft hover:text-ink" onClick={add}>+ Añadir</button>
      </div>
      {actions.map((a, i) => (
        <div key={i} className="flex flex-col gap-1 card !p-3">
          <div className="flex gap-2">
            <input
              className="field !min-h-[36px] !py-1 flex-1"
              placeholder="Nombre"
              value={a.name}
              onChange={(e) => update(i, "name", e.target.value)}
            />
            <button className="text-ink-soft hover:text-[var(--blood)] px-2" onClick={() => remove(i)}>✕</button>
          </div>
          <textarea
            className="field !min-h-[60px] !text-sm"
            placeholder="Descripción"
            value={a.desc}
            onChange={(e) => update(i, "desc", e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

export function CreatureEditor({
  creature,
  onSave,
  onCancel,
}: {
  creature: Creature;
  onSave: (c: Creature) => void;
  onCancel: () => void;
}) {
  const [c, setC] = useState<Creature>({ ...creature });

  const set = <K extends keyof Creature>(key: K, value: Creature[K]) =>
    setC((prev) => ({ ...prev, [key]: value }));

  const setAttr = (key: keyof Creature["attrs"], value: number) =>
    setC((prev) => ({ ...prev, attrs: { ...prev.attrs, [key]: value } }));

  const submit = () => {
    if (!c.name.trim()) return;
    onSave(c);
  };

  const attrKeys: { key: keyof Creature["attrs"]; label: string }[] = [
    { key: "fue", label: "FUE" },
    { key: "des", label: "DES" },
    { key: "con", label: "CON" },
    { key: "int", label: "INT" },
    { key: "sab", label: "SAB" },
    { key: "car", label: "CAR" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="col-span-2">
          <label className="label">Nombre</label>
          <input className="field" value={c.name} onChange={(e) => set("name", e.target.value)} placeholder="Nombre de la criatura" />
        </div>
        <div>
          <label className="label">Tipo</label>
          <select className="field" value={c.creatureType} onChange={(e) => set("creatureType", e.target.value)}>
            {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Tamaño</label>
          <select className="field" value={c.size} onChange={(e) => set("size", e.target.value)}>
            {SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="label">VD (CR)</label>
          <select className="field" value={c.cr} onChange={(e) => set("cr", e.target.value)}>
            {CR_OPTIONS.map((cr) => <option key={cr} value={cr}>{cr}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Alineamiento</label>
          <select className="field" value={c.alignment} onChange={(e) => set("alignment", e.target.value)}>
            {ALIGNMENT_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="label">CA</label>
          <input className="field" value={c.ca} onChange={(e) => set("ca", e.target.value)} placeholder="13" />
        </div>
        <div>
          <label className="label">Fuente CA</label>
          <input className="field" value={c.caSource} onChange={(e) => set("caSource", e.target.value)} placeholder="armadura natural" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">PG</label>
          <input className="field" value={c.hp} onChange={(e) => set("hp", e.target.value)} placeholder="45" />
        </div>
        <div>
          <label className="label">Fórmula PG</label>
          <input className="field" value={c.hpFormula} onChange={(e) => set("hpFormula", e.target.value)} placeholder="6d8+12" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label className="label">Velocidad</label>
          <input className="field" value={c.speed} onChange={(e) => set("speed", e.target.value)} placeholder="9 m" />
        </div>
        <div>
          <label className="label">Sentidos</label>
          <input className="field" value={c.senses} onChange={(e) => set("senses", e.target.value)} placeholder="visión en la oscuridad 18 m" />
        </div>
        <div>
          <label className="label">Idiomas</label>
          <input className="field" value={c.languages} onChange={(e) => set("languages", e.target.value)} placeholder="Común, Infernal" />
        </div>
      </div>

      <div>
        <div className="label mb-2">Características</div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {attrKeys.map(({ key, label }) => (
            <div key={key} className="text-center">
              <div className="font-[var(--font-mono)] text-[10px] text-ink-soft mb-1">{label}</div>
              <input
                className="field !min-h-[36px] !py-1 text-center !text-base"
                type="number"
                value={c.attrs[key]}
                onChange={(e) => setAttr(key, parseInt(e.target.value) || 10)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Tiradas de Salvación</label>
          <input className="field" value={c.savingThrowsText} onChange={(e) => set("savingThrowsText", e.target.value)} placeholder="DES +5, CON +3" />
        </div>
        <div>
          <label className="label">Habilidades</label>
          <input className="field" value={c.skills} onChange={(e) => set("skills", e.target.value)} placeholder="Percepción +6, Sigilo +8" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="label">Vulnerabilidades</label>
          <input className="field" value={c.damageVulnerabilities} onChange={(e) => set("damageVulnerabilities", e.target.value)} placeholder="fuego" />
        </div>
        <div>
          <label className="label">Resistencias</label>
          <input className="field" value={c.damageResistances} onChange={(e) => set("damageResistances", e.target.value)} placeholder="frío" />
        </div>
        <div>
          <label className="label">Inmunidades daño</label>
          <input className="field" value={c.damageImmunities} onChange={(e) => set("damageImmunities", e.target.value)} placeholder="veneno" />
        </div>
        <div>
          <label className="label">Inmunidades estado</label>
          <input className="field" value={c.conditionImmunities} onChange={(e) => set("conditionImmunities", e.target.value)} placeholder="envenenado" />
        </div>
      </div>

      <div>
        <label className="label">Texto descriptivo</label>
        <textarea className="field min-h-[60px]" value={c.text} onChange={(e) => set("text", e.target.value)} placeholder="Descripción de la criatura..." />
      </div>

      <ActionListEditor label="Rasgos" actions={c.traits} onChange={(a) => set("traits", a)} />
      <ActionListEditor label="Acciones" actions={c.actions} onChange={(a) => set("actions", a)} />
      <ActionListEditor label="Reacciones" actions={c.reactions} onChange={(a) => set("reactions", a)} />

      <div className="flex flex-col gap-2">
        <div>
          <label className="label">Descripción acciones legendarias</label>
          <input className="field" value={c.legendaryDesc} onChange={(e) => set("legendaryDesc", e.target.value)} placeholder="La criatura puede realizar 3 acciones legendarias..." />
        </div>
        <ActionListEditor label="Acciones Legendarias" actions={c.legendaryActions} onChange={(a) => set("legendaryActions", a)} />
      </div>

      <div className="flex gap-2 pt-2">
        <button className="btn btn-primary" onClick={submit}>Guardar</button>
        <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}
