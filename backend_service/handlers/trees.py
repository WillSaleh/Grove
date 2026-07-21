from db.trees import (
postgres_tree_create, 
postgres_tree_resource_get,
postgres_tree_delete,
)

from db.entries import (
     postgres_entry_create,
     postgres_entry_resource_get,
     postgres_entry_collection_get,
     postgres_entry_resource_delete,
)

# base tree handlers
async def tree_resource_get(user_id: str):
    return await postgres_tree_resource_get(user_id)

async def tree_resource_create(tree):
    return await postgres_tree_create(tree)

async def tree_resource_delete(tree_id: str):
    return await postgres_tree_delete(tree_id)


# entry handlers
async def entry_resource_create(entry):
    return await postgres_entry_create(entry)


async def entry_resource_get(user_id: str, entry_id: str):
    return await postgres_entry_resource_get(user_id, entry_id)

async def entry_collection_get(user_id: str):
    return await postgres_entry_collection_get(user_id)

async def entry_resource_delete(user_id: str, entry_id: str):
    return await postgres_entry_resource_delete(user_id, entry_id)

