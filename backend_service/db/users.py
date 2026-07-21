from datetime import date

from psycopg.rows import dict_row

from db import get_connection
from schemas.user import UserCreate


async def postgres_user_resource_get(id: str):
    async with await get_connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "SELECT id, username, display_name, walking_since FROM users WHERE id = %s",
                (id,),
            )
            return await cur.fetchone()


async def postgres_users_collection_get():
    async with await get_connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute("SELECT id, username, display_name, walking_since FROM users")
            return await cur.fetchall()


async def postgres_user_resource_put(user: UserCreate):
    async with await get_connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                """
                INSERT INTO users (username, display_name, walking_since)
                VALUES (%s, %s, %s)
                RETURNING id, username, display_name, walking_since
                """,
                (user.username, user.display_name, date.today()),
            )
            row = await cur.fetchone()
            await conn.commit()
            return row
        
async def postgres_user_resource_delete(id: str):
    async with await get_connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute("DELETE FROM users WHERE id = %s", (id,))
            await conn.commit()