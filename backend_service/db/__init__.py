import os
from contextlib import asynccontextmanager

import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row
from psycopg.types.string import TextLoader

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]

# Response schemas declare UUID columns as `str`; load them as plain
# strings instead of uuid.UUID so they pass FastAPI response validation.
psycopg.adapters.register_loader("uuid", TextLoader)


async def get_connection() -> psycopg.AsyncConnection:
    return await psycopg.AsyncConnection.connect(DATABASE_URL)


@asynccontextmanager
async def db_cursor(*, commit: bool = False):
    async with await get_connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            yield cur
            if commit:
                await conn.commit()
