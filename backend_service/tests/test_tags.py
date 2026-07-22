from tests.conftest import unique_username


async def test_list_tags_includes_presets(client, test_user):
    response = await client.get(f"/users/{test_user['id']}/tags")

    assert response.status_code == 200
    tags = response.json()
    assert len(tags) >= 1
    assert any(tag["user_id"] is None for tag in tags)


async def test_create_custom_tag(client, test_user):
    response = await client.post(
        f"/users/{test_user['id']}/tags",
        json={"name": unique_username("custom_tag")},
    )

    assert response.status_code == 201
    tag = response.json()
    assert tag["user_id"] == test_user["id"]
    assert tag["name"].startswith("custom_tag_")


async def test_delete_custom_tag_removes_tag(client, test_user):
    create_response = await client.post(
        f"/users/{test_user['id']}/tags",
        json={"name": unique_username("delete_tag")},
    )
    assert create_response.status_code == 201
    tag_id = create_response.json()["id"]

    delete_response = await client.delete(
        f"/users/{test_user['id']}/tags/{tag_id}"
    )
    assert delete_response.status_code == 204

    list_response = await client.get(f"/users/{test_user['id']}/tags")
    assert list_response.status_code == 200
    tags = list_response.json()
    assert not any(tag["id"] == tag_id for tag in tags)


async def test_delete_preset_tag_returns_404(client, test_user):
    list_response = await client.get(f"/users/{test_user['id']}/tags")
    assert list_response.status_code == 200
    preset = next(tag for tag in list_response.json() if tag["user_id"] is None)

    delete_response = await client.delete(
        f"/users/{test_user['id']}/tags/{preset['id']}"
    )

    assert delete_response.status_code == 404
    assert delete_response.json()["detail"] == "Tag not found"


async def test_create_entry_with_tag_id_returns_entry_tag(client, test_user):
    tag_response = await client.post(
        f"/users/{test_user['id']}/tags",
        json={"name": unique_username("entry_tag")},
    )
    assert tag_response.status_code == 201
    tag = tag_response.json()

    entry_response = await client.post(
        "/entries",
        json={
            "user_id": test_user["id"],
            "heading": "Tagged entry",
            "body": "Entry body",
            "tag": "leaf",
            "tag_id": tag["id"],
        },
    )

    assert entry_response.status_code == 201
    entry = entry_response.json()
    assert entry["entry_tag"] == tag
