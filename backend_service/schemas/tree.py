from pydantic import BaseModel


class TreeCreate(BaseModel):
    user_id: str


class TreeResponse(BaseModel):
    id: str
    user_id: str
