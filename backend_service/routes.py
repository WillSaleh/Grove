from fastapi import APIRouter

from db import get_connection

router = APIRouter(prefix="")


@router.get("/health/db")
async def health_db():
    async with await get_connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT 1")
            await cur.fetchone()
    return {"db": "ok"}


# basic user endpoints
