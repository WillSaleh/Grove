from schemas.verse import VerseCreate
from scripts.generate_verse import retrieve_verse


async def postgres_verses_create_for_entry(cur, entry_id: str, verses: list[VerseCreate]):
    for verse in verses:
        verse_text = None
        if verse.verse_ref:
            try:
                verse_text = await retrieve_verse(verse.verse_ref)
            except ValueError:
                verse_text = None

        await cur.execute(
            """
            INSERT INTO entries_verses (entry_id, verse_ref, verse_text)
            VALUES (%s, %s, %s)
            """,
            (entry_id, verse.verse_ref, verse_text),
        )


async def postgres_verses_get_for_entry(cur, entry_id: str):
    await cur.execute(
        """
        SELECT id, entry_id, verse_ref, verse_text
        FROM entries_verses WHERE entry_id = %s
        """,
        (entry_id,),
    )
    return await cur.fetchall()
