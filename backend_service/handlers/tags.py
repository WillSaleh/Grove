from db.tags import (
    postgres_tag_create,
    postgres_tags_get_for_user,
    postgres_tag_delete,
)


async def tag_create(user_id: str, name: str):
    return await postgres_tag_create(user_id, name)

async def tags_collection_get(user_id: str):
    return await postgres_tags_get_for_user(user_id)

async def tag_delete(user_id: str, tag_id: str):
    return await postgres_tag_delete(user_id, tag_id)
