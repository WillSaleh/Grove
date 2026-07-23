// Mirrors backend_service's response/request schemas (schemas/*.py). Kept separate from types/tree.ts
// because the shapes genuinely differ — see lib/entryMapping.ts for the translation between them.

export type BackendVerse = {
  id: string;
  entry_id: string;
  verse_ref: string | null;
  verse_text: string | null;
  translation: string | null;
  note: string | null;
};

export type BackendPrayer = {
  id: string;
  entry_id: string;
  prayer_text: string | null;
  answered: boolean;
  answered_at: string | null;
  answer_note: string | null;
};

export type BackendMedia = {
  id: string;
  entry_id: string;
  media_type: string;
  url: string | null;
  label: string | null;
};

export type BackendTag = {
  id: string;
  name: string;
  user_id: string | null;
};

export type StructuralTag = "root" | "milestone" | "reflection" | "gratitude";

// Structural entries (root/milestone/reflection/gratitude) — the full shape with nested children.
export type BackendEntryResponse = {
  id: string;
  tree_id: string;
  heading: string | null;
  body: string | null;
  tag: StructuralTag | null;
  category: string | null;
  entry_date: string | null;
  is_praise: boolean;
  is_encouragement: boolean;
  is_hearted: boolean;
  verses: Array<BackendVerse>;
  prayers: Array<BackendPrayer>;
  media: Array<BackendMedia>;
  entry_tag: BackendTag | null;
};

// Standalone verse/prayer entries — a slimmer shape with a single nested verse/prayer.
export type BackendVerseEntryResponse = {
  id: string;
  tree_id: string;
  tag: "verse";
  entry_date: string | null;
  is_hearted: boolean;
  verse: BackendVerse;
};

export type BackendPrayerEntryResponse = {
  id: string;
  tree_id: string;
  tag: "prayer";
  entry_date: string | null;
  is_hearted: boolean;
  prayer: BackendPrayer;
};

export type BackendEntry = BackendEntryResponse | BackendVerseEntryResponse | BackendPrayerEntryResponse;

export function isVerseEntry(entry: BackendEntry): entry is BackendVerseEntryResponse {
  return entry.tag === "verse";
}

export function isPrayerEntry(entry: BackendEntry): entry is BackendPrayerEntryResponse {
  return entry.tag === "prayer";
}
