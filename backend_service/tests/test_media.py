async def test_upload_media_returns_url(client, created_upload_urls):
    response = await client.post(
        "/media/upload",
        files={"file": ("photo.jpg", b"fake-image-bytes", "image/jpeg")},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["url"].startswith("/uploads/")
    assert body["url"].endswith(".jpg")
    created_upload_urls.append(body["url"])


async def test_attach_media_to_entry(client, test_user, test_entry, created_upload_urls):
    upload_response = await client.post(
        "/media/upload",
        files={"file": ("attach.jpg", b"attach-bytes", "image/jpeg")},
    )
    assert upload_response.status_code == 201
    url = upload_response.json()["url"]
    created_upload_urls.append(url)

    attach_response = await client.post(
        f"/users/{test_user['id']}/entries/{test_entry['id']}/media",
        json={"media_type": "photo", "url": url},
    )

    assert attach_response.status_code == 201
    media = attach_response.json()
    assert media["entry_id"] == test_entry["id"]
    assert media["media_type"] == "photo"
    assert media["url"] == url

    get_response = await client.get(
        f"/users/{test_user['id']}/entries/{test_entry['id']}"
    )
    assert get_response.status_code == 200
    entry = get_response.json()
    assert any(item["url"] == url for item in entry["media"])


async def test_attach_media_to_missing_entry_returns_404(client, test_user):
    response = await client.post(
        f"/users/{test_user['id']}/entries/00000000-0000-0000-0000-000000000000/media",
        json={"media_type": "photo", "url": "https://example.com/photo.jpg"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Entry not found"
