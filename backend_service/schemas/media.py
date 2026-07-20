from pydantic import BaseModel

class MediaCreate(BaseModel):
    url: str

class MediaResponse(BaseModel):
    id: str
    url: str
    node_id: str
    media_type: str
    label: str
    