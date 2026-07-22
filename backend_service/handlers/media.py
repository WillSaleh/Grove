from db.media import postgres_media_attach_to_entry


async def media_attach_to_entry(user_id: str, entry_id: str, item):
    return await postgres_media_attach_to_entry(user_id, entry_id, item)
