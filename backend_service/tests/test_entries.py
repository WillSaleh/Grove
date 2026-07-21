async def _create_entry(client, user_id: str, tag: str = "leaf") -> dict:
    response = await client.post(
        "/entries",
        json={
            "user_id": user_id,
            "heading": "Test heading",
            "body": "Test body",
            "tag": tag,
            "category": "reflection",
            "is_praise": True,
            "is_encouragement": False,
            "prayers": [{"prayer_text": "Please guide me"}],
            "media": [{"media_type": "photo", "url": "https://example.com/photo.jpg"}],
        },
    )
    assert response.status_code == 201
    return response.json()


async def test_create_entry_returns_entry_with_children(client, test_user):
    entry = await _create_entry(client, test_user["id"])

    assert entry["heading"] == "Test heading"
    assert entry["body"] == "Test body"
    assert entry["tag"] == "leaf"
    assert entry["tree_id"] == test_user["tree"]["id"]
    assert len(entry["prayers"]) == 1
    assert entry["prayers"][0]["prayer_text"] == "Please guide me"
    assert len(entry["media"]) == 1
    assert entry["media"][0]["media_type"] == "photo"


async def test_get_entry_returns_created_entry(client, test_user):
    created = await _create_entry(client, test_user["id"], tag="milestone")

    response = await client.get(
        f"/users/{test_user['id']}/entries/{created['id']}"
    )

    assert response.status_code == 200
    entry = response.json()
    assert entry["id"] == created["id"]
    assert entry["tag"] == "milestone"


async def test_get_entry_not_found_returns_404(client, test_user):
    response = await client.get(
        f"/users/{test_user['id']}/entries/00000000-0000-0000-0000-000000000000"
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Entry not found"


async def test_list_entries_includes_created_entry(client, test_user):
    created = await _create_entry(client, test_user["id"], tag="root")

    response = await client.get(f"/users/{test_user['id']}/entries")

    assert response.status_code == 200
    entries = response.json()
    assert any(entry["id"] == created["id"] for entry in entries)


async def test_create_entry_for_unknown_user_returns_404(client):
    response = await client.post(
        "/entries",
        json={
            "user_id": "00000000-0000-0000-0000-000000000000",
            "heading": "Missing user",
            "body": "Should not persist",
            "tag": "leaf",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "User or tree not found"


async def test_delete_entry_removes_entry(client, test_user):
    created = await _create_entry(client, test_user["id"])

    delete_response = await client.delete(
        f"/users/{test_user['id']}/entries/{created['id']}"
    )
    assert delete_response.status_code == 204

    get_response = await client.get(
        f"/users/{test_user['id']}/entries/{created['id']}"
    )
    assert get_response.status_code == 404
