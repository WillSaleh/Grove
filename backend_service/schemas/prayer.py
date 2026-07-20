from pydantic import BaseModel

class prayerCreate(BaseModel):
    body: str

class prayerResponse(BaseModel):
    id: str
    node_id: str
    body: str