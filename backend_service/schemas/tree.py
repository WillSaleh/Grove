from pydantic import BaseModel

from schemas.tree_node import EntryResponse

class TreeResponse(BaseModel):
    id: str
    user_id: str
    entries: list[EntryResponse]
