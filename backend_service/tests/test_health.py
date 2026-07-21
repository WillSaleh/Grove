async def test_health_db_returns_ok(client):
    response = await client.get("/health/db")

    assert response.status_code == 200
    assert response.json() == {"db": "ok"}
