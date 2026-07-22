# Grove Backend API

REST API reference for front-end clients integrating with the Grove backend.

Grove models a user's spiritual journey as a **tree**: each user owns one tree made up of **entries** (nodes). Entries can include prayers, media, Bible verses, and optional category tags. Users can also create custom **tags** to label entries.

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
User
 └── Tree (one per user, created automatically)
      └── Entry[] (ordered by entry_date)
           ├── verses[]
           ├── prayers[]
           ├── media[]
           └── entry_tag (optional Tag)
```

### Entry node types (`tag` field)

Each entry has a **node type** stored in the `tag` field. This is separate from user/category tags (`entry_tag` / `tag_id`).

| Value | Meaning |
|-------|---------|
| `"root"` | Origin / foundation moment on the tree |
| `"milestone"` | Major milestone |
| `"leaf"` | Smaller moment or reflection |
| `"verse"` | Standalone verse entry; content lives in `verses[]` |
| `"prayer"` | Standalone prayer entry; content lives in `prayers[]` |

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

List all users. Each user includes their full tree and all entries (nested).

**Response `200`** — `UserResponse[]`

#### `GET /users/{id}`

Fetch a single user by ID.

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

---

### Entries

Entries are created at the top level (`POST /entries`) but read and deleted under a user scope.

#### `POST /entries`

Create a new entry on a user's tree.

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
| `is_hearted` | boolean | no | `false` | Accepted in request; **not persisted yet** |
| `tag_id` | string (UUID) \| null | no | `null` | ID of a Tag to associate |
| `verses` | `VerseCreate[]` | no | `[]` | Accepted in request; **not persisted yet** |
| `prayers` | `PrayerCreate[]` | no | `[]` | Prayers to attach |
| `media` | `MediaCreate[]` | no | `[]` | Media attachments |

**Response `201`** — `EntryResponse`  
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

#### `GET /users/{user_id}/entries`

List all entries for a user, ordered by `entry_date` ascending.

**Response `200`** — `EntryResponse[]`

> **Tip:** `GET /users/{id}` also returns all entries nested under `tree.entries`. Prefer the dedicated entries endpoint if you only need entry data.

#### `GET /users/{user_id}/entries/{entry_id}`

Fetch a single entry. The entry must belong to the given user's tree.

**Response `200`** — `EntryResponse`  
**Response `404`** — `{ "detail": "Entry not found" }`

#### `DELETE /users/{user_id}/entries/{entry_id}`

Delete an entry from a user's tree.

**Response `204`** — no body

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
  "tree": { "...": "TreeResponse" }
}
```

### `TreeResponse`

```json
{
  "id": "string",
  "user_id": "string",
  "entries": [{ "...": "EntryResponse" }]
}
```

### `EntryResponse`

```json
{
  "id": "string",
  "tree_id": "string",
  "heading": "string | null",
  "body": "string | null",
  "tag": "root | milestone | leaf | verse | prayer | null",
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

### No update endpoints yet

There are no `PATCH` or `PUT` routes. To change data today, delete and recreate, or wait for update endpoints to be added.

### Partial create support

On `POST /entries`:

- **Prayers** and **media** are persisted (including on standalone `tag: "prayer"` entries).
- **`verses`** and **`is_hearted`** are accepted in the request schema but are **not written** to the database yet. Verses can still appear in responses if inserted elsewhere (e.g. direct DB or a future endpoint).

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

// 4. Read back the full tree
const treeRes = await fetch(`${BASE}/users/${user.id}`);
const fullUser = await treeRes.json();
console.log(fullUser.tree.entries);
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
| `POST` | `/entries` | Create entry |
| `GET` | `/users/{user_id}/entries` | List user's entries |
| `GET` | `/users/{user_id}/entries/{entry_id}` | Get entry |
| `DELETE` | `/users/{user_id}/entries/{entry_id}` | Delete entry |
| `GET` | `/users/{user_id}/tags` | List available tags |
| `POST` | `/users/{user_id}/tags` | Create custom tag |
| `DELETE` | `/users/{user_id}/tags/{tag_id}` | Delete custom tag |
| `POST` | `/media/upload` | Upload a media file |
| `POST` | `/users/{user_id}/entries/{entry_id}/media` | Attach media to an entry |

---

## Changelog

### Recent changes

- **Entry node types** — `tag` now accepts `"verse"` and `"prayer"` for standalone timeline entries.
- **Media upload** — `POST /media/upload` stores files under `/uploads/` and serves them statically.
- **Attach media** — `POST /users/{user_id}/entries/{entry_id}/media` adds media to an existing entry.
- **Tag delete** — deleting a preset tag or a tag not owned by the user returns `404` instead of a silent `204`.

Document reflects the API as implemented in `routes.py` and `schemas/` on the `main` branch. For the latest contract, prefer the auto-generated OpenAPI docs at `/docs` when the server is running.
