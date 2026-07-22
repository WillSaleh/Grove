from db import db_cursor
from schemas.media import MediaCreate


async def postgres_media_create_for_entry(cur, entry_id: str, media: list[MediaCreate]):
    for item in media:
        await cur.execute(
            """
            INSERT INTO entries_media (entry_id, media_type, url, label)
            VALUES (%s, %s, %s, NULL)
            """,
            (entry_id, item.media_type, item.url),
        )


async def postgres_media_get_for_entry(cur, entry_id: str):
    await cur.execute(
        """
        SELECT id, entry_id, media_type, url, label
        FROM entries_media WHERE entry_id = %s
        """,
        (entry_id,),
    )
    return await cur.fetchall()


async def postgres_media_attach_to_entry(user_id: str, entry_id: str, item: MediaCreate):
    async with db_cursor(commit=True) as cur:
        await cur.execute(
            """
            SELECT e.id FROM entries e
            JOIN trees t ON e.tree_id = t.id
            WHERE e.id = %s AND t.user_id = %s
            """,
            (entry_id, user_id),
        )
        if await cur.fetchone() is None:
            return None

        await cur.execute(
            """
            INSERT INTO entries_media (entry_id, media_type, url, label)
            VALUES (%s, %s, %s, NULL)
            RETURNING id, entry_id, media_type, url, label
            """,
            (entry_id, item.media_type, item.url),
        )
        return await cur.fetchone()
