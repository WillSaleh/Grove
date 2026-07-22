from schemas.tree_node import EntryCreate, PrayerEntryCreate, VerseEntryCreate

from db.entries import (
    postgres_entry_create,
    postgres_entry_resource_get,
    postgres_entry_collection_get,
    postgres_entry_resource_delete,
    postgres_entry_set_hearted,
)


# entry handlers
async def entry_resource_create(entry: EntryCreate):
    return await postgres_entry_create(entry)

async def entry_resource_get(user_id: str, entry_id: str):
    return await postgres_entry_resource_get(user_id, entry_id)

async def entry_collection_get(user_id: str):
    return await postgres_entry_collection_get(user_id)

async def entry_resource_delete(user_id: str, entry_id: str):
    return await postgres_entry_resource_delete(user_id, entry_id)

async def entry_resource_set_hearted(user_id: str, entry_id: str, hearted: bool):
    return await postgres_entry_set_hearted(user_id, entry_id, hearted)

async def verse_entry_resource_create(verse_entry: VerseEntryCreate):
    entry = EntryCreate(
        user_id=verse_entry.user_id,
        heading="",
        body="",
        tag="verse",
        verses=[verse_entry.verse],
    )
    return await postgres_entry_create(entry)


async def prayer_entry_resource_create(prayer_entry: PrayerEntryCreate):
    entry = EntryCreate(
        user_id=prayer_entry.user_id,
        heading="",
        body="",
        tag="prayer",
        prayers=[prayer_entry.prayer],
    )
    return await postgres_entry_create(entry)