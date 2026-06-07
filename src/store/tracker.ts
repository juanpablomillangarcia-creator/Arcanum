"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jsonStorage } from "@/src/lib/storage";

export type Side = "pj" | "enemy";

export interface Combatant {
  id: string;
  name: string;
  init: number | null;
  hp: number | null;
  maxHp: number | null;
  ca: number | null;
  side: Side;
  conditions: string[];
}

export interface NewCombatant {
  name: string;
  init?: string | number;
  hp?: string | number;
  ca?: string | number;
  side: Side;
}

interface TrackerStore {
  combatants: Combatant[];
  round: number;
  activeIdx: number;
  add: (data: NewCombatant) => void;
  remove: (id: string) => void;
  rollInit: () => number;
  next: () => void;
  reset: () => void;
  adjustHp: (id: string, delta: number) => void;
  setHp: (id: string, val: number) => void;
  toggleCondition: (id: string, cond: string) => void;
}

const newId = () => "trk_" + Date.now() + "_" + Math.floor(Math.random() * 99999);
const toNum = (v: unknown): number | null => {
  if (v === "" || v == null) return null;
  const n = parseInt(String(v), 10);
  return isNaN(n) ? null : n;
};

function sortByInit(list: Combatant[], activeId: string | null): { list: Combatant[]; activeIdx: number } {
  const sorted = [...list].sort((a, b) => (b.init ?? -999) - (a.init ?? -999));
  const activeIdx = activeId ? sorted.findIndex((c) => c.id === activeId) : -1;
  return { list: sorted, activeIdx };
}

export const useTrackerStore = create<TrackerStore>()(
  persist(
    (set, get) => ({
      combatants: [],
      round: 0,
      activeIdx: -1,

      add: (data) => {
        const c: Combatant = {
          id: newId(),
          name: data.name.trim() || "Sin nombre",
          init: toNum(data.init),
          maxHp: toNum(data.hp),
          hp: toNum(data.hp),
          ca: toNum(data.ca),
          side: data.side,
          conditions: [],
        };
        const { activeIdx, combatants } = get();
        const activeId = activeIdx >= 0 ? combatants[activeIdx]?.id ?? null : null;
        const res = sortByInit([...combatants, c], activeId);
        set({ combatants: res.list, activeIdx: res.activeIdx >= 0 ? res.activeIdx : get().activeIdx });
      },

      remove: (id) =>
        set((s) => {
          const combatants = s.combatants.filter((c) => c.id !== id);
          let activeIdx = s.activeIdx;
          if (activeIdx >= combatants.length) activeIdx = combatants.length - 1;
          return { combatants, activeIdx };
        }),

      rollInit: () => {
        let n = 0;
        const combatants = get().combatants.map((c) => {
          if (c.init == null) {
            n++;
            return { ...c, init: Math.floor(Math.random() * 20) + 1 };
          }
          return c;
        });
        const activeId = get().activeIdx >= 0 ? get().combatants[get().activeIdx]?.id ?? null : null;
        const res = sortByInit(combatants, activeId);
        set({ combatants: res.list, activeIdx: res.activeIdx >= 0 ? res.activeIdx : get().activeIdx });
        return n;
      },

      next: () =>
        set((s) => {
          if (!s.combatants.length) return s;
          if (s.round === 0) {
            const res = sortByInit(s.combatants, null);
            return { combatants: res.list, round: 1, activeIdx: 0 };
          }
          let activeIdx = s.activeIdx + 1;
          let round = s.round;
          if (activeIdx >= s.combatants.length) {
            activeIdx = 0;
            round++;
          }
          return { activeIdx, round };
        }),

      reset: () => set({ combatants: [], round: 0, activeIdx: -1 }),

      adjustHp: (id, delta) =>
        set((s) => ({
          combatants: s.combatants.map((c) => {
            if (c.id !== id || c.hp == null) return c;
            let hp = Math.max(0, c.hp + delta);
            if (c.maxHp != null) hp = Math.min(hp, c.maxHp);
            return { ...c, hp };
          }),
        })),

      setHp: (id, val) =>
        set((s) => ({
          combatants: s.combatants.map((c) => {
            if (c.id !== id) return c;
            let hp = Math.max(0, val);
            if (c.maxHp != null) hp = Math.min(hp, c.maxHp);
            return { ...c, hp };
          }),
        })),

      toggleCondition: (id, cond) =>
        set((s) => ({
          combatants: s.combatants.map((c) => {
            if (c.id !== id) return c;
            const conditions = c.conditions.includes(cond)
              ? c.conditions.filter((x) => x !== cond)
              : [...c.conditions, cond];
            return { ...c, conditions };
          }),
        })),
    }),
    { name: "arcanum.tracker.v1", storage: jsonStorage() },
  ),
);
