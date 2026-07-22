from datetime import date
from typing import Literal

from pydantic import BaseModel

from schemas.media import MediaResponse, MediaCreate
from schemas.prayer import PrayerResponse, PrayerCreate
from schemas.tag import TagResponse
from schemas.verse import VerseResponse, VerseCreate


class EntryCreate(BaseModel):
    user_id: str
    heading: str
    body: str
    tag: Literal["root", "milestone", "leaf"]
    category: str | None = None
    is_praise: bool = False
    is_encouragement: bool = False
    is_hearted: bool = False
    verses: list[VerseCreate] = []
    prayers: list[PrayerCreate] = []
    media: list[MediaCreate] = []
    tag_id: str | None = None


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
    is_hearted: bool = False
    verses: list[VerseResponse] = []
    prayers: list[PrayerResponse] = []
    media: list[MediaResponse] = []
    entry_tag: TagResponse | None = None

class VerseEntryCreate(BaseModel):
    user_id: str
    verse: VerseCreate

class VerseEntryResponse(BaseModel):
    id: str
    tree_id: str
    tag: Literal["verse"] = "verse"
    entry_date: date | None = None
    is_hearted: bool = False
    verse: VerseResponse


class PrayerEntryCreate(BaseModel):
    user_id: str
    prayer: PrayerCreate


class PrayerEntryResponse(BaseModel):
    id: str
    tree_id: str
    tag: Literal["prayer"] = "prayer"
    entry_date: date | None = None
    is_hearted: bool = False
    prayer: PrayerResponse