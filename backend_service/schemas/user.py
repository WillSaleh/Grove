from datetime import date

from pydantic import BaseModel


class UserCreate(BaseModel):
    username: str
    display_name: str


class UserResponse(BaseModel):
    id: str
    display_name: str
    walking_since: date | None = None
