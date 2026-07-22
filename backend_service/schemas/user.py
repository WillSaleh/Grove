from datetime import date

from pydantic import BaseModel

from schemas.tree import TreeResponse


class UserCreate(BaseModel):
    username: str
    display_name: str
    walking_since: date | None = None


class UserResponse(BaseModel):
    id: str
    username: str
    display_name: str
    walking_since: date | None = None
    bio: str | None = None
    tree: TreeResponse


class BioUpdate(BaseModel):
    bio: str
