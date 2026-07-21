import uuid
from collections.abc import AsyncIterator

import pytest
from httpx import ASGITransport, AsyncClient

from main import app


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


def unique_username(prefix: str = "test") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


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
