from pydantic import BaseModel

class VerseCreate(BaseModel):
    verse_ref: str

class verseResponse(BaseModel):
    id: str
    verse_ref: str
    verse_text: str
    node_id: str