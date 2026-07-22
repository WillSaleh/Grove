from db.prayers import postgres_prayer_set_answered


async def prayer_resource_set_answered(
    user_id: str, prayer_id: str, answered: bool, answer_note: str | None
):
    return await postgres_prayer_set_answered(user_id, prayer_id, answered, answer_note)
