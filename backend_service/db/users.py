from datetime import date

import psycopg

from db import db_cursor
from db.trees import postgres_tree_create_for_user
from db.entries import postgres_entry_collection_get
from db.media import postgres_media_get_for_user, postgres_testimony_media_get_for_user
from schemas.user import UserCreate
from storage import delete_upload


def _user_with_tree(row: dict, entries: list, testimony_media: list) -> dict:
    return {
        "id": row["id"],
        "username": row["username"],
        "display_name": row["display_name"],
        "walking_since": row["walking_since"],
        "bio": row["bio"],
        "testimony_media": testimony_media,
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
        testimony_media = await postgres_testimony_media_get_for_user(cur, id)
        return _user_with_tree(row, entries, testimony_media)


async def postgres_user_get_by_username(username: str):
    async with db_cursor() as cur:
        await cur.execute(
            """
            SELECT u.id, u.username, u.display_name, u.walking_since, u.bio,
                   t.id AS tree_id, t.user_id AS tree_user_id
            FROM users u
            INNER JOIN trees t ON t.user_id = u.id
            WHERE u.username = %s
            """,
            (username,),
        )
        row = await cur.fetchone()
        if row is None:
            return None

        entries = await postgres_entry_collection_get(row["id"])
        testimony_media = await postgres_testimony_media_get_for_user(cur, row["id"])
        return _user_with_tree(row, entries, testimony_media)


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
            testimony_media = await postgres_testimony_media_get_for_user(cur, row["id"])
            users.append(_user_with_tree(row, entries, testimony_media))
        return users


async def postgres_user_resource_put(user: UserCreate):
    try:
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
            row["testimony_media"] = []
            return row
    except psycopg.errors.UniqueViolation:
        return None


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
        testimony_media = await postgres_testimony_media_get_for_user(cur, user_id)
        return _user_with_tree(row, entries, testimony_media)


async def postgres_user_resource_delete(id: str):
    async with db_cursor(commit=True) as cur:
        media_items = await postgres_media_get_for_user(cur, id)
        testimony_media_items = await postgres_testimony_media_get_for_user(cur, id)

        # Cascades to trees, entries, entries_media, and testimony_media rows via FK constraints —
        # but not the actual uploaded files on disk, so those are cleaned up separately below.
        await cur.execute("DELETE FROM users WHERE id = %s", (id,))

    for item in media_items + testimony_media_items:
        if item["url"]:
            delete_upload(item["url"])
