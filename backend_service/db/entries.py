from db import db_cursor
from db.media import postgres_media_create_for_entry, postgres_media_get_for_entry
from db.prayers import postgres_prayers_create_for_entry, postgres_prayers_get_for_entry
from db.tags import postgres_tag_get_by_id
from db.trees import postgres_tree_id_for_user
from db.verses import postgres_verses_create_for_entry, postgres_verses_get_for_entry
from schemas.tree_node import EntryCreate

_STANDALONE_ENTRY_FIELDS = (
    "heading",
    "body",
    "category",
    "is_praise",
    "is_encouragement",
    "prayers",
    "verses",
    "media",
    "entry_tag",
)


def _strip_standalone_entry_fields(entry: dict) -> None:
    for field in _STANDALONE_ENTRY_FIELDS:
        entry.pop(field, None)


def _format_entry_response(entry: dict) -> dict:
    tag = entry.get("tag")
    if tag == "verse":
        verses = entry.pop("verses", [])
        _strip_standalone_entry_fields(entry)
        entry["verse"] = verses[0]
        return entry

    if tag == "prayer":
        prayers = entry.pop("prayers", [])
        _strip_standalone_entry_fields(entry)
        entry["prayer"] = prayers[0]
        return entry

    return entry


async def postgres_entry_create(entry: EntryCreate):
    async with db_cursor(commit=True) as cur:
        tree_id = await postgres_tree_id_for_user(cur, entry.user_id)
        if tree_id is None:
            return None

        await cur.execute(
            """
            INSERT INTO entries (tree_id, heading, body, tag, category, is_praise, is_encouragement, is_hearted, tag_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, tree_id, heading, body, tag, category, entry_date, is_praise, is_encouragement, is_hearted, tag_id
            """,
            (
                tree_id,
                entry.heading,
                entry.body,
                entry.tag,
                entry.category,
                entry.is_praise,
                entry.is_encouragement,
                entry.is_hearted,
                entry.tag_id,
            ),
        )
        row = await cur.fetchone()

        await postgres_verses_create_for_entry(cur, row["id"], entry.verses)
        await postgres_prayers_create_for_entry(cur, row["id"], entry.prayers)
        await postgres_media_create_for_entry(cur, row["id"], entry.media)

        await _attach_entry_children(cur, row)
        return _format_entry_response(row)

async def _attach_entry_children(cur, entry: dict):
    entry["verses"] = await postgres_verses_get_for_entry(cur, entry["id"])

    entry["prayers"] = await postgres_prayers_get_for_entry(cur, entry["id"])

    entry["media"] = await postgres_media_get_for_entry(cur, entry["id"])

    tag_id = entry.pop("tag_id", None)
    entry["entry_tag"] = await postgres_tag_get_by_id(cur, tag_id) if tag_id else None


async def postgres_entry_set_hearted(user_id: str, entry_id: str, hearted: bool):
    async with db_cursor(commit=True) as cur:
        await cur.execute(
            """
            UPDATE entries
            SET is_hearted = %s
            WHERE id = %s AND tree_id = (SELECT id FROM trees WHERE user_id = %s)
            RETURNING id, tree_id, heading, body, tag, category, entry_date, is_praise, is_encouragement, is_hearted, tag_id
            """,
            (hearted, entry_id, user_id),
        )
        row = await cur.fetchone()
        if row is None:
            return None

        await _attach_entry_children(cur, row)
        return _format_entry_response(row)


async def postgres_entry_resource_get(user_id: str, entry_id: str):
    async with db_cursor() as cur:
        await cur.execute(
            """
            SELECT e.id, e.tree_id, e.heading, e.body, e.tag, e.category,
                   e.entry_date, e.is_praise, e.is_encouragement, e.is_hearted, e.tag_id
            FROM entries e
            JOIN trees t ON e.tree_id = t.id
            WHERE e.id = %s AND t.user_id = %s
            """,
            (entry_id, user_id),
        )
        entry = await cur.fetchone()
        if entry is None:
            return None

        await _attach_entry_children(cur, entry)
        return _format_entry_response(entry)


async def postgres_entry_collection_get(user_id: str):
    async with db_cursor() as cur:
        await cur.execute(
            """
            SELECT e.id, e.tree_id, e.heading, e.body, e.tag, e.category,
                   e.entry_date, e.is_praise, e.is_encouragement, e.is_hearted, e.tag_id
            FROM entries e
            JOIN trees t ON e.tree_id = t.id
            WHERE t.user_id = %s
            ORDER BY e.entry_date
            """,
            (user_id,),
        )
        entries = await cur.fetchall()

        for i, entry in enumerate(entries):
            await _attach_entry_children(cur, entry)
            entries[i] = _format_entry_response(entry)

        return entries


async def postgres_entry_resource_delete(user_id: str, entry_id: str):
    async with db_cursor(commit=True) as cur:
        await cur.execute(
            """
            DELETE FROM entries
            WHERE id = %s AND tree_id = (SELECT id FROM trees WHERE user_id = %s)
            """,
            (entry_id, user_id),
        )