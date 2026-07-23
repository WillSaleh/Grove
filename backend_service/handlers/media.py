from db.media import (
    postgres_media_attach_to_entry,
    postgres_media_delete,
    postgres_testimony_media_attach,
    postgres_testimony_media_delete,
)
from storage import delete_upload


async def media_attach_to_entry(user_id: str, entry_id: str, item):
    return await postgres_media_attach_to_entry(user_id, entry_id, item)


async def media_delete(user_id: str, entry_id: str, media_id: str) -> bool:
    deleted = await postgres_media_delete(user_id, entry_id, media_id)
    if deleted is None:
        return False
    if deleted["url"]:
        delete_upload(deleted["url"])
    return True


async def testimony_media_attach(user_id: str, item):
    return await postgres_testimony_media_attach(user_id, item)


async def testimony_media_delete(user_id: str, media_id: str) -> bool:
    deleted = await postgres_testimony_media_delete(user_id, media_id)
    if deleted is None:
        return False
    if deleted["url"]:
        delete_upload(deleted["url"])
    return True
