from datetime import date

from db import db_cursor
from db.trees import postgres_tree_create_for_user
from db.entries import postgres_entry_collection_get
from schemas.user import UserCreate


def _user_with_tree(row: dict, entries: list) -> dict:
    return {
        "id": row["id"],
        "username": row["username"],
        "display_name": row["display_name"],
        "walking_since": row["walking_since"],
        "bio": row["bio"],
        "tree": {
            "id": row["tree_id"],
            "user_id": row["tree_user_id"],
            "entries": entries,
        },
    }


async def postgres_user_resource_get(id: str):
    async with db_cursor() as cur:
        await cur.execute(
            """
            SELECT u.id, u.username, u.display_name, u.walking_since, u.bio,
                   t.id AS tree_id, t.user_id AS tree_user_id
            FROM users u
            INNER JOIN trees t ON t.user_id = u.id
            WHERE u.id = %s
            """,
            (id,),
        )
        row = await cur.fetchone()
        if row is None:
            return None

        entries = await postgres_entry_collection_get(id)
        return _user_with_tree(row, entries)


async def postgres_users_collection_get():
    async with db_cursor() as cur:
        await cur.execute(
            """
            SELECT u.id, u.username, u.display_name, u.walking_since, u.bio,
                   t.id AS tree_id, t.user_id AS tree_user_id
            FROM users u
            INNER JOIN trees t ON t.user_id = u.id
            """
        )
        rows = await cur.fetchall()

    users = []
    for row in rows:
        entries = await postgres_entry_collection_get(row["id"])
        users.append(_user_with_tree(row, entries))
    return users


async def postgres_user_resource_put(user: UserCreate):
    async with db_cursor(commit=True) as cur:
        await cur.execute(
            """
            INSERT INTO users (username, display_name, walking_since)
            VALUES (%s, %s, %s)
            RETURNING id, username, display_name, walking_since, bio
            """,
            (user.username, user.display_name, user.walking_since or date.today()),
        )
        row = await cur.fetchone()
        tree = await postgres_tree_create_for_user(cur, row["id"])
        tree["entries"] = []
        row["tree"] = tree
        return row


async def postgres_user_set_bio(user_id: str, bio: str):
    async with db_cursor(commit=True) as cur:
        await cur.execute(
            """
            UPDATE users SET bio = %s
            WHERE id = %s
            RETURNING id, username, display_name, walking_since, bio
            """,
            (bio, user_id),
        )
        row = await cur.fetchone()
        if row is None:
            return None

        await cur.execute(
            "SELECT id, user_id FROM trees WHERE user_id = %s",
            (user_id,),
        )
        tree_row = await cur.fetchone()
        row["tree_id"] = tree_row["id"]
        row["tree_user_id"] = tree_row["user_id"]

        entries = await postgres_entry_collection_get(user_id)
        return _user_with_tree(row, entries)


async def postgres_user_resource_delete(id: str):
    async with db_cursor(commit=True) as cur:
        # Cascades to trees and their entries via FK constraints.
        await cur.execute("DELETE FROM users WHERE id = %s", (id,))
