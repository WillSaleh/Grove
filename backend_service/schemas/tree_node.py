from datetime import date
from typing import Literal

from pydantic import BaseModel

from schemas.media import MediaResponse, MediaCreate
from schemas.prayer import PrayerResponse, PrayerCreate
from schemas.verse import VerseResponse, VerseCreate


class EntryCreate(BaseModel):
    tree_id: str
    heading: str
    body: str
    tag: Literal["root", "milestone", "leaf"]
    category: str | None = None
    is_praise: bool = False
    is_encouragement: bool = False
    verses: list[VerseCreate] = []
    prayers: list[PrayerCreate] = []
    media: list[MediaCreate] = []


class EntryResponse(BaseModel):
    id: str
    tree_id: str
    heading: str | None = None
    body: str | None = None
    tag: Literal["root", "milestone", "leaf"] | None = None
    category: str | None = None
    entry_date: date | None = None
    is_praise: bool = False
    is_encouragement: bool = False
    verses: list[VerseResponse] = []
    prayers: list[PrayerResponse] = []
    media: list[MediaResponse] = []
