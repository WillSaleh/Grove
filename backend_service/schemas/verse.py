from pydantic import BaseModel


class VerseCreate(BaseModel):
    verse_ref: str | None = None
    note: str | None = None

class VerseResponse(BaseModel):
    id: str
    entry_id: str
    verse_ref: str | None = None
    verse_text: str | None = None
    translation: str | None = None
    note: str | None = None
