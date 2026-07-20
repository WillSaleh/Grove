from pydantic import BaseModel


class MediaCreate(BaseModel):
    media_type: str
    url: str | None = None
    label: str | None = None


class MediaResponse(BaseModel):
    id: str
    entry_id: str
    media_type: str
    url: str | None = None
    label: str | None = None
