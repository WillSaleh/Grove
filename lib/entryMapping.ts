// Translates between the frontend's flat Entry (types/tree.ts) and the backend's 3 entry shapes
// (types/backend.ts) — a structural entry (root/milestone/reflection/gratitude), a standalone verse
// entry, or a standalone prayer entry.
import { fromBackendVerseRef, toBackendVerseRef } from "@/lib/bibleBooks";
import type { BackendEntry, BackendMedia, StructuralTag } from "@/types/backend";
import { isPrayerEntry, isVerseEntry } from "@/types/backend";
import type { Entry, EntryType, MediaItem } from "@/types/tree";

function parseEntryDate(entryDate: string | null): { year: number; month: number; day: number } {
  const [year, month, day] = (entryDate ?? new Date().toISOString().slice(0, 10))
    .split("-")
    .map(Number);
  return { year, month: month - 1, day }; // backend months are 1-indexed, frontend months are 0-indexed
}

function toEntryDateString(entry: Pick<Entry, "year" | "month" | "day">): string {
  const month = String(entry.month + 1).padStart(2, "0");
  const day = String(entry.day).padStart(2, "0");
  return `${entry.year}-${month}-${day}`;
}

function mapBackendMedia(media: Array<BackendMedia>): Array<MediaItem> {
  return media.map((item) => ({
    kind: item.media_type === "video" ? "video" : "image",
    url: item.url ?? undefined,
  }));
}

// The frontend's picker only ever creates milestone/verse/gratitude/prayer/reflection — "root" can only
// arrive from data seeded outside the app. Map it to milestone (closest fit) rather than crash on it.
function structuralTagToEntryType(tag: StructuralTag | null): EntryType {
  if (tag === "root") return "milestone";
  return tag ?? "reflection";
}

export function backendEntryToEntry(entry: BackendEntry): Entry {
  const { year, month, day } = parseEntryDate(entry.entry_date);

  if (isVerseEntry(entry)) {
    return {
      id: entry.id,
      type: "verse",
      year,
      month,
      day,
      title: "",
      body: "",
      ref: fromBackendVerseRef(entry.verse.verse_ref),
      translation: entry.verse.translation ?? undefined,
      verseText: entry.verse.verse_text ?? undefined,
      note: entry.verse.note ?? undefined,
    };
  }

  if (isPrayerEntry(entry)) {
    const { title, body } = splitPrayerText(entry.prayer.prayer_text);
    return {
      id: entry.id,
      type: "prayer",
      year,
      month,
      day,
      title,
      body,
      answered: entry.prayer.answered,
      answeredNote: entry.prayer.answer_note ?? undefined,
      prayerId: entry.prayer.id,
    };
  }

  return {
    id: entry.id,
    type: structuralTagToEntryType(entry.tag),
    year,
    month,
    day,
    title: entry.heading ?? "",
    body: entry.body ?? "",
    media: entry.media.length ? mapBackendMedia(entry.media) : undefined,
  };
}

// Prayers only have one prayer_text field on the backend; title+body are joined with a blank line
// so they can be split back apart when reading the entry back.
function combinePrayerText(title: string, body: string): string {
  const t = title.trim();
  const b = body.trim();
  if (t && b) return `${t}\n\n${b}`;
  return t || b;
}

function splitPrayerText(prayerText: string | null): { title: string; body: string } {
  if (!prayerText) return { title: "", body: "" };
  const separatorIndex = prayerText.indexOf("\n\n");
  if (separatorIndex === -1) return { title: prayerText, body: "" };
  return { title: prayerText.slice(0, separatorIndex), body: prayerText.slice(separatorIndex + 2) };
}

export type EntryCreateRequest =
  | { path: "/entries/verse"; body: Record<string, unknown> }
  | { path: "/entries/prayer"; body: Record<string, unknown> }
  | { path: "/entries"; body: Record<string, unknown> };

export function entryToCreateRequest(entry: Entry, userId: string): EntryCreateRequest {
  const entry_date = toEntryDateString(entry);

  if (entry.type === "verse") {
    return {
      path: "/entries/verse",
      body: {
        user_id: userId,
        entry_date,
        verse: {
          verse_ref: entry.ref ? toBackendVerseRef(entry.ref, entry.translation) : null,
          note: entry.note ?? null,
        },
      },
    };
  }

  if (entry.type === "prayer") {
    return {
      path: "/entries/prayer",
      body: {
        user_id: userId,
        entry_date,
        prayer: { prayer_text: combinePrayerText(entry.title, entry.body) || null },
      },
    };
  }

  return {
    path: "/entries",
    body: {
      user_id: userId,
      entry_date,
      heading: entry.title,
      body: entry.body,
      tag: entry.type,
    },
  };
}

export type EntryUpdateRequest = { path: string; body: Record<string, unknown> };

// Unlike create, the update endpoints take user_id/entry_id in the URL, not the body.
export function entryToUpdateRequest(entry: Entry, userId: string, entryId: string): EntryUpdateRequest {
  const base = `/users/${userId}/entries/${entryId}`;

  if (entry.type === "verse") {
    return {
      path: `${base}/verse`,
      body: {
        verse_ref: entry.ref ? toBackendVerseRef(entry.ref, entry.translation) : null,
        note: entry.note ?? null,
      },
    };
  }

  if (entry.type === "prayer") {
    return {
      path: `${base}/prayer`,
      body: { prayer_text: combinePrayerText(entry.title, entry.body) || null },
    };
  }

  // Only send fields the frontend actually edits — the backend only updates fields present in the
  // request body, so omitting category/is_praise/is_encouragement/tag_id leaves them untouched.
  return {
    path: base,
    body: { heading: entry.title, body: entry.body, entry_date: toEntryDateString(entry) },
  };
}
