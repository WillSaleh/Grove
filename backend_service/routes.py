from fastapi import APIRouter

from db import get_connection
from handlers.users import (
user_resource_create, 
user_resource_get,
users_collection_get,
user_resource_delete
) 
from schemas.user import UserCreate


from handlers.trees import (
    tree_resource_create,
    tree_resource_get,
    tree_resource_delete,
    entry_resource_create,
    entry_resource_get,
    entry_collection_get,
    entry_resource_delete,
)
from schemas.tree import TreeCreate

from schemas.tree_node import EntryCreate


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

#tree endpoints
@router.post("/trees")
async def create_tree(tree: TreeCreate):
    return await tree_resource_create(tree)

@router.get("/users/{user_id}/tree")
async def get_tree(user_id: str):
    return await tree_resource_get(user_id)

@router.delete("/trees/{tree_id}")
async def delete_tree(tree_id: str):
    return await tree_resource_delete(tree_id)

#entry endpoints
@router.post("/entries")
async def create_entry(entry: EntryCreate):
    return await entry_resource_create(entry)

@router.get("/users/{user_id}/entries/{entry_id}")
async def get_entry(user_id: str, entry_id: str):
    return await entry_resource_get(user_id, entry_id)

@router.get("/users/{user_id}/entries")
async def list_entries(user_id: str):
    return await entry_collection_get(user_id)

@router.delete("/users/{user_id}/entries/{entry_id}")
async def delete_entry(user_id: str, entry_id: str):
    return await entry_resource_delete(user_id, entry_id)
