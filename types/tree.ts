// The shared data contract for the whole front end. A journey is a flat, dated list of Entry items —
// each entry has a `type` that decides which fields matter (verse fields, prayer fields, media, …).
// This mirrors the backend's tag/verse/prayer entry shapes; the repository layer maps between them.

export type EntryType = "milestone" | "verse" | "gratitude" | "prayer" | "reflection";

export type MediaItem = {
  kind: "image" | "video" | "placeholder";
  url?: string;
  // Present only for a freshly-picked, not-yet-uploaded file — the raw File to upload on save.
  file?: File;
  // The backend's own media row id, present only once this item has actually been persisted.
  // Needed to call the delete-media endpoint later; not shown anywhere in the UI.
  mediaId?: string;
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
  // The prayer sub-object has its own backend id, separate from the entry's id — PUT .../prayers/{id}/answered
  // needs this one, not `id`. Not shown anywhere in the UI.
  prayerId?: string;
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
  // Same shape as Entry.media — kind distinguishes photo vs video, same as it does there.
  media: Array<MediaItem>;
};

export type Journey = {
  person: Person;
  entries: Array<Entry>;
  testimony: Testimony;
};

export type TimelineView = "journey" | "community" | "friends" | "profile";
export type ConnectTab = "groups" | "feed" | "timeline";
export type FriendsTab = "all" | "requests" | "suggested" | "discover" | "privacy";
export type ZoomLevel = "month" | "year";
