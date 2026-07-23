// Talks to backend_service. Override the base URL (e.g. for a Cloudflare tunnel demo) via NEXT_PUBLIC_API_BASE_URL.
import { backendEntryToEntry, entryToCreateRequest, entryToUpdateRequest } from "@/lib/entryMapping";
import type { BackendEntry } from "@/types/backend";
import type { Entry } from "@/types/tree";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

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

// There's no login flow yet — one demo user is created on first load and remembered in localStorage.
export async function getOrCreateUserId(): Promise<string> {
  const stored = localStorage.getItem(USER_ID_KEY);
  if (stored) return stored;

  const res = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "maya_bennett", display_name: "Maya Bennett" }),
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
