"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jsonStorage, KEYS } from "@/src/lib/storage";
import type { EncounterResult } from "@/src/lib/encounter";

export interface SavedEncounter {
  name: string;
  partySize: number;
  partyLevel: number;
  difficulty: string;
  creatures: EncounterResult["creatures"];
  adjustedXP: number;
  savedAt: number;
}

interface EncounterStore {
  saved: SavedEncounter[];
  add: (encounter: SavedEncounter) => void;
  remove: (index: number) => void;
  clear: () => void;
}

export const useEncounterStore = create<EncounterStore>()(
  persist(
    (set) => ({
      saved: [],
      add: (encounter) =>
        set((state) => ({ saved: [encounter, ...state.saved] })),
      remove: (index) =>
        set((state) => ({
          saved: state.saved.filter((_, i) => i !== index),
        })),
      clear: () => set({ saved: [] }),
    }),
    {
      name: KEYS.encounters,
      storage: jsonStorage(),
    },
  ),
);
