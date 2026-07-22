from pydantic import BaseModel

from schemas.tree_node import EntryResponse, VerseEntryResponse

class TreeResponse(BaseModel):
    id: str
    user_id: str
    entries: list[EntryResponse | VerseEntryResponse]
