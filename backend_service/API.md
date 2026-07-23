# Grove Backend API

REST API reference for front-end clients integrating with the Grove backend.

Grove models a user's spiritual journey as a **tree**: each user owns one tree made up of **entries** (nodes). Structural entries (`root`, `milestone`, `reflection`, `gratitude`) use the full entry shape with heading, body, and optional nested children. Standalone **verse** and **prayer** entries use slimmer dedicated response types. Users can also create custom **tags** to label entries.

---

## Quick start

| Item | Value |
|------|-------|
| **Local base URL** | `http://localhost:8000` |
| **Public base URL (dev)** | Temporary `https://….trycloudflare.com` from `make run-public` or `make tunnel` |
| **Content type** | `application/json` |
| **IDs** | UUID strings (e.g. `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"`) |
| **Dates** | ISO 8601 date strings (`YYYY-MM-DD`) |
| **Authentication** | None on the API itself — the Grove web app uses username lookup + a client-side session (see [Client authentication](#client-authentication)) |
| **Interactive docs (local)** | [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI) |
| **OpenAPI schema (local)** | [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json) |

Run the server locally:

```bash
cd backend_service
make run
```

The server listens on `0.0.0.0:8000` with hot reload enabled.

### Public URL for local dev (optional)

To share the API while it runs on your machine, use Cloudflare's free **quick tunnel** (no account or DNS setup):

```bash
cd backend_service
make run-public
```

Or run the API and tunnel separately:

```bash
make run      # terminal 1
make tunnel   # terminal 2
```

`cloudflared` prints a temporary base URL like `https://random-words.trycloudflare.com`. Use it anywhere the docs show `http://localhost:8000` — e.g. Swagger at `https://….trycloudflare.com/docs`.

- The URL changes each time you start the tunnel.
- It only works while `make run-public` (or both `make run` and `make tunnel`) is running.
- Intended for local dev/demo, not production. See `cloudflare/README.md` for details.

### Client authentication

The Grove front end has a **login / create-account** screen. There are no passwords or API tokens yet — the client identifies users by **username** and remembers the signed-in user’s UUID in `localStorage`.

Typical flow:

1. **Log in** — `GET /users/by-username/{username}`. Returns `404` if the username does not exist. On success, store `UserResponse.id` client-side.
2. **Create account** — `POST /users` with `{ "username", "display_name" }`. Returns `409` if the username is taken. On success, store the returned `id`.
3. **Load journey** — `GET /users/{id}` returns `display_name`, `walking_since`, `bio`, `testimony_media`, and `tree.entries` (mixed entry shapes).
4. **Switch user** — clear the stored id and return to the login screen (no API call).
5. **Delete account** — `DELETE /users/{id}`, then clear the stored id.

> **Note:** Any client can call these endpoints if they know a user id or username. Server-side auth is not implemented yet.

---

## Domain model

```
User (optional bio)
 └── Tree (one per user, created automatically)
      └── Entry[] (ordered by entry_date; shape depends on tag)
           ├── EntryResponse (root | milestone | reflection | gratitude)
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
| `"reflection"` | Smaller/daily moment | `EntryResponse` |
| `"gratitude"` | A moment of giving thanks | `EntryResponse` |
| `"verse"` | Standalone verse on the timeline | `VerseEntryResponse` |
| `"prayer"` | Standalone prayer on the timeline | `PrayerEntryResponse` |

Structural entries (`root`, `milestone`, `reflection`, `gratitude`) can still include nested `verses[]`, `prayers[]`, and `media[]`. Standalone verse and prayer entries return a slim shape with a single `verse` or `prayer` object instead of the full entry fields.

Use `POST /entries/verse` or `POST /entries/prayer` to create a standalone verse/prayer entry - `POST /entries` no longer accepts `tag: "verse"`/`"prayer"` (rejected with a `422`); those tags only exist via the dedicated endpoints now.

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

### Verse of the day

#### `GET /verse_of_the_day`

Returns today's YouVersion verse of the day as NIV passage text. The backend resolves the calendar day (1–366), fetches the passage ID from YouVersion, then returns the passage payload.

No request body or query params.

**Response `200`** — YouVersion passage object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Passage identifier in USFM form (e.g. `"JHN.3.16"`) |
| `content` | string | Verse text |
| `reference` | string | Human-readable reference (e.g. `"John 3:16"`) |

**Example**

```http
GET /verse_of_the_day
```

```json
{
  "id": "JHN.3.16",
  "content": "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
  "reference": "John 3:16"
}
```

> **Server config:** The backend calls the YouVersion Platform API using `YVP_APP_KEY` from the environment. Clients do not send an app key.

---

### Verse lookup

#### `GET /verse`

Fetch passage text for an arbitrary reference (used by the entry form preview and the Bible auto-fetch pipeline). Resolves the reference via the YouVersion / Bible Content APIs.

**Query params**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `verse_ref` | string | yes | USFM-style reference with optional translation suffix |

**Reference format:** `"BOOK CHAPTER:VERSE"` or `"BOOK CHAPTER:VERSE-END"` plus optional `" VERSION"`.

Examples: `"JHN 3:16 NIV"`, `"PSA 23:1 ESV"`, `"1SA 5:1 NIV"`, `"MAT 5:7-12 NKJV"`.

Supported `VERSION` codes include: `AMP`, `ASV`, `BSB`, `CEV`, `CSB`, `ESV`, `GNT`, `HCSB`, `KJV`, `LSB`, `MSG`, `NASB`, `NET`, `NIV`, `NKJV`, `NLT`, `WEB`. Defaults to `NIV` when omitted.

**Response `200`**

| Field | Type | Description |
|-------|------|-------------|
| `verse_ref` | string | Echo of the requested reference (trimmed) |
| `verse_text` | string | Plain-text passage content |
| `translation` | string | Resolved version code (e.g. `"NIV"`) |

**Response `422`** — invalid reference or unknown version (`{ "detail": "..." }`)

**Example**

```http
GET /verse?verse_ref=JER%2029:11%20NIV
```

```json
{
  "verse_ref": "JER 29:11 NIV",
  "verse_text": "For I know the plans I have for you,” declares the Lord, “plans to prosper you and not to harm you...",
  "translation": "NIV"
}
```

> **Same resolver as create:** `POST /entries/verse` and nested verses on `POST /entries` use the same reference parser to auto-fill `verse_text`. Send `verse_ref` only — do not send `verse_text`.

---

### Users

#### `GET /users`

List all users. Each user includes their full tree and all entries (nested). Entries in `tree.entries` may be `EntryResponse`, `VerseEntryResponse`, or `PrayerEntryResponse` depending on each entry's `tag`.

**Response `200`** — `UserResponse[]`

#### `GET /users/{id}`

Fetch a single user by ID. `tree.entries` uses the same mixed entry shapes as `GET /users/{user_id}/entries`.

**Response `200`** — `UserResponse`  
**Response `404`** — `{ "detail": "User not found" }`

#### `GET /users/by-username/{username}`

Look up a user by **exact** username (whitespace trimmed). Used by the Grove login screen. Returns the same payload as `GET /users/{id}`.

**Response `200`** — `UserResponse`  
**Response `404`** — `{ "detail": "User not found" }`

**Example**

```http
GET /users/by-username/jane_doe
```

#### `POST /users`

Create a user. A tree is created automatically. `walking_since` is set to today's date.

**Request body** — `UserCreate`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | yes | Unique username |
| `display_name` | string | yes | Display name shown in the UI |

**Response `201`** — `UserResponse`  
**Response `409`** — `{ "detail": "Username already taken" }`

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

#### `POST /users/{user_id}/testimony/media`

Attach a photo or video to the user's testimony (separate from entry media). Use a URL from `POST /media/upload`.

**Request body** — `MediaCreate`

| Field | Type | Required |
|-------|------|----------|
| `media_type` | string | yes | e.g. `"photo"`, `"video"` |
| `url` | string \| null | no |

**Response `201`** — `TestimonyMediaResponse`  
**Response `404`** — `{ "detail": "User not found" }`

#### `DELETE /users/{user_id}/testimony/media/{media_id}`

Remove one testimony media item.

**Response `204`** — no body  
**Response `404`** — `{ "detail": "Media not found" }`

---

### Entries

Entries are created at the top level (`POST /entries`, `POST /entries/verse`, or `POST /entries/prayer`) but read and deleted under a user scope.

List, get, heart, and user-tree endpoints return one of three shapes depending on the entry's `tag`:

- **`EntryResponse`** — `root`, `milestone`, `reflection`, `gratitude`
- **`VerseEntryResponse`** — `verse`
- **`PrayerEntryResponse`** — `prayer`

Discriminate in client code by checking `tag` and which top-level field is present (`verse`, `prayer`, or the full entry fields).

#### `POST /entries`

Create a new structural entry (`root`, `milestone`, `reflection`, or `gratitude`) on a user's tree. `tag: "verse"`/`"prayer"` are rejected here with a `422` - use `POST /entries/verse`/`POST /entries/prayer` instead to create those.

**Request body** — `EntryCreate`

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `user_id` | string (UUID) | yes | — | Owner of the tree |
| `heading` | string | yes | — | Entry title |
| `body` | string | yes | — | Entry content |
| `tag` | `"root"` \| `"milestone"` \| `"reflection"` \| `"gratitude"` | yes | — | Node type on the tree |
| `category` | string \| null | no | `null` | Free-text category |
| `is_praise` | boolean | no | `false` | Praise flag |
| `is_encouragement` | boolean | no | `false` | Encouragement flag |
| `is_hearted` | boolean | no | `false` | Initial hearted state (see `PUT .../heart` to change later) |
| `tag_id` | string (UUID) \| null | no | `null` | ID of a Tag to associate |
| `verses` | `VerseCreate[]` | no | `[]` | Verses to attach as supporting content (see note below on `verse_text`) |
| `prayers` | `PrayerCreate[]` | no | `[]` | Prayers to attach as supporting content |
| `media` | `MediaCreate[]` | no | `[]` | Media attachments |

> **Verse text is auto-fetched.** For each nested verse, the backend calls the Bible API using `verse_ref` and fills in `verse_text` itself — do not send `verse_text`. If `verse_ref` doesn't match the expected format (e.g. `"GEN 3:6"` or `"GEN 3:6 NIV"`) or isn't a real reference, the entry is still created successfully (`201`) but that verse comes back with `verse_text: null` and no error at all — this is a known gap (should be a clean `422` instead), being tightened up.

**Response `201`** — `EntryResponse`  
**Response `404`** — `{ "detail": "User or tree not found" }`  
**Response `422`** — validation error, including `tag: "verse"`/`"prayer"` (use the dedicated endpoints instead)  
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

#### `PUT /users/{user_id}/entries/{entry_id}`

Update a structural entry (`root`, `milestone`, `reflection`, `gratitude`): `heading`, `body`, and/or `entry_date`.

**Response `200`** — `EntryResponse`  
**Response `404`** — `{ "detail": "Entry not found" }`

#### `PUT /users/{user_id}/entries/{entry_id}/verse`

Update a standalone verse entry's `verse_ref` and `note`. `verse_text` and `translation` are re-fetched from the Bible API when `verse_ref` changes.

**Request body** — `VerseCreate` (`verse_ref`, `note`)

**Response `200`** — `VerseEntryResponse`  
**Response `404`** — `{ "detail": "Entry not found" }`

#### `PUT /users/{user_id}/entries/{entry_id}/prayer`

Update a standalone prayer entry's `prayer_text`.

**Request body** — `PrayerCreate`

**Response `200`** — `PrayerEntryResponse`  
**Response `404`** — `{ "detail": "Entry not found" }`

#### `PUT /users/{user_id}/prayers/{prayer_id}/answered`

Mark a prayer as answered or unanswered. `prayer_id` is the nested prayer row id (from `prayer.id` on prayer entries), not the entry id.

**Request body** — `PrayerAnsweredUpdate`

| Field | Type | Required |
|-------|------|----------|
| `answered` | boolean | yes |
| `answer_note` | string \| null | no |

**Response `200`** — `PrayerResponse`  
**Response `404`** — `{ "detail": "Prayer not found" }`

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

#### `DELETE /users/{user_id}/entries/{entry_id}/media/{media_id}`

Remove one media attachment from an entry.

**Response `204`** — no body  
**Response `404`** — `{ "detail": "Media not found" }`

## Response types

### `UserResponse`

```json
{
  "id": "string",
  "username": "string",
  "display_name": "string",
  "walking_since": "2026-07-21",
  "bio": "string | null",
  "testimony_media": [{ "...": "TestimonyMediaResponse" }],
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

Returned for structural entries (`tag`: `root`, `milestone`, `reflection`, or `gratitude`).

```json
{
  "id": "string",
  "tree_id": "string",
  "heading": "string | null",
  "body": "string | null",
  "tag": "root | milestone | reflection | gratitude | null",
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
      "msg": "Input should be 'root', 'milestone', 'reflection' or 'gratitude'",
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

The API uses `tag` for the **tree node type** (`root`, `milestone`, `reflection`, `gratitude`, `verse`, `prayer`). The optional category label from the tags table is returned as `entry_tag`. When creating an entry, send the tag's UUID in `tag_id`.

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

On `POST /entries`, **verses, prayers, media, and `is_hearted` are all persisted** as supporting content on structural entries (`root`/`milestone`/`reflection`/`gratitude`). `POST /entries` no longer accepts `tag: "verse"`/`"prayer"` at all - use the dedicated endpoints below instead.

Dedicated create endpoints:

- `POST /entries/verse` — `VerseEntryCreate` → `VerseEntryResponse`
- `POST /entries/prayer` — `PrayerEntryCreate` → `PrayerEntryResponse`

There is no dedicated "attach a verse/prayer to an existing entry" endpoint yet — unlike media (`POST /users/{user_id}/entries/{entry_id}/media`), verses and prayers can currently only be provided in the same request that creates the entry.

### Media uploads

Use `POST /media/upload` to store a file locally, then pass the returned `/uploads/...` URL when creating an entry or calling `POST /users/{user_id}/entries/{entry_id}/media`.

### User payloads can be large

`GET /users` and `GET /users/{id}` embed the full tree with every entry and nested children. For list views, consider caching or using `GET /users/{user_id}/entries` when you only need entries.

### CORS

CORS is not configured in the backend. If the front end runs on a different origin (e.g. `http://localhost:3000`, or a `*.trycloudflare.com` URL while testing via quick tunnel), you will need either:

- a Next.js API route / proxy layer, or
- CORS middleware added to the FastAPI app.

### Public quick tunnel

`make run-public` or `make tunnel` exposes local `:8000` on a free temporary `https://….trycloudflare.com` URL. Anyone with that URL can call the API while your tunnel is running. There is no auth yet — treat shared URLs as dev-only.

### Authentication

There is no auth middleware. Any client that can reach the server can call any endpoint. Plan to add auth before production use.

---

## Example client flow

Typical sequence for onboarding a user and adding their first milestone:

```typescript
const BASE = "http://localhost:8000"; // or your https://….trycloudflare.com URL from `make run-public`

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
| `GET` | `/verse_of_the_day` | Today's verse of the day (NIV) |
| `GET` | `/verse?verse_ref=` | Look up passage text by reference |
| `GET` | `/users` | List users (with nested trees) |
| `GET` | `/users/by-username/{username}` | Look up user by username (login) |
| `GET` | `/users/{id}` | Get user by ID |
| `POST` | `/users` | Create user |
| `DELETE` | `/users/{id}` | Delete user |
| `PUT` | `/users/{id}/bio` | Set a user's testimony/bio |
| `POST` | `/users/{user_id}/testimony/media` | Attach testimony photo/video |
| `DELETE` | `/users/{user_id}/testimony/media/{media_id}` | Remove testimony media |
| `POST` | `/entries` | Create entry (returns shape based on `tag`) |
| `POST` | `/entries/verse` | Create standalone verse entry |
| `POST` | `/entries/prayer` | Create standalone prayer entry |
| `GET` | `/users/{user_id}/entries` | List user's entries |
| `GET` | `/users/{user_id}/entries/{entry_id}` | Get entry |
| `PUT` | `/users/{user_id}/entries/{entry_id}` | Update structural entry |
| `PUT` | `/users/{user_id}/entries/{entry_id}/verse` | Update verse entry |
| `PUT` | `/users/{user_id}/entries/{entry_id}/prayer` | Update prayer entry |
| `DELETE` | `/users/{user_id}/entries/{entry_id}` | Delete entry |
| `PUT` | `/users/{user_id}/entries/{entry_id}/heart` | Heart / un-heart an entry |
| `PUT` | `/users/{user_id}/prayers/{prayer_id}/answered` | Mark prayer answered |
| `GET` | `/users/{user_id}/tags` | List available tags |
| `POST` | `/users/{user_id}/tags` | Create custom tag |
| `DELETE` | `/users/{user_id}/tags/{tag_id}` | Delete custom tag |
| `POST` | `/media/upload` | Upload a media file |
| `POST` | `/users/{user_id}/entries/{entry_id}/media` | Attach media to an entry |
| `DELETE` | `/users/{user_id}/entries/{entry_id}/media/{media_id}` | Remove entry media |

---

## Changelog

### Recent changes

- **Client login** — `GET /users/by-username/{username}` supports username-only login; `POST /users` returns `409` when the username exists. The Grove app stores the user id client-side and loads the journey via `GET /users/{id}`.
- **Verse lookup** — `GET /verse?verse_ref=` returns `{ verse_ref, verse_text, translation }` for form preview; same parser as auto-fetch on create/update. Numbered books (e.g. `1SA`, `2CO`) are supported.
- **Verse of the day** — `GET /verse_of_the_day` returns today's YouVersion verse as NIV passage text (`id`, `content`, `reference`).
- **Public dev tunnel** — `make run-public` or `make tunnel` exposes local `:8000` on a free temporary `https://….trycloudflare.com` URL (see Quick start).
- **Entry types renamed/expanded** — `leaf` is now `reflection`, and `gratitude` is a new structural tag. `tag` is now `"root" | "milestone" | "reflection" | "gratitude" | "verse" | "prayer"`.
- **Redundant verse/prayer path retired** — `POST /entries` no longer accepts `tag: "verse"`/`"prayer"` at all (rejected with a standard `422`); `POST /entries/verse`/`POST /entries/prayer` are now the only way to create those.
- **Standalone verse entries** — `POST /entries/verse` creates a verse-only timeline item. Responses use `VerseEntryResponse` with a singular `verse` field (no `heading`/`body`/`verses[]`).
- **Standalone prayer entries** — `POST /entries/prayer` creates a prayer-only timeline item. Responses use `PrayerEntryResponse` with a singular `prayer` field (no `heading`/`body`/`prayers[]`).
- **Mixed entry lists** — `GET /users/{user_id}/entries`, `GET /users/{id}`, and heart responses return `EntryResponse`, `VerseEntryResponse`, or `PrayerEntryResponse` depending on each entry's `tag`.
- **Verses persisted** — `verses` on `POST /entries` now actually saves to the database, auto-fetching `verse_text` from `verse_ref` via the Bible API.
- **Hearting** — `is_hearted` is now actually read/written (previously always showed `false` regardless of the real value). `PUT /users/{user_id}/entries/{entry_id}/heart?hearted=true|false` toggles it after creation.
- **User bio** — `bio` field on users, settable via `PUT /users/{id}/bio`, for a testimony write-up separate from timeline entries.
- **Testimony media** — `testimony_media[]` on `UserResponse`; attach/remove via `POST /users/{user_id}/testimony/media` and `DELETE /users/{user_id}/testimony/media/{media_id}`.
- **Entry updates** — `PUT /users/{user_id}/entries/{entry_id}` (structural), `.../verse`, and `.../prayer` update existing entries.
- **Prayer answered** — `PUT /users/{user_id}/prayers/{prayer_id}/answered` toggles answered state and optional `answer_note`.
- **Media upload** — `POST /media/upload` stores files under `/uploads/` and serves them statically.
- **Attach media** — `POST /users/{user_id}/entries/{entry_id}/media` adds media to an existing entry.
- **Tag delete** — deleting a preset tag or a tag not owned by the user returns `404` instead of a silent `204`.

### Known limitations

- A malformed or unrecognized `verse_ref` currently succeeds silently with `verse_text: null` and no error, instead of a clean, descriptive `422` — being tightened up.
- No dedicated endpoint yet to attach a verse or prayer to an *already-existing* entry (media has this via `POST /users/{user_id}/entries/{entry_id}/media`; verses/prayers don't yet).

Document reflects the API as implemented in `routes.py` and `schemas/`. For the latest contract, prefer the auto-generated OpenAPI docs at `/docs` when the server is running.
