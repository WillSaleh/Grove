async def test_root_returns_welcome_message(client):
    response = await client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to your Grove"}
