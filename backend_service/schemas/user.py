from pydantic import BaseModel

class UserCreate(BaseModel):
    display_name: str

class UserResponse(BaseModel):
    id: str
    display_name: str
    tree_id: str