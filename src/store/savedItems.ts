"use client";

import { create, type StoreApi, type UseBoundStore } from "zustand";
import { persist } from "zustand/middleware";
import { jsonStorage } from "@/src/lib/storage";

export interface Saved<T> { id: string; savedAt: number; label: string; data: T; }

export interface SavedItemsStore<T> {
  items: Saved<T>[];
  save: (data: T, label: string) => string;
  remove: (id: string) => void;
  clear: () => void;
}

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// Factory: one persisted store of saved items per localStorage key. This replaces the
// hand-written save/load/delete boilerplate that the source repeated for every generator.
export function makeSavedStore<T>(storageKey: string): UseBoundStore<StoreApi<SavedItemsStore<T>>> {
  return create<SavedItemsStore<T>>()(
    persist(
      (set) => ({
        items: [],
        save: (data, label) => {
          const id = newId();
          set((s) => ({ items: [{ id, savedAt: Date.now(), label, data }, ...s.items] }));
          return id;
        },
        remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
        clear: () => set({ items: [] }),
      }),
      { name: storageKey, storage: jsonStorage() },
    ),
  );
}
