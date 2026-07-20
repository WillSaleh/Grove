from fastapi import APIRouter

from db import get_connection

router = APIRouter(prefix="")


@router.get("/health/db")
def health_db():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1")
            cur.fetchone()
    return {"db": "ok"}


# basic user endpoints
