import os
import uuid
from collections.abc import AsyncIterator
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient


def _load_database_url() -> None:
    if os.environ.get("DATABASE_URL"):
        return

    envrc = Path(__file__).resolve().parent.parent / ".envrc"
    if envrc.is_file():
        for line in envrc.read_text().splitlines():
            line = line.strip()
            if line.startswith("export DATABASE_URL="):
                os.environ["DATABASE_URL"] = line.removeprefix("export DATABASE_URL=")
                return

    pytest.fail(
        "DATABASE_URL is not set. Export it or add it to backend_service/.envrc "
        "before running integration tests."
    )


_load_database_url()

from main import app  # noqa: E402
from storage import UPLOAD_DIR  # noqa: E402

ENTRY_RESPONSE_KEYS = {
    "id",
    "tree_id",
    "heading",
    "body",
    "tag",
    "category",
    "entry_date",
    "is_praise",
    "is_encouragement",
    "is_hearted",
    "verses",
    "prayers",
    "media",
    "entry_tag",
}
VERSE_ENTRY_RESPONSE_KEYS = {
    "id",
    "tree_id",
    "tag",
    "entry_date",
    "is_hearted",
    "verse",
}
PRAYER_ENTRY_RESPONSE_KEYS = {
    "id",
    "tree_id",
    "tag",
    "entry_date",
    "is_hearted",
    "prayer",
}


@pytest.fixture(autouse=True)
def mock_retrieve_verse(monkeypatch: pytest.MonkeyPatch) -> None:
    async def fake_retrieve_verse(ref: str) -> str:
        return f"Text for {ref}"

    monkeypatch.setattr("db.verses.retrieve_verse", fake_retrieve_verse)


@pytest.fixture
async def client() -> AsyncIterator[AsyncClient]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as http_client:
        yield http_client


@pytest.fixture
async def created_user_ids(client: AsyncClient) -> AsyncIterator[list[str]]:
    user_ids: list[str] = []
    yield user_ids
    for user_id in reversed(user_ids):
        await client.delete(f"/users/{user_id}")


@pytest.fixture
async def created_upload_urls() -> AsyncIterator[list[str]]:
    urls: list[str] = []
    yield urls
    for url in reversed(urls):
        path = os.path.join(UPLOAD_DIR, os.path.basename(url))
        if os.path.isfile(path):
            os.remove(path)


def unique_username(prefix: str = "test") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def assert_entry_response(entry: dict) -> None:
    assert set(entry.keys()) == ENTRY_RESPONSE_KEYS
    assert "verse" not in entry
    assert "prayer" not in entry


def assert_verse_entry_response(entry: dict) -> None:
    assert set(entry.keys()) == VERSE_ENTRY_RESPONSE_KEYS
    assert entry["tag"] == "verse"
    assert entry["verse"]["entry_id"] == entry["id"]
    assert entry["verse"]["verse_ref"] is not None


def assert_prayer_entry_response(entry: dict) -> None:
    assert set(entry.keys()) == PRAYER_ENTRY_RESPONSE_KEYS
    assert entry["tag"] == "prayer"
    assert entry["prayer"]["entry_id"] == entry["id"]
    assert entry["prayer"]["prayer_text"] is not None


async def create_entry(
    client: AsyncClient,
    user_id: str,
    *,
    tag: str = "leaf",
    **extra_fields,
) -> dict:
    payload = {
        "user_id": user_id,
        "heading": "Test heading",
        "body": "Test body",
        "tag": tag,
        **extra_fields,
    }
    response = await client.post("/entries", json=payload)
    assert response.status_code == 201
    return response.json()


async def create_verse_entry(
    client: AsyncClient,
    user_id: str,
    *,
    verse_ref: str = "JHN 3:16 NIV",
) -> dict:
    response = await client.post(
        "/entries/verse",
        json={
            "user_id": user_id,
            "verse": {"verse_ref": verse_ref},
        },
    )
    assert response.status_code == 201
    return response.json()


async def create_prayer_entry(
    client: AsyncClient,
    user_id: str,
    *,
    prayer_text: str = "Lord, hear my prayer",
) -> dict:
    response = await client.post(
        "/entries/prayer",
        json={
            "user_id": user_id,
            "prayer": {"prayer_text": prayer_text},
        },
    )
    assert response.status_code == 201
    return response.json()


@pytest.fixture
async def test_user(client: AsyncClient, created_user_ids: list[str]) -> dict:
    response = await client.post(
        "/users",
        json={
            "username": unique_username(),
            "display_name": "Integration Test User",
        },
    )
    assert response.status_code == 201
    user = response.json()
    created_user_ids.append(user["id"])
    return user


@pytest.fixture
async def test_entry(client: AsyncClient, test_user: dict) -> dict:
    return await create_entry(client, test_user["id"])
