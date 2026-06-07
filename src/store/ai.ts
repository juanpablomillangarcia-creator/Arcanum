"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jsonStorage, KEYS } from "@/src/lib/storage";

export type AiModel = "haiku" | "sonnet";

export const AI_MODELS: Record<AiModel, { name: string; desc: string }> = {
  haiku: { name: "Haiku 4.5", desc: "Rápido y barato — ideal para generación masiva" },
  sonnet: { name: "Sonnet 4.5", desc: "Calidad superior — para casos complejos" },
};

interface AiStore {
  apiKey: string;
  model: AiModel;
  setApiKey: (k: string) => void;
  setModel: (m: AiModel) => void;
  hasKey: () => boolean;
}

export const useAiStore = create<AiStore>()(
  persist(
    (set, get) => ({
      apiKey: "",
      model: "haiku",
      setApiKey: (apiKey) => set({ apiKey: apiKey.trim() }),
      setModel: (model) => set({ model }),
      hasKey: () => get().apiKey.startsWith("sk-ant-"),
    }),
    { name: KEYS.ai, storage: jsonStorage() },
  ),
);
