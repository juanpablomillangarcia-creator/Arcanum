"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jsonStorage, KEYS } from "@/src/lib/storage";
import type { HomebrewCreature } from "@/src/lib/bestiary";

interface BestiaryStore {
  homebrew: HomebrewCreature[];
  add: (creature: HomebrewCreature) => void;
  update: (id: string, updates: Partial<HomebrewCreature>) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useBestiaryStore = create<BestiaryStore>()(
  persist(
    (set) => ({
      homebrew: [],
      add: (creature) =>
        set((state) => ({ homebrew: [...state.homebrew, creature] })),
      update: (id, updates) =>
        set((state) => ({
          homebrew: state.homebrew.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        })),
      remove: (id) =>
        set((state) => ({
          homebrew: state.homebrew.filter((c) => c.id !== id),
        })),
      clear: () => set({ homebrew: [] }),
    }),
    {
      name: KEYS.bestiary,
      storage: jsonStorage(),
    },
  ),
);
