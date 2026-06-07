"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jsonStorage, KEYS } from "@/src/lib/storage";

export interface CampSession {
  id: string;
  num: number;
  date: string;
  title: string;
  body: string;
  prep: Record<string, string>;
  createdAt: number;
}

export interface CampEntity {
  id: string;
  kind: string;
  name: string;
  desc: string;
  status: string;
  lore: string;
}

export interface CampRelation {
  id: string;
  from: string;
  to: string;
  type: string;
  note: string;
}

export interface CampThread {
  id: string;
  title: string;
  desc: string;
  status: string;
  priority: number;
  future: boolean;
  links: string[];
}

export interface CampNote {
  id: string;
  kind: string;
  text: string;
}

export interface CampPage {
  id: string;
  title: string;
  body: string;
  folderId: string | null;
}

export interface CampFolder {
  id: string;
  name: string;
}

export interface Campaign {
  id: string;
  name: string;
  premise: string;
  type: string;
  level: string;
  tone: string;
  sessions: CampSession[];
  entities: CampEntity[];
  relations: CampRelation[];
  threads: CampThread[];
  notes: CampNote[];
  notebook: CampPage[];
  notebookFolders: CampFolder[];
  createdAt: number;
  updatedAt: number;
}

interface CampaignStore {
  campaigns: Campaign[];
  currentId: string | null;
  add: (campaign: Campaign) => void;
  update: (id: string, updates: Partial<Campaign>) => void;
  remove: (id: string) => void;
  setCurrent: (id: string | null) => void;
}

export const useCampaignStore = create<CampaignStore>()(
  persist(
    (set) => ({
      campaigns: [],
      currentId: null,
      add: (campaign) =>
        set((state) => ({ campaigns: [campaign, ...state.campaigns] })),
      update: (id, updates) =>
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c,
          ),
        })),
      remove: (id) =>
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== id),
          currentId: state.currentId === id ? null : state.currentId,
        })),
      setCurrent: (id) => set({ currentId: id }),
    }),
    {
      name: KEYS.campaigns,
      storage: jsonStorage(),
    },
  ),
);
