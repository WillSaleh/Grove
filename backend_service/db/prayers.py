from schemas.prayer import PrayerCreate


async def postgres_prayers_create_for_entry(cur, entry_id: str, prayers: list[PrayerCreate]):
    for prayer in prayers:
        await cur.execute(
            """
            INSERT INTO entries_prayers (entry_id, prayer_text, answered, answered_at, answer_note)
            VALUES (%s, %s, false, NULL, NULL)
            """,
            (entry_id, prayer.prayer_text),
        )


async def postgres_prayers_get_for_entry(cur, entry_id: str):
    await cur.execute(
        """
        SELECT id, entry_id, prayer_text, answered, answered_at, answer_note
        FROM entries_prayers WHERE entry_id = %s
        """,
        (entry_id,),
    )
    return await cur.fetchall()
