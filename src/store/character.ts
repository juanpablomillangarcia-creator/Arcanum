"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jsonStorage, KEYS } from "@/src/lib/storage";
import type { Character } from "@/src/lib/character";

interface CharacterStore {
  saved: Character[];
  add: (pc: Character) => void;
  update: (id: string, updates: Partial<Character>) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set) => ({
      saved: [],
      add: (pc) => set((state) => ({ saved: [...state.saved, pc] })),
      update: (id, updates) =>
        set((state) => ({
          saved: state.saved.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      remove: (id) =>
        set((state) => ({ saved: state.saved.filter((p) => p.id !== id) })),
      clear: () => set({ saved: [] }),
    }),
    {
      name: KEYS.characters,
      storage: jsonStorage(),
    },
  ),
);
