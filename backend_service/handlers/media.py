from db.media import postgres_media_attach_to_entry, postgres_media_delete
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
