// Private-mode-safe storage, ported from the source's _lsSet/_lsGet/_lsDel guards.
// Used as the storage engine for zustand's persist middleware so every tool keeps
// using the same `arcanum.<tool>.v1` localStorage keys as arcanum-41.html.

import { type StateStorage, createJSONStorage } from "zustand/middleware";

let warned = false;

export const safeStorage: StateStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      if (!warned) {
        warned = true;
        console.warn("Almacenamiento no disponible (modo privado o lleno):", e);
      }
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* noop */
    }
  },
};

export const jsonStorage = () => createJSONStorage(() => safeStorage);

/** Storage keys, matching arcanum-41.html exactly. */
export const KEYS = {
  data: "arcanum.data.v1",
  homebrew: "arcanum.homebrew.v1",
  characters: "arcanum.characters.v1",
  bestiary: "arcanum.bestiary.v1",
  encounters: "arcanum.encounters.v1",
  npcs: "arcanum.npcs.v1",
  cities: "arcanum.cities.v1",
  loot: "arcanum.loot.v1",
  dungeons: "arcanum.dungeons.v1",
  campaigns: "arcanum.campaigns.v1",
  ai: "arcanum.ai.v1",
} as const;
