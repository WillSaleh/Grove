import os
from contextlib import asynccontextmanager

import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]


async def get_connection() -> psycopg.AsyncConnection:
    return await psycopg.AsyncConnection.connect(DATABASE_URL)


@asynccontextmanager
async def db_cursor(*, commit: bool = False):
    async with await get_connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            yield cur
            if commit:
                await conn.commit()
