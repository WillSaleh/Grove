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
    color: "var(--cat-blue)",
    hint: "A moment that mattered",
    icon: "ph-mountains",
    label: "Milestone",
    ring: "color-mix(in srgb, var(--cat-blue) 32%, transparent)",
    tint: "color-mix(in srgb, var(--cat-blue) 15%, transparent)",
  },
  verse: {
    color: "var(--cat-orange)",
    hint: "Scripture that spoke",
    icon: "ph-book-open",
    label: "Verse",
    ring: "color-mix(in srgb, var(--cat-orange) 32%, transparent)",
    tint: "color-mix(in srgb, var(--cat-orange) 15%, transparent)",
  },
  gratitude: {
    color: "var(--cat-rose)",
    hint: "Something you’re thankful for",
    icon: "ph-heart",
    label: "Gratitude",
    ring: "color-mix(in srgb, var(--cat-rose) 32%, transparent)",
    tint: "color-mix(in srgb, var(--cat-rose) 15%, transparent)",
  },
  prayer: {
    color: "var(--cat-amber)",
    hint: "A request you’re carrying",
    icon: "ph-hands-praying",
    label: "Prayer",
    ring: "color-mix(in srgb, var(--cat-amber) 34%, transparent)",
    tint: "color-mix(in srgb, var(--cat-amber) 16%, transparent)",
  },
  reflection: {
    color: "var(--cat-green)",
    hint: "A journal thought",
    icon: "ph-notebook",
    label: "Reflection",
    ring: "color-mix(in srgb, var(--cat-green) 32%, transparent)",
    tint: "color-mix(in srgb, var(--cat-green) 15%, transparent)",
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
