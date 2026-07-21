from fastapi import APIRouter

from db import get_connection
from handlers.users import (
user_resource_create, 
user_resource_get,
users_collection_get,
user_resource_delete
)
from schemas.user import UserCreate

router = APIRouter(prefix="")


@router.get("/health/db")
async def health_db():
    async with await get_connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT 1")
            await cur.fetchone()
    return {"db": "ok"}


# basic user endpoints
@router.get("/users")
async def list_users():
    return await users_collection_get()

@router.get("/users/{id}")
async def get_user(id: str):
    return await user_resource_get(id)

@router.post("/users")
async def create_user(user: UserCreate):
    return await user_resource_create(user)

@router.delete("/users/{id}")
async def delete_user(id: str):
    return await user_resource_delete(id)
