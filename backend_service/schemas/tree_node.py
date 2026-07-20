from pydantic import BaseModel
from verse import verseResponse
from media import MediaResponse
from prayer import prayerResponse

class nodeCreate(BaseModel):
    heading: str
    body: str

class nodeResponse(BaseModel):
    id: str
    user_id: str
    heading: str
    body: str
    verses: list[verseResponse]
    prayers: list[prayerResponse]
    media: list[MediaResponse]