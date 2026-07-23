from fastapi import APIRouter, File, HTTPException, UploadFile

from db import get_connection
from handlers.users import (
    user_resource_create,
    user_resource_get,
    user_resource_get_by_username,
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
    entry_resource_update,
    prayer_entry_resource_create,
    prayer_entry_resource_update,
    verse_entry_resource_create,
    verse_entry_resource_update,
)
from handlers.tags import (
    tag_create,
    tags_collection_get,
    tag_delete,
)
from handlers.media import media_attach_to_entry, media_delete, testimony_media_attach, testimony_media_delete
from handlers.prayers import prayer_resource_set_answered
from schemas.user import UserCreate, UserResponse, BioUpdate
from schemas.tree_node import (
    EntryCreate,
    EntryResponse,
    EntryUpdate,
    PrayerEntryCreate,
    PrayerEntryResponse,
    VerseEntryCreate,
    VerseEntryResponse,
)
from schemas.tag import TagCreate, TagResponse
from schemas.media import MediaCreate, MediaResponse, MediaUploadResponse, TestimonyMediaResponse
from schemas.prayer import PrayerAnsweredUpdate, PrayerCreate, PrayerResponse
from schemas.verse import VerseCreate
from storage import save_upload

from scripts.generate_VOTD import get_votd

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


@router.get("/users/by-username/{username}", response_model=UserResponse)
async def get_user_by_username(username: str):
    user = await user_resource_get_by_username(username.strip())
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/users/{id}", response_model=UserResponse)
async def get_user(id: str):
    user = await user_resource_get(id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/users", response_model=UserResponse, status_code=201)
async def create_user(user: UserCreate):
    created = await user_resource_create(user)
    if created is None:
        raise HTTPException(status_code=409, detail="Username already taken")
    return created


@router.delete("/users/{id}", status_code=204)
async def delete_user(id: str):
    await user_resource_delete(id)


@router.put("/users/{id}/bio", response_model=UserResponse)
async def set_user_bio(id: str, body: BioUpdate):
    user = await user_resource_set_bio(id, body.bio)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post(
    "/users/{user_id}/testimony/media",
    response_model=TestimonyMediaResponse,
    status_code=201,
)
async def attach_testimony_media(user_id: str, media: MediaCreate):
    attached = await testimony_media_attach(user_id, media)
    if attached is None:
        raise HTTPException(status_code=404, detail="User not found")
    return attached


@router.delete("/users/{user_id}/testimony/media/{media_id}", status_code=204)
async def delete_testimony_media(user_id: str, media_id: str):
    deleted = await testimony_media_delete(user_id, media_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Media not found")


EntryOrStandaloneResponse = EntryResponse | VerseEntryResponse | PrayerEntryResponse


@router.post("/entries", response_model=EntryResponse, status_code=201)
async def create_entry(entry: EntryCreate):
    created = await entry_resource_create(entry)
    if created is None:
        raise HTTPException(status_code=404, detail="User or tree not found")
    return created

@router.post("/entries/verse", response_model=VerseEntryResponse, status_code=201)
async def create_verse_entry(entry: VerseEntryCreate):
    created = await verse_entry_resource_create(entry)
    if created is None:
        raise HTTPException(status_code=404, detail="User or tree not found")
    return created


@router.post("/entries/prayer", response_model=PrayerEntryResponse, status_code=201)
async def create_prayer_entry(entry: PrayerEntryCreate):
    created = await prayer_entry_resource_create(entry)
    if created is None:
        raise HTTPException(status_code=404, detail="User or tree not found")
    return created


@router.get("/users/{user_id}/entries/{entry_id}", response_model=EntryOrStandaloneResponse)
async def get_entry(user_id: str, entry_id: str):
    entry = await entry_resource_get(user_id, entry_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry


@router.get("/users/{user_id}/entries", response_model=list[EntryOrStandaloneResponse])
async def list_entries(user_id: str):
    return await entry_collection_get(user_id)


@router.delete("/users/{user_id}/entries/{entry_id}", status_code=204)
async def delete_entry(user_id: str, entry_id: str):
    await entry_resource_delete(user_id, entry_id)


@router.put("/users/{user_id}/entries/{entry_id}/heart", response_model=EntryOrStandaloneResponse)
async def set_entry_hearted(user_id: str, entry_id: str, hearted: bool):
    entry = await entry_resource_set_hearted(user_id, entry_id, hearted)
    if entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry


@router.put("/users/{user_id}/entries/{entry_id}", response_model=EntryOrStandaloneResponse)
async def update_entry(user_id: str, entry_id: str, updates: EntryUpdate):
    entry = await entry_resource_update(user_id, entry_id, updates)
    if entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry


@router.put("/users/{user_id}/entries/{entry_id}/verse", response_model=VerseEntryResponse)
async def update_verse_entry(user_id: str, entry_id: str, verse: VerseCreate):
    entry = await verse_entry_resource_update(user_id, entry_id, verse)
    if entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry


@router.put("/users/{user_id}/entries/{entry_id}/prayer", response_model=PrayerEntryResponse)
async def update_prayer_entry(user_id: str, entry_id: str, prayer: PrayerCreate):
    entry = await prayer_entry_resource_update(user_id, entry_id, prayer)
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
    deleted = await tag_delete(user_id, tag_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Tag not found")


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


@router.delete("/users/{user_id}/entries/{entry_id}/media/{media_id}", status_code=204)
async def delete_media(user_id: str, entry_id: str, media_id: str):
    deleted = await media_delete(user_id, entry_id, media_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Media not found")


@router.put("/users/{user_id}/prayers/{prayer_id}/answered", response_model=PrayerResponse)
async def set_prayer_answered(user_id: str, prayer_id: str, body: PrayerAnsweredUpdate):
    prayer = await prayer_resource_set_answered(
        user_id, prayer_id, body.answered, body.answer_note
    )
    if prayer is None:
        raise HTTPException(status_code=404, detail="Prayer not found")
    return prayer

@router.get("/verse_of_the_day")
async def get_verse_of_the_day():
    return await get_votd()


@router.get("/verse")
async def get_verse(verse_ref: str):
    from scripts.generate_verse import _disect_verse_ref, retrieve_verse

    try:
        verse_text = await retrieve_verse(verse_ref)
        parts = await _disect_verse_ref(verse_ref)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    return {
        "verse_ref": verse_ref.strip(),
        "verse_text": verse_text,
        "translation": parts["version"],
    }