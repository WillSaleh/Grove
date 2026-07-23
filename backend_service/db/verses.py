from db import db_cursor
from schemas.verse import VerseCreate
from scripts.generate_verse import _disect_verse_ref, retrieve_verse


async def _resolve_verse_text_and_translation(verse_ref: str | None) -> tuple[str | None, str | None]:
    if not verse_ref:
        return None, None
    try:
        verse_text = await retrieve_verse(verse_ref)
        translation = (await _disect_verse_ref(verse_ref))["version"]
        return verse_text, translation
    except ValueError:
        return None, None


async def postgres_verses_create_for_entry(cur, entry_id: str, verses: list[VerseCreate]):
    for verse in verses:
        verse_text, translation = await _resolve_verse_text_and_translation(verse.verse_ref)
        await cur.execute(
            """
            INSERT INTO entries_verses (entry_id, verse_ref, verse_text, translation, note)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (entry_id, verse.verse_ref, verse_text, translation, verse.note),
        )


async def postgres_verses_get_for_entry(cur, entry_id: str):
    await cur.execute(
        """
        SELECT id, entry_id, verse_ref, verse_text, translation, note
        FROM entries_verses WHERE entry_id = %s
        """,
        (entry_id,),
    )
    return await cur.fetchall()


async def postgres_verse_entry_update(user_id: str, entry_id: str, verse: VerseCreate):
    verse_text, translation = await _resolve_verse_text_and_translation(verse.verse_ref)

    async with db_cursor(commit=True) as cur:
        await cur.execute(
            """
            SELECT e.id, e.tree_id, e.entry_date, e.is_hearted
            FROM entries e
            JOIN trees t ON e.tree_id = t.id
            WHERE e.id = %s AND e.tag = 'verse' AND t.user_id = %s
            """,
            (entry_id, user_id),
        )
        entry = await cur.fetchone()
        if entry is None:
            return None

        await cur.execute(
            """
            UPDATE entries_verses
            SET verse_ref = %s, verse_text = %s, translation = %s, note = %s
            WHERE entry_id = %s
            RETURNING id, entry_id, verse_ref, verse_text, translation, note
            """,
            (verse.verse_ref, verse_text, translation, verse.note, entry_id),
        )
        entry["verse"] = await cur.fetchone()
        entry["tag"] = "verse"
        return entry
