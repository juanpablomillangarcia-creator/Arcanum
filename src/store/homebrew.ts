"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jsonStorage, KEYS } from "@/src/lib/storage";
import type { SrdEntry } from "@/src/data/srd";

interface HomebrewStore {
  items: SrdEntry[];
  add: (item: SrdEntry) => void;
  remove: (id: string) => void;
  update: (id: string, updates: Partial<SrdEntry>) => void;
  clear: () => void;
}

export const useHomebrewStore = create<HomebrewStore>()(
  persist(
    (set) => ({
      items: [],
      add: (item) => set((state) => ({ items: [...state.items, item] })),
      remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      update: (id, updates) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: KEYS.homebrew,
      storage: jsonStorage(),
    }
  )
);
