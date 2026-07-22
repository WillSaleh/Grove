from datetime import date

from db import db_cursor
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


async def postgres_prayer_set_answered(
    user_id: str, prayer_id: str, answered: bool, answer_note: str | None
):
    async with db_cursor(commit=True) as cur:
        await cur.execute(
            """
            UPDATE entries_prayers
            SET answered = %s, answered_at = %s, answer_note = %s
            WHERE id = %s
              AND entry_id IN (
                SELECT e.id FROM entries e
                JOIN trees t ON e.tree_id = t.id
                WHERE t.user_id = %s
              )
            RETURNING id, entry_id, prayer_text, answered, answered_at, answer_note
            """,
            (
                answered,
                date.today() if answered else None,
                answer_note,
                prayer_id,
                user_id,
            ),
        )
        return await cur.fetchone()
