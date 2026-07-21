from db import db_cursor
from schemas.tree import TreeCreate


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


async def postgres_tree_create(tree: TreeCreate):
    async with db_cursor(commit=True) as cur:
        return await postgres_tree_create_for_user(cur, tree.user_id)

async def postgres_tree_resource_get(user_id: str):
    async with db_cursor() as cur:
        await cur.execute(
            "SELECT id, user_id FROM trees where user_id = %s",
            (user_id,),
        )
        return await cur.fetchone()

async def postgres_tree_delete(tree_id: str):
    async with db_cursor(commit=True) as cur:
        await cur.execute("DELETE FROM trees WHERE id = %s", (tree_id,))