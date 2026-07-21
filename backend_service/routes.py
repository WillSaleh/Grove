from fastapi import APIRouter, HTTPException

from db import get_connection
from handlers.users import (
    user_resource_create,
    user_resource_get,
    users_collection_get,
    user_resource_delete,
)
from handlers.entries import (
    entry_resource_create,
    entry_resource_get,
    entry_collection_get,
    entry_resource_delete,
)
from schemas.user import UserCreate, UserResponse
from schemas.tree_node import EntryCreate, EntryResponse


router = APIRouter(prefix="")


@router.get("/health/db")
async def health_db():
    async with await get_connection() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT 1")
            await cur.fetchone()
    return {"db": "ok"}


@router.get("/users", response_model=list[UserResponse])
async def list_users():
    return await users_collection_get()


@router.get("/users/{id}", response_model=UserResponse)
async def get_user(id: str):
    user = await user_resource_get(id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/users", response_model=UserResponse, status_code=201)
async def create_user(user: UserCreate):
    return await user_resource_create(user)


@router.delete("/users/{id}", status_code=204)
async def delete_user(id: str):
    await user_resource_delete(id)


@router.post("/entries", response_model=EntryResponse, status_code=201)
async def create_entry(entry: EntryCreate):
    created = await entry_resource_create(entry)
    if created is None:
        raise HTTPException(status_code=404, detail="User or tree not found")
    return created


@router.get("/users/{user_id}/entries/{entry_id}", response_model=EntryResponse)
async def get_entry(user_id: str, entry_id: str):
    entry = await entry_resource_get(user_id, entry_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry


@router.get("/users/{user_id}/entries", response_model=list[EntryResponse])
async def list_entries(user_id: str):
    return await entry_collection_get(user_id)


@router.delete("/users/{user_id}/entries/{entry_id}", status_code=204)
async def delete_entry(user_id: str, entry_id: str):
    await entry_resource_delete(user_id, entry_id)
