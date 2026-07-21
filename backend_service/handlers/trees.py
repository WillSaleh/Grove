from db.trees import (
    postgres_tree_create,
    postgres_tree_resource_get,
    postgres_tree_delete,
)


# base tree handlers
async def tree_resource_get(user_id: str):
    return await postgres_tree_resource_get(user_id)

async def tree_resource_create(tree):
    return await postgres_tree_create(tree)

async def tree_resource_delete(tree_id: str):
    return await postgres_tree_delete(tree_id)
