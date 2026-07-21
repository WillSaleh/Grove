from psycopg.rows import dict_row

from db import get_connection
from schemas.tree import TreeCreate

async def postgres_tree_create(tree: TreeCreate):
    async with await get_connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                """
                INSERT INTO trees (user_id)
                VALUES (%s)
                RETURNING id, user_id
                """,
                (tree.user_id,),
            )
            row = await cur.fetchone()
            await conn.commit()
            return row
        
async def postgres_tree_resource_get(user_id: str):
    async with await get_connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "SELECT id, user_id FROM trees where user_id = %s",
                (user_id,),
            )
            return await cur.fetchone()
        
async def postgres_tree_delete(tree_id: str):
    async with await get_connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute("DELETE FROM trees WHERE id = %s", (tree_id,))
            await conn.commit()