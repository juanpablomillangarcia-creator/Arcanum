"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jsonStorage, KEYS } from "@/src/lib/storage";

export interface HistoryEntry { formula: string; total: number; ts: number; }

interface DiceStore {
  history: HistoryEntry[];
  push: (entry: HistoryEntry) => void;
  clear: () => void;
}

export const useDiceStore = create<DiceStore>()(
  persist(
    (set) => ({
      history: [],
      push: (entry) =>
        set((s) => ({ history: [entry, ...s.history].slice(0, 30) })),
      clear: () => set({ history: [] }),
    }),
    { name: KEYS.data, storage: jsonStorage() },
  ),
);
