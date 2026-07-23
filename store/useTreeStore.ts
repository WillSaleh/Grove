// Zustand store — the single source of truth for the signed-in person's journey (entries + testimony).
// The UI reads entries from here and derives everything else (years, active view, nodes) during render.
// Mutations are optimistic and local for now; wiring to the backend is a swap in the repository layer.
import { create } from "zustand";

import type { Entry, Person, Testimony } from "@/types/tree";

const EMPTY_PERSON: Person = {
  av: ["#4a5759"],
  initials: "",
  name: "",
  since: new Date().getFullYear(),
};

const EMPTY_TESTIMONY: Testimony = {
  media: [],
  text: "",
};

type TreeStore = {
  addEntry: (entry: Entry) => void;
  deleteEntry: (id: string) => void;
  entries: Array<Entry>;
  person: Person;
  saveTestimony: (testimony: Testimony) => void;
  setAnswered: (id: string, answered: boolean) => void;
  setEntries: (entries: Array<Entry>) => void;
  setPerson: (person: Person) => void;
  setTestimony: (testimony: Testimony) => void;
  setUserId: (userId: string) => void;
  clearSession: () => void;
  testimony: Testimony;
  updateEntry: (entry: Entry) => void;
  userId: string | null;
};

export const useTreeStore = create<TreeStore>((set) => ({
  entries: [],
  person: EMPTY_PERSON,
  testimony: EMPTY_TESTIMONY,
  userId: null,

  addEntry: (entry) => set((state) => ({ entries: [...state.entries, entry] })),

  deleteEntry: (id) => set((state) => ({ entries: state.entries.filter((entry) => entry.id !== id) })),

  saveTestimony: (testimony) => set({ testimony }),

  setAnswered: (id, answered) =>
    set((state) => ({
      entries: state.entries.map((entry) => (entry.id === id ? { ...entry, answered } : entry)),
    })),

  setEntries: (entries) => set({ entries }),

  setPerson: (person) => set({ person }),

  setTestimony: (testimony) => set({ testimony }),

  setUserId: (userId) => set({ userId }),

  clearSession: () =>
    set({
      entries: [],
      person: EMPTY_PERSON,
      testimony: EMPTY_TESTIMONY,
      userId: null,
    }),

  updateEntry: (updated) =>
    set((state) => ({
      entries: state.entries.map((entry) => (entry.id === updated.id ? updated : entry)),
    })),
}));
