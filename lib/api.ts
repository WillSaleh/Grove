// Talks to backend_service.
import { API_BASE, resolveMediaUrl } from "@/lib/config";
import { backendEntryToEntry, entryToCreateRequest, entryToUpdateRequest } from "@/lib/entryMapping";
import { backendUserToTestimony } from "@/lib/testimonyMapping";
import type { BackendEntry, BackendUser } from "@/types/backend";
import type { Entry, MediaItem, Testimony } from "@/types/tree";

const USER_ID_KEY = "grove_user_id";

type UserResponse = {
  id: string;
  username: string;
  display_name: string;
};

type VerseOfTheDayResponse = {
  id: string;
  content: string;
  reference: string;
};

export type VerseOfTheDay = {
  ref: string;
  text: string;
};

// There's no login flow yet — a distinct guest user is created for each new browser on first load
// and remembered in localStorage, so different browsers/sessions never share one account's data.
export async function getOrCreateUserId(): Promise<string> {
  const stored = localStorage.getItem(USER_ID_KEY);
  if (stored) return stored;

  const username = `guest_${crypto.randomUUID().slice(0, 8)}`;
  const res = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, display_name: "Guest" }),
  });
  if (!res.ok) {
    throw new Error(`Failed to create demo user: ${res.status}`);
  }

  const user: UserResponse = await res.json();
  localStorage.setItem(USER_ID_KEY, user.id);
  return user.id;
}

export async function fetchEntries(userId: string): Promise<Array<Entry>> {
  const res = await fetch(`${API_BASE}/users/${userId}/entries`);
  if (!res.ok) {
    throw new Error(`Failed to load entries: ${res.status}`);
  }

  const entries: Array<BackendEntry> = await res.json();
  return entries.map(backendEntryToEntry);
}

export async function fetchTestimony(userId: string): Promise<Testimony> {
  const res = await fetch(`${API_BASE}/users/${userId}`);
  if (!res.ok) {
    throw new Error(`Failed to load user: ${res.status}`);
  }

  const user: BackendUser = await res.json();
  return backendUserToTestimony(user.bio, user.testimony_media);
}

export async function updateTestimonyText(userId: string, text: string): Promise<void> {
  const res = await fetch(`${API_BASE}/users/${userId}/bio`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bio: text }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update testimony: ${res.status}`);
  }
}

// entry.id is a throwaway placeholder from the form — the backend assigns the real id, returned here.
export async function createEntry(userId: string, entry: Entry): Promise<Entry> {
  const { path, body } = entryToCreateRequest(entry, userId);
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Failed to create entry: ${res.status}`);
  }

  const created: BackendEntry = await res.json();
  return backendEntryToEntry(created);
}

export async function deleteBackendEntry(userId: string, entryId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/users/${userId}/entries/${entryId}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(`Failed to delete entry: ${res.status}`);
  }
}

// prayerId is the prayer sub-object's own id (Entry.prayerId) — not the entry's id.
export async function setPrayerAnswered(
  userId: string,
  prayerId: string,
  answered: boolean,
  answerNote: string | null,
): Promise<void> {
  const res = await fetch(`${API_BASE}/users/${userId}/prayers/${prayerId}/answered`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answered, answer_note: answerNote }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update prayer: ${res.status}`);
  }
}

export async function updateBackendEntry(userId: string, entryId: string, entry: Entry): Promise<Entry> {
  const { path, body } = entryToUpdateRequest(entry, userId, entryId);
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Failed to update entry: ${res.status}`);
  }

  const updated: BackendEntry = await res.json();
  return backendEntryToEntry(updated);
}

export async function uploadMedia(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/media/upload`, { method: "POST", body: formData });
  if (!res.ok) {
    throw new Error(`Failed to upload file: ${res.status}`);
  }

  const data: { url: string } = await res.json();
  return data.url;
}

// Reconciles a media list against what's already persisted: uploads + attaches newly picked files,
// deletes items the caller removed, and leaves already-persisted items untouched. Returns the media
// array reflecting what's now actually persisted, for storing in local state. `attach`/`remove` hit
// whichever backend endpoint owns the media (an entry's, or the testimony's).
async function syncMedia(
  previousMedia: Array<MediaItem>,
  nextMedia: Array<MediaItem>,
  attach: (mediaType: string, url: string) => Promise<string>,
  remove: (mediaId: string) => Promise<void>,
): Promise<Array<MediaItem>> {
  const keptMediaIds = new Set(nextMedia.map((item) => item.mediaId).filter(Boolean));
  const removed = previousMedia.filter((item) => item.mediaId && !keptMediaIds.has(item.mediaId));
  await Promise.all(removed.map((item) => remove(item.mediaId as string)));

  return Promise.all(
    nextMedia
      .filter((item) => item.kind !== "placeholder")
      .map(async (item) => {
        if (!item.file) return item; // already persisted, unchanged

        const mediaType = item.kind === "video" ? "video" : "photo";
        const url = await uploadMedia(item.file);
        const mediaId = await attach(mediaType, url);
        return { kind: item.kind, url: resolveMediaUrl(url), mediaId };
      }),
  );
}

async function attachMedia(userId: string, entryId: string, mediaType: string, url: string): Promise<string> {
  const res = await fetch(`${API_BASE}/users/${userId}/entries/${entryId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ media_type: mediaType, url }),
  });
  if (!res.ok) {
    throw new Error(`Failed to attach media: ${res.status}`);
  }

  const data: { id: string } = await res.json();
  return data.id;
}

async function deleteMedia(userId: string, entryId: string, mediaId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/users/${userId}/entries/${entryId}/media/${mediaId}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(`Failed to delete media: ${res.status}`);
  }
}

export async function syncEntryMedia(
  userId: string,
  entryId: string,
  previousMedia: Array<MediaItem>,
  nextMedia: Array<MediaItem>,
): Promise<Array<MediaItem>> {
  return syncMedia(
    previousMedia,
    nextMedia,
    (mediaType, url) => attachMedia(userId, entryId, mediaType, url),
    (mediaId) => deleteMedia(userId, entryId, mediaId),
  );
}

async function attachTestimonyMedia(userId: string, mediaType: string, url: string): Promise<string> {
  const res = await fetch(`${API_BASE}/users/${userId}/testimony/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ media_type: mediaType, url }),
  });
  if (!res.ok) {
    throw new Error(`Failed to attach testimony media: ${res.status}`);
  }

  const data: { id: string } = await res.json();
  return data.id;
}

async function deleteTestimonyMedia(userId: string, mediaId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/users/${userId}/testimony/media/${mediaId}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(`Failed to delete testimony media: ${res.status}`);
  }
}

// Callers flatten the testimony's photos+video into one media list first — see lib/testimonyMapping.ts.
export async function syncTestimonyMedia(
  userId: string,
  previousMedia: Array<MediaItem>,
  nextMedia: Array<MediaItem>,
): Promise<Array<MediaItem>> {
  return syncMedia(
    previousMedia,
    nextMedia,
    (mediaType, url) => attachTestimonyMedia(userId, mediaType, url),
    (mediaId) => deleteTestimonyMedia(userId, mediaId),
  );
}

export async function fetchVerseText(verseRef: string): Promise<string> {
  const res = await fetch(`${API_BASE}/verse?verse_ref=${encodeURIComponent(verseRef)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch verse: ${res.status}`);
  }

  const data: { verse_text: string } = await res.json();
  return data.verse_text.trim();
}

export async function getVerseOfTheDay(): Promise<VerseOfTheDay> {
  const res = await fetch(`${API_BASE}/verse_of_the_day`);
  if (!res.ok) {
    throw new Error(`Failed to fetch verse of the day: ${res.status}`);
  }

  const data: VerseOfTheDayResponse = await res.json();
  return {
    ref: data.reference,
    text: data.content.trim(),
  };
}
