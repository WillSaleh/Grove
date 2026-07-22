import httpx
import datetime
import os

import asyncio

VOTD_URL = "https://api.youversion.com/v1/verse_of_the_days/"
VERSE_URL = "https://api.youversion.com/v1/bibles/111/passages/"

async def get_votd():

    current_day = datetime.date.today().timetuple().tm_yday
    headers = {"X-YVP-App-Key": os.environ["YVP_APP_KEY"]}

    async with httpx.AsyncClient() as client:

        passage_url = VOTD_URL + f"{current_day}"
        passage = await client.get(passage_url, headers=headers)
        
        verse_url = VERSE_URL + f"{passage.json().get("passage_id")}"
        verse = await client.get(verse_url, headers=headers)

    return verse.json()

