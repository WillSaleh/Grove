from db.users import (
     postgres_user_resource_get, 
     postgres_user_resource_put,
     postgres_users_collection_get,
     postgres_user_resource_delete,
)
from schemas.user import UserCreate

async def user_resource_get(id: str):
    return await postgres_user_resource_get(id)

async def users_collection_get():
    return await postgres_users_collection_get()

async def user_resource_create(user: UserCreate):
    return await postgres_user_resource_put(user)

async def user_resource_delete(id: str):
    return await postgres_user_resource_delete(id)