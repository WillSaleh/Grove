from db import db_cursor


async def postgres_tag_create(user_id: str, name: str):
    async with db_cursor(commit=True) as cur:
        await cur.execute(
            """
            INSERT INTO tags (name, user_id)
            VALUES (%s, %s)
            RETURNING id, name, user_id
            """,
            (name, user_id),
        )
        return await cur.fetchone()


async def postgres_tags_get_for_user(user_id: str):
    async with db_cursor() as cur:
        await cur.execute(
            "SELECT id, name, user_id FROM tags WHERE user_id IS NULL OR user_id = %s",
            (user_id,),
        )
        return await cur.fetchall()


async def postgres_tag_delete(user_id: str, tag_id: str) -> bool:
    async with db_cursor(commit=True) as cur:
        await cur.execute(
            "DELETE FROM tags WHERE id = %s AND user_id = %s",
            (tag_id, user_id),
        )
        return cur.rowcount > 0


async def postgres_tag_get_by_id(cur, tag_id: str):
    await cur.execute(
        "SELECT id, name, user_id FROM tags WHERE id = %s",
        (tag_id,),
    )
    return await cur.fetchone()
