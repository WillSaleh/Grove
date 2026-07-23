import os
import uuid

from fastapi import UploadFile

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")


async def save_upload(file: UploadFile) -> str:
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    ext = os.path.splitext(file.filename or "")[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, filename)

    contents = await file.read()
    with open(path, "wb") as f:
        f.write(contents)

    return f"/uploads/{filename}"


# Only removes files this server itself served under /uploads/ — media.url can also be an external
# URL (per API docs), and we must never touch those.
def delete_upload(url: str) -> None:
    if not url.startswith("/uploads/"):
        return
    path = os.path.join(UPLOAD_DIR, os.path.basename(url))
    if os.path.exists(path):
        os.remove(path)
