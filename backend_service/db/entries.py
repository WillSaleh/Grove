from db import db_cursor
from db.media import postgres_media_create_for_entry, postgres_media_get_for_entry
from db.prayers import postgres_prayers_create_for_entry, postgres_prayers_get_for_entry
from schemas.tree_node import EntryCreate

async def postgres_entry_create(entry: EntryCreate):
    async with db_cursor(commit=True) as cur:
        await cur.execute(
            """
            INSERT INTO entries (tree_id, heading, body, tag, category, is_praise, is_encouragement)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, tree_id, heading, body, tag, category, entry_date, is_praise, is_encouragement
            """,
            (
                entry.tree_id,
                entry.heading,
                entry.body,
                entry.tag,
                entry.category,
                entry.is_praise,
                entry.is_encouragement,
            ),
        )
        row = await cur.fetchone()

        await postgres_prayers_create_for_entry(cur, row["id"], entry.prayers)
        await postgres_media_create_for_entry(cur, row["id"], entry.media)

        await _attach_entry_children(cur, row)
        return row
        
async def _attach_entry_children(cur, entry: dict):
    await cur.execute(
        "SELECT id, entry_id, verse_ref, verse_text FROM entries_verses WHERE entry_id = %s",
        (entry["id"],),
    )
    entry["verses"] = await cur.fetchall()

    entry["prayers"] = await postgres_prayers_get_for_entry(cur, entry["id"])

    entry["media"] = await postgres_media_get_for_entry(cur, entry["id"])


async def postgres_entry_resource_get(user_id: str, entry_id: str):
    async with db_cursor() as cur:
        await cur.execute(
            """
            SELECT e.id, e.tree_id, e.heading, e.body, e.tag, e.category,
                   e.entry_date, e.is_praise, e.is_encouragement
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
        return entry


async def postgres_entry_collection_get(user_id: str):
    async with db_cursor() as cur:
        await cur.execute(
            """
            SELECT e.id, e.tree_id, e.heading, e.body, e.tag, e.category,
                   e.entry_date, e.is_praise, e.is_encouragement
            FROM entries e
            JOIN trees t ON e.tree_id = t.id
            WHERE t.user_id = %s
            ORDER BY e.entry_date
            """,
            (user_id,),
        )
        entries = await cur.fetchall()

        for entry in entries:
            await _attach_entry_children(cur, entry)

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