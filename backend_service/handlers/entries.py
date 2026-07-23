from schemas.prayer import PrayerCreate
from schemas.tree_node import EntryCreate, EntryUpdate, PrayerEntryCreate, VerseEntryCreate
from schemas.verse import VerseCreate

from db.entries import (
    postgres_entry_create,
    postgres_entry_resource_get,
    postgres_entry_collection_get,
    postgres_entry_resource_delete,
    postgres_entry_set_hearted,
    postgres_entry_update,
    postgres_prayer_entry_create,
    postgres_verse_entry_create,
)
from db.prayers import postgres_prayer_entry_update
from db.verses import postgres_verse_entry_update


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

async def entry_resource_update(user_id: str, entry_id: str, updates: EntryUpdate):
    return await postgres_entry_update(user_id, entry_id, updates)

async def verse_entry_resource_create(verse_entry: VerseEntryCreate):
    return await postgres_verse_entry_create(verse_entry)


async def prayer_entry_resource_create(prayer_entry: PrayerEntryCreate):
    return await postgres_prayer_entry_create(prayer_entry)

async def verse_entry_resource_update(user_id: str, entry_id: str, verse: VerseCreate):
    return await postgres_verse_entry_update(user_id, entry_id, verse)

async def prayer_entry_resource_update(user_id: str, entry_id: str, prayer: PrayerCreate):
    return await postgres_prayer_entry_update(user_id, entry_id, prayer)