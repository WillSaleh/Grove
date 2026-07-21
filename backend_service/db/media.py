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
