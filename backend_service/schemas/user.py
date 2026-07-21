from datetime import date

from pydantic import BaseModel

from schemas.tree import TreeResponse


class UserCreate(BaseModel):
    username: str
    display_name: str


class UserResponse(BaseModel):
    id: str
    username: str
    display_name: str
    walking_since: date | None = None
    tree: TreeResponse
