from schemas.verse import VerseCreate
from scripts.generate_verse import _disect_verse_ref, retrieve_verse


async def postgres_verses_create_for_entry(cur, entry_id: str, verses: list[VerseCreate]):
    for verse in verses:
        verse_text = None
        translation = None
        if verse.verse_ref:
            try:
                verse_text = await retrieve_verse(verse.verse_ref)
                translation = (await _disect_verse_ref(verse.verse_ref))["version"]
            except ValueError:
                verse_text = None
                translation = None

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
