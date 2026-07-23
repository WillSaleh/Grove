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


async def postgres_media_get_for_user(cur, user_id: str):
    await cur.execute(
        """
        SELECT m.id, m.entry_id, m.media_type, m.url, m.label
        FROM entries_media m
        JOIN entries e ON m.entry_id = e.id
        JOIN trees t ON e.tree_id = t.id
        WHERE t.user_id = %s
        """,
        (user_id,),
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


async def postgres_media_delete(user_id: str, entry_id: str, media_id: str):
    async with db_cursor(commit=True) as cur:
        await cur.execute(
            """
            DELETE FROM entries_media
            WHERE id = %s
              AND entry_id = %s
              AND entry_id IN (
                SELECT e.id FROM entries e
                JOIN trees t ON e.tree_id = t.id
                WHERE t.user_id = %s
              )
            RETURNING url
            """,
            (media_id, entry_id, user_id),
        )
        return await cur.fetchone()


async def postgres_testimony_media_get_for_user(cur, user_id: str):
    await cur.execute(
        """
        SELECT id, user_id, media_type, url, label
        FROM testimony_media WHERE user_id = %s
        """,
        (user_id,),
    )
    return await cur.fetchall()


async def postgres_testimony_media_attach(user_id: str, item: MediaCreate):
    async with db_cursor(commit=True) as cur:
        await cur.execute("SELECT id FROM users WHERE id = %s", (user_id,))
        if await cur.fetchone() is None:
            return None

        await cur.execute(
            """
            INSERT INTO testimony_media (user_id, media_type, url, label)
            VALUES (%s, %s, %s, NULL)
            RETURNING id, user_id, media_type, url, label
            """,
            (user_id, item.media_type, item.url),
        )
        return await cur.fetchone()


async def postgres_testimony_media_delete(user_id: str, media_id: str):
    async with db_cursor(commit=True) as cur:
        await cur.execute(
            """
            DELETE FROM testimony_media
            WHERE id = %s AND user_id = %s
            RETURNING url
            """,
            (media_id, user_id),
        )
        return await cur.fetchone()
