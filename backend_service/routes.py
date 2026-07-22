from fastapi import APIRouter, File, HTTPException, UploadFile

from db import get_connection
from handlers.users import (
    user_resource_create,
    user_resource_get,
    users_collection_get,
    user_resource_delete,
    user_resource_set_bio,
)
from handlers.entries import (
    entry_resource_create,
    entry_resource_get,
    entry_collection_get,
    entry_resource_delete,
    entry_resource_set_hearted,
)
from handlers.tags import (
    tag_create,
    tags_collection_get,
    tag_delete,
)
from handlers.media import media_attach_to_entry
from schemas.user import UserCreate, UserResponse, BioUpdate
from schemas.tree_node import EntryCreate, EntryResponse
from schemas.tag import TagCreate, TagResponse
from schemas.media import MediaCreate, MediaResponse, MediaUploadResponse
from storage import save_upload


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


@router.put("/users/{id}/bio", response_model=UserResponse)
async def set_user_bio(id: str, body: BioUpdate):
    user = await user_resource_set_bio(id, body.bio)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


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


@router.put("/users/{user_id}/entries/{entry_id}/heart", response_model=EntryResponse)
async def set_entry_hearted(user_id: str, entry_id: str, hearted: bool):
    entry = await entry_resource_set_hearted(user_id, entry_id, hearted)
    if entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry


@router.get("/users/{user_id}/tags", response_model=list[TagResponse])
async def list_tags(user_id: str):
    return await tags_collection_get(user_id)


@router.post("/users/{user_id}/tags", response_model=TagResponse, status_code=201)
async def create_tag(user_id: str, tag: TagCreate):
    return await tag_create(user_id, tag.name)


@router.delete("/users/{user_id}/tags/{tag_id}", status_code=204)
async def delete_tag(user_id: str, tag_id: str):
    await tag_delete(user_id, tag_id)


@router.post("/media/upload", response_model=MediaUploadResponse, status_code=201)
async def upload_media(file: UploadFile = File(...)):
    url = await save_upload(file)
    return {"url": url}


@router.post(
    "/users/{user_id}/entries/{entry_id}/media",
    response_model=MediaResponse,
    status_code=201,
)
async def attach_media(user_id: str, entry_id: str, media: MediaCreate):
    attached = await media_attach_to_entry(user_id, entry_id, media)
    if attached is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    return attached
