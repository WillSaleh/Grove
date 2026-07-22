from tests.conftest import (
    assert_entry_response,
    assert_verse_entry_response,
    create_entry,
    create_verse_entry,
)


async def _create_entry(client, user_id: str, tag: str = "leaf") -> dict:
    return await create_entry(
        client,
        user_id,
        tag=tag,
        category="reflection",
        is_praise=True,
        is_encouragement=False,
        prayers=[{"prayer_text": "Please guide me"}],
        media=[{"media_type": "photo", "url": "https://example.com/photo.jpg"}],
    )


async def test_create_entry_returns_entry_with_children(client, test_user):
    entry = await _create_entry(client, test_user["id"])

    assert_entry_response(entry)
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
    assert_entry_response(entry)
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
    match = next(entry for entry in entries if entry["id"] == created["id"])
    assert_entry_response(match)


async def test_list_entries_returns_mixed_entry_shapes(client, test_user):
    leaf = await _create_entry(client, test_user["id"], tag="leaf")
    verse = await create_verse_entry(client, test_user["id"])

    response = await client.get(f"/users/{test_user['id']}/entries")

    assert response.status_code == 200
    entries = {entry["id"]: entry for entry in response.json()}
    assert_entry_response(entries[leaf["id"]])
    assert_verse_entry_response(entries[verse["id"]])


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


async def test_create_prayer_tagged_entry_persists_prayer(client, test_user):
    entry = await create_entry(
        client,
        test_user["id"],
        tag="prayer",
        heading="Standalone prayer",
        body="Prayer body",
        prayers=[{"prayer_text": "Lord, hear my prayer"}],
    )

    assert_entry_response(entry)
    assert entry["tag"] == "prayer"
    assert len(entry["prayers"]) == 1
    assert entry["prayers"][0]["prayer_text"] == "Lord, hear my prayer"


async def test_create_verse_tagged_entry_returns_verse_entry_response(client, test_user):
    entry = await create_entry(
        client,
        test_user["id"],
        tag="verse",
        heading="Standalone verse",
        body="Verse body",
        verses=[{"verse_ref": "JHN 3:16 NIV"}],
    )

    assert_verse_entry_response(entry)
    assert entry["verse"]["verse_ref"] == "JHN 3:16 NIV"
    assert entry["verse"]["verse_text"] == "Text for JHN 3:16 NIV"


async def test_create_verse_entry_endpoint_returns_verse_entry_response(client, test_user):
    entry = await create_verse_entry(client, test_user["id"], verse_ref="GEN 1:1 NIV")

    assert_verse_entry_response(entry)
    assert entry["tree_id"] == test_user["tree"]["id"]
    assert entry["verse"]["verse_ref"] == "GEN 1:1 NIV"
    assert entry["verse"]["verse_text"] == "Text for GEN 1:1 NIV"


async def test_get_verse_entry_returns_verse_entry_response(client, test_user):
    created = await create_verse_entry(client, test_user["id"])

    response = await client.get(
        f"/users/{test_user['id']}/entries/{created['id']}"
    )

    assert response.status_code == 200
    assert_verse_entry_response(response.json())


async def test_set_verse_entry_hearted_returns_verse_entry_response(client, test_user):
    created = await create_verse_entry(client, test_user["id"])

    response = await client.put(
        f"/users/{test_user['id']}/entries/{created['id']}/heart",
        params={"hearted": True},
    )

    assert response.status_code == 200
    entry = response.json()
    assert_verse_entry_response(entry)
    assert entry["is_hearted"] is True


async def test_user_tree_includes_verse_entry_response(client, test_user):
    verse = await create_verse_entry(client, test_user["id"])

    response = await client.get(f"/users/{test_user['id']}")

    assert response.status_code == 200
    entries = {entry["id"]: entry for entry in response.json()["tree"]["entries"]}
    assert_verse_entry_response(entries[verse["id"]])


async def test_create_verse_entry_for_unknown_user_returns_404(client):
    response = await client.post(
        "/entries/verse",
        json={
            "user_id": "00000000-0000-0000-0000-000000000000",
            "verse": {"verse_ref": "JHN 3:16 NIV"},
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "User or tree not found"
