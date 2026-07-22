// The shared data contract for the whole front end. A journey is a flat, dated list of Entry items —
// each entry has a `type` that decides which fields matter (verse fields, prayer fields, media, …).
// This mirrors the backend's tag/verse/prayer entry shapes; the repository layer maps between them.

export type EntryType = "milestone" | "verse" | "gratitude" | "prayer" | "reflection";

export type MediaItem = {
  kind: "image" | "video" | "placeholder";
  url?: string;
};

export type Entry = {
  id: string;
  type: EntryType;
  // Dates are stored as parts to match the timeline's year → month → day navigation.
  year: number;
  month: number; // 0-indexed (0 = January)
  day: number;
  title: string;
  body: string;
  // verse
  ref?: string;
  translation?: string;
  verseText?: string;
  note?: string;
  // prayer
  answered?: boolean;
  answeredNote?: string;
  // attachments
  media?: Array<MediaItem>;
};

export type Person = {
  name: string;
  initials: string;
  since: number;
  av: Array<string>;
};

export type Testimony = {
  text: string;
  video: string | null;
  photos: Array<MediaItem>;
};

export type Journey = {
  person: Person;
  entries: Array<Entry>;
  testimony: Testimony;
};

export type TimelineView = "journey" | "connect";
export type ZoomLevel = "month" | "year";
