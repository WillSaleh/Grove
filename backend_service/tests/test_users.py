from tests.conftest import unique_username


async def test_create_user_returns_user_with_tree(client, created_user_ids):
    username = unique_username("create_user")
    response = await client.post(
        "/users",
        json={"username": username, "display_name": "New User"},
    )

    assert response.status_code == 201
    user = response.json()
    created_user_ids.append(user["id"])

    assert user["username"] == username
    assert user["display_name"] == "New User"
    assert user["walking_since"] is not None
    assert user["tree"]["user_id"] == user["id"]
    assert user["tree"]["entries"] == []


async def test_get_user_returns_created_user(client, test_user):
    response = await client.get(f"/users/{test_user['id']}")

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == test_user["id"]
    assert body["username"] == test_user["username"]
    assert body["tree"]["id"] == test_user["tree"]["id"]


async def test_get_user_not_found_returns_404(client):
    response = await client.get(
        f"/users/00000000-0000-0000-0000-000000000000"
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


async def test_list_users_includes_created_user(client, test_user):
    response = await client.get("/users")

    assert response.status_code == 200
    users = response.json()
    assert any(user["id"] == test_user["id"] for user in users)


async def test_delete_user_removes_user(client, created_user_ids):
    create_response = await client.post(
        "/users",
        json={
            "username": unique_username("delete_user"),
            "display_name": "Delete Me",
        },
    )
    assert create_response.status_code == 201
    user_id = create_response.json()["id"]

    delete_response = await client.delete(f"/users/{user_id}")
    assert delete_response.status_code == 204

    get_response = await client.get(f"/users/{user_id}")
    assert get_response.status_code == 404
