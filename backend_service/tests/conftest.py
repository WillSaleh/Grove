import os
import uuid
from collections.abc import AsyncIterator

import pytest
from httpx import ASGITransport, AsyncClient

from main import app
from storage import UPLOAD_DIR


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
