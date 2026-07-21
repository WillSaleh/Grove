from db import db_cursor
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
        row["verses"] = []
        row["prayers"] = []
        row["media"] = []
        return row
        
async def _attach_entry_children(cur, entry: dict):
    await cur.execute(
        "SELECT id, entry_id, verse_ref, verse_text FROM entries_verses WHERE entry_id = %s",
        (entry["id"],),
    )
    entry["verses"] = await cur.fetchall()

    await cur.execute(
        """
        SELECT id, entry_id, prayer_text, answered, answered_at, answer_note
        FROM entries_prayers WHERE entry_id = %s
        """,
        (entry["id"],),
    )
    entry["prayers"] = await cur.fetchall()

    await cur.execute(
        "SELECT id, entry_id, media_type, url, label FROM entries_media WHERE entry_id = %s",
        (entry["id"],),
    )
    entry["media"] = await cur.fetchall()


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