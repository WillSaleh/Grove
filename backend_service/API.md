# Grove Backend API

REST API reference for front-end clients integrating with the Grove backend.

Grove models a user's spiritual journey as a **tree**: each user owns one tree made up of **entries** (nodes). Structural entries (`root`, `milestone`, `leaf`) use the full entry shape with heading, body, and optional nested children. Standalone **verse** and **prayer** entries use slimmer dedicated response types. Users can also create custom **tags** to label entries.

---

## Quick start

| Item | Value |
|------|-------|
| **Local base URL** | `http://localhost:8000` |
| **Content type** | `application/json` |
| **IDs** | UUID strings (e.g. `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"`) |
| **Dates** | ISO 8601 date strings (`YYYY-MM-DD`) |
| **Authentication** | None (not implemented yet) |
| **Interactive docs** | [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI) |
| **OpenAPI schema** | [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json) |

Run the server locally:

```bash
cd backend_service
make run
```

The server listens on `0.0.0.0:8000` with hot reload enabled.

---

## Domain model

```
User (optional bio)
 └── Tree (one per user, created automatically)
      └── Entry[] (ordered by entry_date; shape depends on tag)
           ├── EntryResponse (root | milestone | leaf)
           │    ├── verses[]
           │    ├── prayers[]
           │    ├── media[]
           │    └── entry_tag (optional Tag)
           ├── VerseEntryResponse (tag: verse)
           │    └── verse
           └── PrayerEntryResponse (tag: prayer)
                └── prayer
```

### Entry node types (`tag` field)

Each entry has a **node type** stored in the `tag` field. This is separate from user/category tags (`entry_tag` / `tag_id`).

| Value | Meaning | Response shape |
|-------|---------|----------------|
| `"root"` | Origin / foundation moment on the tree | `EntryResponse` |
| `"milestone"` | Major milestone | `EntryResponse` |
| `"leaf"` | Smaller moment or reflection | `EntryResponse` |
| `"verse"` | Standalone verse on the timeline | `VerseEntryResponse` |
| `"prayer"` | Standalone prayer on the timeline | `PrayerEntryResponse` |

Structural entries (`root`, `milestone`, `leaf`) can still include nested `verses[]`, `prayers[]`, and `media[]`. Standalone verse and prayer entries return a slim shape with a single `verse` or `prayer` object instead of the full entry fields.

Use `POST /entries/verse` or `POST /entries/prayer` for the dedicated create endpoints, or `POST /entries` with `tag: "verse"` / `tag: "prayer"` — all paths persist the same way and return the matching response shape.

Media does not have a standalone node type. Attach media to any entry via `media[]` on create or `POST /users/{user_id}/entries/{entry_id}/media`.

### Category tags

Tags are used to categorize entries (e.g. "Salvation", "Healing").

- **Preset tags** — seeded globally (`user_id: null`), available to all users, cannot be deleted via the API.
- **Custom tags** — created per user via `POST /users/{user_id}/tags`, can be deleted by that user.

When creating an entry, pass a tag's ID in `tag_id` to associate it. The resolved tag is returned on the entry as `entry_tag`.

**Preset tag names (seed data):**

Salvation, Baptism, Answered Prayer, Healing, Breakthrough, Trial / Struggle, Gratitude, Family, Calling / Purpose

---

## Endpoints

### Health & meta

#### `GET /`

Welcome message.

**Response `200`**

```json
{ "message": "Welcome to your Grove" }
```

#### `GET /health/db`

Verifies database connectivity.

**Response `200`**

```json
{ "db": "ok" }
```

---

### Users

#### `GET /users`

List all users. Each user includes their full tree and all entries (nested). Entries in `tree.entries` may be `EntryResponse`, `VerseEntryResponse`, or `PrayerEntryResponse` depending on each entry's `tag`.

**Response `200`** — `UserResponse[]`

#### `GET /users/{id}`

Fetch a single user by ID. `tree.entries` uses the same mixed entry shapes as `GET /users/{user_id}/entries`.

**Response `200`** — `UserResponse`  
**Response `404`** — `{ "detail": "User not found" }`

#### `POST /users`

Create a user. A tree is created automatically. `walking_since` is set to today's date.

**Request body** — `UserCreate`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | yes | Unique username |
| `display_name` | string | yes | Display name shown in the UI |

**Response `201`** — `UserResponse`

**Example**

```http
POST /users
Content-Type: application/json

{
  "username": "jane_doe",
  "display_name": "Jane Doe"
}
```

```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "username": "jane_doe",
  "display_name": "Jane Doe",
  "walking_since": "2026-07-21",
  "tree": {
    "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "user_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "entries": []
  }
}
```

#### `DELETE /users/{id}`

Delete a user. Cascades to their tree, entries, and related data.

**Response `204`** — no body

#### `PUT /users/{id}/bio`

Set a user's testimony/bio text. Typically written after signup, not at account creation.

**Request body** — `BioUpdate`

| Field | Type | Required |
|-------|------|----------|
| `bio` | string | yes |

**Response `200`** — `UserResponse`  
**Response `404`** — `{ "detail": "User not found" }`

**Example**

```http
PUT /users/f47ac10b-58cc-4372-a567-0e02b2c3d479/bio
Content-Type: application/json

{ "bio": "God has been faithful through every season." }
```

---

### Entries

Entries are created at the top level (`POST /entries`, `POST /entries/verse`, or `POST /entries/prayer`) but read and deleted under a user scope.

List, get, heart, and user-tree endpoints return one of three shapes depending on the entry's `tag`:

- **`EntryResponse`** — `root`, `milestone`, `leaf`
- **`VerseEntryResponse`** — `verse`
- **`PrayerEntryResponse`** — `prayer`

Discriminate in client code by checking `tag` and which top-level field is present (`verse`, `prayer`, or the full entry fields).

#### `POST /entries`

Create a new entry on a user's tree. Returns the full `EntryResponse` for structural tags, or the slim standalone shape when `tag` is `"verse"` or `"prayer"`.

**Request body** — `EntryCreate`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `user_id` | string (UUID) | yes | — | Owner of the tree |
| `heading` | string | yes | — | Entry title |
| `body` | string | yes | — | Entry content |
| `tag` | `"root"` \| `"milestone"` \| `"leaf"` \| `"verse"` \| `"prayer"` | yes | — | Node type on the tree |
| `category` | string \| null | no | `null` | Free-text category |
| `is_praise` | boolean | no | `false` | Praise flag |
| `is_encouragement` | boolean | no | `false` | Encouragement flag |
| `is_hearted` | boolean | no | `false` | Initial hearted state (see `PUT .../heart` to change later) |
| `tag_id` | string (UUID) \| null | no | `null` | ID of a Tag to associate |
| `verses` | `VerseCreate[]` | no | `[]` | Verses to attach (see note below on `verse_text`) |
| `prayers` | `PrayerCreate[]` | no | `[]` | Prayers to attach |
| `media` | `MediaCreate[]` | no | `[]` | Media attachments |

> **Verse text is auto-fetched.** For each verse, the backend calls the Bible API using `verse_ref` and fills in `verse_text` itself — do not send `verse_text`. If `verse_ref` doesn't match the expected format (e.g. `"GEN 3:6"` or `"GEN 3:6 NIV"`) or isn't a real reference, the entry is still created successfully (`201`) but that verse comes back with `verse_text: null` and no error at all — this is a known gap (should be a clean `422` instead), being tightened up.

**Response `201`** — `EntryResponse` \| `VerseEntryResponse` \| `PrayerEntryResponse`  
**Response `404`** — `{ "detail": "User or tree not found" }`  
**Response `422`** — validation error (invalid body)

**Example**

```http
POST /entries
Content-Type: application/json

{
  "user_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "heading": "First steps of faith",
  "body": "Today I decided to follow Jesus.",
  "tag": "root",
  "category": "reflection",
  "is_praise": true,
  "prayers": [{ "prayer_text": "Guide me in this new walk" }],
  "media": [{ "media_type": "photo", "url": "https://example.com/photo.jpg" }]
}
```

#### `POST /entries/verse`

Create a standalone verse entry. Preferred over `POST /entries` when adding a verse-only timeline item.

**Request body** — `VerseEntryCreate`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | string (UUID) | yes | Owner of the tree |
| `verse` | `VerseCreate` | yes | Verse reference to persist |

> **Verse text is auto-fetched.** Same behavior as `POST /entries`: send `verse_ref` only; the backend fills `verse_text` via the Bible API.

**Response `201`** — `VerseEntryResponse`  
**Response `404`** — `{ "detail": "User or tree not found" }`

**Example**

```http
POST /entries/verse
Content-Type: application/json

{
  "user_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "verse": { "verse_ref": "JHN 3:16 NIV" }
}
```

```json
{
  "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "tree_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "tag": "verse",
  "entry_date": "2026-07-22",
  "is_hearted": false,
  "verse": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "entry_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "verse_ref": "JHN 3:16 NIV",
    "verse_text": "For God so loved the world..."
  }
}
```

#### `POST /entries/prayer`

Create a standalone prayer entry. Preferred over `POST /entries` when adding a prayer-only timeline item.

**Request body** — `PrayerEntryCreate`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | string (UUID) | yes | Owner of the tree |
| `prayer` | `PrayerCreate` | yes | Prayer text to persist |

**Response `201`** — `PrayerEntryResponse`  
**Response `404`** — `{ "detail": "User or tree not found" }`

**Example**

```http
POST /entries/prayer
Content-Type: application/json

{
  "user_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "prayer": { "prayer_text": "Guide me in this new walk" }
}
```

```json
{
  "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "tree_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "tag": "prayer",
  "entry_date": "2026-07-22",
  "is_hearted": false,
  "prayer": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "entry_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "prayer_text": "Guide me in this new walk",
    "answered": false,
    "answered_at": null,
    "answer_note": null
  }
}
```

#### `GET /users/{user_id}/entries`

List all entries for a user, ordered by `entry_date` ascending.

**Response `200`** — `(EntryResponse | VerseEntryResponse | PrayerEntryResponse)[]`

> **Tip:** `GET /users/{id}` also returns all entries nested under `tree.entries`. Prefer the dedicated entries endpoint if you only need entry data.

#### `GET /users/{user_id}/entries/{entry_id}`

Fetch a single entry. The entry must belong to the given user's tree.

**Response `200`** — `EntryResponse` \| `VerseEntryResponse` \| `PrayerEntryResponse`  
**Response `404`** — `{ "detail": "Entry not found" }`

#### `DELETE /users/{user_id}/entries/{entry_id}`

Delete an entry from a user's tree.

**Response `204`** — no body

#### `PUT /users/{user_id}/entries/{entry_id}/heart`

Set (or unset) whether an entry is hearted, after it already exists.

**Query params**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `hearted` | boolean | yes | `true` to heart, `false` to un-heart |

**Response `200`** — `EntryResponse` \| `VerseEntryResponse` \| `PrayerEntryResponse`  
**Response `404`** — `{ "detail": "Entry not found" }`

**Example**

```http
PUT /users/f47ac10b-58cc-4372-a567-0e02b2c3d479/entries/6ba7b810-9dad-11d1-80b4-00c04fd430c8/heart?hearted=true
```

---

### Tags

#### `GET /users/{user_id}/tags`

List tags available to a user: all preset tags (`user_id: null`) plus that user's custom tags.

**Response `200`** — `TagResponse[]`

#### `POST /users/{user_id}/tags`

Create a custom tag for a user.

**Request body** — `TagCreate`

| Field | Type | Required |
|-------|------|----------|
| `name` | string | yes |

**Response `201`** — `TagResponse`

**Example**

```http
POST /users/f47ac10b-58cc-4372-a567-0e02b2c3d479/tags
Content-Type: application/json

{ "name": "Mission trip" }
```

#### `DELETE /users/{user_id}/tags/{tag_id}`

Delete a **custom** tag owned by the user. Preset tags (`user_id: null`) cannot be deleted and return `404`.

**Response `204`** — no body  
**Response `404`** — `{ "detail": "Tag not found" }` (preset tag, unknown tag ID, or tag owned by another user)

---

### Media

#### `POST /media/upload`

Upload a file to local storage. Returns a URL path served from `/uploads/...`.

**Request** — `multipart/form-data`

| Field | Type | Required |
|-------|------|----------|
| `file` | file | yes |

**Response `201`** — `MediaUploadResponse`

**Example**

```http
POST /media/upload
Content-Type: multipart/form-data

(file field)
```

```json
{ "url": "/uploads/a1b2c3d4e5f6.jpg" }
```

Uploaded files are served statically at `GET /uploads/{filename}`.

#### `POST /users/{user_id}/entries/{entry_id}/media`

Attach media to an existing entry. Use a URL from `POST /media/upload` or any external URL.

**Request body** — `MediaCreate`

| Field | Type | Required |
|-------|------|----------|
| `media_type` | string | yes |
| `url` | string \| null | no |

**Response `201`** — `MediaResponse`  
**Response `404`** — `{ "detail": "Entry not found" }` (entry missing or not owned by the user)

**Example**

```http
POST /users/f47ac10b-58cc-4372-a567-0e02b2c3d479/entries/6ba7b810-9dad-11d1-80b4-00c04fd430c8/media
Content-Type: application/json

{
  "media_type": "photo",
  "url": "/uploads/a1b2c3d4e5f6.jpg"
}
```

## Response types

### `UserResponse`

```json
{
  "id": "string",
  "username": "string",
  "display_name": "string",
  "walking_since": "2026-07-21",
  "bio": "string | null",
  "tree": { "...": "TreeResponse" }
}
```

### `TreeResponse`

```json
{
  "id": "string",
  "user_id": "string",
  "entries": [
    { "...": "EntryResponse | VerseEntryResponse | PrayerEntryResponse" }
  ]
}
```

### `EntryResponse`

Returned for structural entries (`tag`: `root`, `milestone`, or `leaf`).

```json
{
  "id": "string",
  "tree_id": "string",
  "heading": "string | null",
  "body": "string | null",
  "tag": "root | milestone | leaf | null",
  "category": "string | null",
  "entry_date": "2026-07-21",
  "is_praise": false,
  "is_encouragement": false,
  "is_hearted": false,
  "verses": [{ "...": "VerseResponse" }],
  "prayers": [{ "...": "PrayerResponse" }],
  "media": [{ "...": "MediaResponse" }],
  "entry_tag": { "...": "TagResponse" } | null
}
```

### `VerseEntryResponse`

Returned for standalone verse entries (`tag`: `verse`). No `heading`, `body`, or plural `verses[]` — content is in the singular `verse` field.

```json
{
  "id": "string",
  "tree_id": "string",
  "tag": "verse",
  "entry_date": "2026-07-21",
  "is_hearted": false,
  "verse": { "...": "VerseResponse" }
}
```

### `PrayerEntryResponse`

Returned for standalone prayer entries (`tag`: `prayer`). No `heading`, `body`, or plural `prayers[]` — content is in the singular `prayer` field.

```json
{
  "id": "string",
  "tree_id": "string",
  "tag": "prayer",
  "entry_date": "2026-07-21",
  "is_hearted": false,
  "prayer": { "...": "PrayerResponse" }
}
```

### `VerseResponse`

```json
{
  "id": "string",
  "entry_id": "string",
  "verse_ref": "GEN 3:6 NIV",
  "verse_text": "When the woman saw that the fruit..."
}
```

### `PrayerResponse`

```json
{
  "id": "string",
  "entry_id": "string",
  "prayer_text": "string | null",
  "answered": false,
  "answered_at": "2026-07-21 | null",
  "answer_note": "string | null"
}
```

### `MediaResponse`

```json
{
  "id": "string",
  "entry_id": "string",
  "media_type": "photo",
  "url": "https://example.com/photo.jpg",
  "label": "string | null"
}
```

### `MediaUploadResponse`

```json
{
  "url": "/uploads/a1b2c3d4e5f6.jpg"
}
```

### `TagResponse`

```json
{
  "id": "string",
  "name": "Salvation",
  "user_id": "string | null"
}
```

---

## Request types (nested objects)

### `VerseEntryCreate`

| Field | Type | Required |
|-------|------|----------|
| `user_id` | string (UUID) | yes |
| `verse` | `VerseCreate` | yes |

### `PrayerEntryCreate`

| Field | Type | Required |
|-------|------|----------|
| `user_id` | string (UUID) | yes |
| `prayer` | `PrayerCreate` | yes |

### `VerseCreate`

| Field | Type | Required |
|-------|------|----------|
| `verse_ref` | string \| null | no |

### `PrayerCreate`

| Field | Type | Required |
|-------|------|----------|
| `prayer_text` | string \| null | no |

### `MediaCreate`

| Field | Type | Required |
|-------|------|----------|
| `media_type` | string | yes |
| `url` | string \| null | no |

---

## Error handling

| Status | When |
|--------|------|
| `200` | Successful read |
| `201` | Resource created |
| `204` | Successful delete (empty body) |
| `404` | User, entry, tag, or tree not found |
| `422` | Request body failed validation |

### Validation errors (`422`)

FastAPI returns a structured validation payload:

```json
{
  "detail": [
    {
      "type": "literal_error",
      "loc": ["body", "tag"],
      "msg": "Input should be 'root', 'milestone', 'leaf', 'verse' or 'prayer'",
      "input": "branch"
    }
  ]
}
```

### Not found errors (`404`)

```json
{ "detail": "User not found" }
```

```json
{ "detail": "Entry not found" }
```

```json
{ "detail": "User or tree not found" }
```

```json
{ "detail": "Tag not found" }
```

---

## Front-end integration notes

### Naming: `tag` vs `entry_tag`

The API uses `tag` for the **tree node type** (`root`, `milestone`, `leaf`, `verse`, `prayer`). The optional category label from the tags table is returned as `entry_tag`. When creating an entry, send the tag's UUID in `tag_id`.

### Standalone entry shapes

Verse and prayer timeline items use dedicated response types (`VerseEntryResponse`, `PrayerEntryResponse`) with a single nested `verse` or `prayer` object. Structural entries use the full `EntryResponse` with optional `verses[]`, `prayers[]`, and `media[]`.

When rendering a mixed entry list, branch on `tag`:

```typescript
type TimelineEntry = EntryResponse | VerseEntryResponse | PrayerEntryResponse;

function isVerseEntry(entry: TimelineEntry): entry is VerseEntryResponse {
  return entry.tag === "verse" && "verse" in entry;
}

function isPrayerEntry(entry: TimelineEntry): entry is PrayerEntryResponse {
  return entry.tag === "prayer" && "prayer" in entry;
}
```

Prefer `POST /entries/verse` and `POST /entries/prayer` over `POST /entries` when creating standalone verse or prayer items — the request bodies are smaller and intent is clearer.

### No update endpoints yet

There are no `PATCH` or `PUT` routes. To change data today, delete and recreate, or wait for update endpoints to be added.

### Create support

On `POST /entries`, **verses, prayers, media, and `is_hearted` are all persisted**. Standalone `tag: "verse"` and `tag: "prayer"` entries return the slim response shapes even when created through `POST /entries`.

Dedicated create endpoints:

- `POST /entries/verse` — `VerseEntryCreate` → `VerseEntryResponse`
- `POST /entries/prayer` — `PrayerEntryCreate` → `PrayerEntryResponse`

There is no dedicated "attach a verse/prayer to an existing entry" endpoint yet — unlike media (`POST /users/{user_id}/entries/{entry_id}/media`), verses and prayers can currently only be provided in the same request that creates the entry.

### Media uploads

Use `POST /media/upload` to store a file locally, then pass the returned `/uploads/...` URL when creating an entry or calling `POST /users/{user_id}/entries/{entry_id}/media`.

### User payloads can be large

`GET /users` and `GET /users/{id}` embed the full tree with every entry and nested children. For list views, consider caching or using `GET /users/{user_id}/entries` when you only need entries.

### CORS

CORS is not configured in the backend. If the front end runs on a different origin (e.g. `http://localhost:3000`), you will need either:

- a Next.js API route / proxy layer, or
- CORS middleware added to the FastAPI app.

### Authentication

There is no auth middleware. Any client that can reach the server can call any endpoint. Plan to add auth before production use.

---

## Example client flow

Typical sequence for onboarding a user and adding their first milestone:

```typescript
const BASE = "http://localhost:8000";

// 1. Create user
const userRes = await fetch(`${BASE}/users`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "jane_doe",
    display_name: "Jane Doe",
  }),
});
const user = await userRes.json();

// 2. Load available tags (optional)
const tagsRes = await fetch(`${BASE}/users/${user.id}/tags`);
const tags = await tagsRes.json();

// 3. Create a root entry
const entryRes = await fetch(`${BASE}/entries`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    user_id: user.id,
    heading: "The day everything changed",
    body: "I gave my life to Christ.",
    tag: "root",
    tag_id: tags.find((t) => t.name === "Salvation")?.id ?? null,
    is_praise: true,
  }),
});
const entry = await entryRes.json();

// 4. Add a standalone verse entry
const verseRes = await fetch(`${BASE}/entries/verse`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    user_id: user.id,
    verse: { verse_ref: "JHN 3:16 NIV" },
  }),
});
const verseEntry = await verseRes.json();

// 5. Add a standalone prayer entry
const prayerRes = await fetch(`${BASE}/entries/prayer`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    user_id: user.id,
    prayer: { prayer_text: "Thank you for this new beginning." },
  }),
});
const prayerEntry = await prayerRes.json();

// 6. Read back the full tree
const treeRes = await fetch(`${BASE}/users/${user.id}`);
const fullUser = await treeRes.json();
console.log(fullUser.tree.entries); // mixed EntryResponse | VerseEntryResponse | PrayerEntryResponse[]
```

---

## Endpoint summary

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Welcome message |
| `GET` | `/health/db` | Database health check |
| `GET` | `/users` | List users (with nested trees) |
| `GET` | `/users/{id}` | Get user by ID |
| `POST` | `/users` | Create user |
| `DELETE` | `/users/{id}` | Delete user |
| `PUT` | `/users/{id}/bio` | Set a user's testimony/bio |
| `POST` | `/entries` | Create entry (returns shape based on `tag`) |
| `POST` | `/entries/verse` | Create standalone verse entry |
| `POST` | `/entries/prayer` | Create standalone prayer entry |
| `GET` | `/users/{user_id}/entries` | List user's entries |
| `GET` | `/users/{user_id}/entries/{entry_id}` | Get entry |
| `DELETE` | `/users/{user_id}/entries/{entry_id}` | Delete entry |
| `PUT` | `/users/{user_id}/entries/{entry_id}/heart` | Heart / un-heart an entry |
| `GET` | `/users/{user_id}/tags` | List available tags |
| `POST` | `/users/{user_id}/tags` | Create custom tag |
| `DELETE` | `/users/{user_id}/tags/{tag_id}` | Delete custom tag |
| `POST` | `/media/upload` | Upload a media file |
| `POST` | `/users/{user_id}/entries/{entry_id}/media` | Attach media to an entry |

---

## Changelog

### Recent changes

- **Standalone verse entries** — `POST /entries/verse` creates a verse-only timeline item. Responses use `VerseEntryResponse` with a singular `verse` field (no `heading`/`body`/`verses[]`).
- **Standalone prayer entries** — `POST /entries/prayer` creates a prayer-only timeline item. Responses use `PrayerEntryResponse` with a singular `prayer` field (no `heading`/`body`/`prayers[]`).
- **Mixed entry lists** — `GET /users/{user_id}/entries`, `GET /users/{id}`, and heart responses return `EntryResponse`, `VerseEntryResponse`, or `PrayerEntryResponse` depending on each entry's `tag`.
- **Entry node types** — `tag` accepts `"verse"` and `"prayer"` for standalone timeline entries.
- **Verses persisted** — `verses` on `POST /entries` now actually saves to the database, auto-fetching `verse_text` from `verse_ref` via the Bible API.
- **Hearting** — `is_hearted` is now actually read/written (previously always showed `false` regardless of the real value). `PUT /users/{user_id}/entries/{entry_id}/heart?hearted=true|false` toggles it after creation.
- **User bio** — `bio` field on users, settable via `PUT /users/{id}/bio`, for a testimony write-up separate from timeline entries.
- **Media upload** — `POST /media/upload` stores files under `/uploads/` and serves them statically.
- **Attach media** — `POST /users/{user_id}/entries/{entry_id}/media` adds media to an existing entry.
- **Tag delete** — deleting a preset tag or a tag not owned by the user returns `404` instead of a silent `204`.

### Known limitations

- A malformed or unrecognized `verse_ref` currently succeeds silently with `verse_text: null` and no error, instead of a clean, descriptive `422` — being tightened up.
- No dedicated endpoint yet to attach a verse or prayer to an *already-existing* entry (media has this via `POST /users/{user_id}/entries/{entry_id}/media`; verses/prayers don't yet).

Document reflects the API as implemented in `routes.py` and `schemas/`. For the latest contract, prefer the auto-generated OpenAPI docs at `/docs` when the server is running.
