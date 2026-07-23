// Zustand store — the single source of truth for the signed-in person's journey (entries + testimony).
// The UI reads entries from here and derives everything else (years, active view, nodes) during render.
// Mutations are optimistic and local for now; wiring to the backend is a swap in the repository layer.
import { create } from "zustand";

import { SEED_JOURNEY } from "@/lib/seed";
import type { Entry, Person, Testimony } from "@/types/tree";

type TreeStore = {
  addEntry: (entry: Entry) => void;
  deleteEntry: (id: string) => void;
  entries: Array<Entry>;
  person: Person;
  saveTestimony: (testimony: Testimony) => void;
  setAnswered: (id: string, answered: boolean) => void;
  setUserId: (userId: string) => void;
  testimony: Testimony;
  updateEntry: (entry: Entry) => void;
  userId: string | null;
};

export const useTreeStore = create<TreeStore>((set) => ({
  entries: SEED_JOURNEY.entries,
  person: SEED_JOURNEY.person,
  testimony: SEED_JOURNEY.testimony,
  userId: null,

  addEntry: (entry) => set((state) => ({ entries: [...state.entries, entry] })),

  deleteEntry: (id) => set((state) => ({ entries: state.entries.filter((entry) => entry.id !== id) })),

  saveTestimony: (testimony) => set({ testimony }),

  setAnswered: (id, answered) =>
    set((state) => ({
      entries: state.entries.map((entry) => (entry.id === id ? { ...entry, answered } : entry)),
    })),

  setUserId: (userId) => set({ userId }),

  updateEntry: (updated) =>
    set((state) => ({
      entries: state.entries.map((entry) => (entry.id === updated.id ? updated : entry)),
    })),
}));
