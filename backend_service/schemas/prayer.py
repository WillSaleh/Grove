from datetime import date

from pydantic import BaseModel


class PrayerCreate(BaseModel):
    prayer_text: str | None = None


class PrayerResponse(BaseModel):
    id: str
    entry_id: str
    prayer_text: str | None = None
    answered: bool = False
    answered_at: date | None = None
    answer_note: str | None = None
