import type { EntryType } from "@/types/tree";

// Per-type presentation metadata. `icon` is a Phosphor class suffix (e.g. "ph-mountains") used with
// the ph-duotone / ph-fill weight classes. Colors are intentionally raw hex here: they drive inline
// styles across chips, hero panels, toggles, and badges, where a class-per-combination would be the
// wrong abstraction.
export type EntryTypeMeta = {
  color: string;
  hint: string;
  icon: string;
  label: string;
  ring: string;
  tint: string;
};

export const ENTRY_TYPES: Record<EntryType, EntryTypeMeta> = {
  milestone: {
    color: "#4a5759",
    hint: "A moment that mattered",
    icon: "ph-mountains",
    label: "Milestone",
    ring: "rgba(74,87,89,.28)",
    tint: "rgba(74,87,89,.1)",
  },
  verse: {
    color: "#a5634a",
    hint: "Scripture that spoke",
    icon: "ph-book-open",
    label: "Verse",
    ring: "rgba(165,99,74,.28)",
    tint: "rgba(165,99,74,.1)",
  },
  gratitude: {
    color: "#ab5872",
    hint: "Something you’re thankful for",
    icon: "ph-heart",
    label: "Gratitude",
    ring: "rgba(171,88,114,.28)",
    tint: "rgba(171,88,114,.1)",
  },
  prayer: {
    color: "#8a6b32",
    hint: "A request you’re carrying",
    icon: "ph-hands-praying",
    label: "Prayer",
    ring: "rgba(138,107,50,.3)",
    tint: "rgba(138,107,50,.12)",
  },
  reflection: {
    color: "#527257",
    hint: "A journal thought",
    icon: "ph-notebook",
    label: "Reflection",
    ring: "rgba(82,114,87,.28)",
    tint: "rgba(82,114,87,.1)",
  },
};

// Order the type picker and any type-driven UI follow.
export const ENTRY_TYPE_ORDER: Array<EntryType> = [
  "milestone",
  "verse",
  "gratitude",
  "prayer",
  "reflection",
];
