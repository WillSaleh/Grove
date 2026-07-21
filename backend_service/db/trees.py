async def postgres_tree_id_for_user(cur, user_id: str) -> str | None:
    await cur.execute(
        "SELECT id FROM trees WHERE user_id = %s",
        (user_id,),
    )
    row = await cur.fetchone()
    return row["id"] if row else None


async def postgres_tree_create_for_user(cur, user_id: str):
    await cur.execute(
        """
        INSERT INTO trees (user_id)
        VALUES (%s)
        RETURNING id, user_id
        """,
        (user_id,),
    )
    return await cur.fetchone()