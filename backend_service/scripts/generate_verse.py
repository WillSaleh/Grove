import re

import httpx

BIBLE_URL = "https://biblecontent.youversionapi.com/4.1/bibles/{bible_id}/passages/"
DEFAULT_VERSION = "NIV"

VERSION_CODES: dict[str, int] = {
    "AMP": 1588,
    "ASV": 12,
    "BSB": 3034,
    "CEV": 37,
    "CSB": 1713,
    "ESV": 59,
    "GNT": 68,
    "HCSB": 72,
    "KJV": 1,
    "LSB": 3345,
    "MSG": 97,
    "NASB": 100,
    "NET": 107,
    "NIV": 111,
    "NKJV": 114,
    "NLT": 116,
    "WEB": 206,
}

_VERSE_REF_PATTERN = re.compile(
    r"^([A-Z]{3})\s+(\d+):(\d+)(?:-(\d+))?(?:\s+([A-Z]{3,4}))?$",
    re.IGNORECASE,
)


async def _disect_verse_ref(ref: str) -> dict[str, str | int | None]:
    match = _VERSE_REF_PATTERN.match(ref.strip())
    if not match:
        raise ValueError(
            f"Invalid verse reference {ref!r}. Expected format like "
            "'GEN 3:6 NIV' or 'MAT 5:7-12 NKJV'."
        )

    book, chapter, verse, end_verse, version = match.groups()
    start_verse = int(verse)
    parsed_end_verse = int(end_verse) if end_verse else None
    version_code = (version or DEFAULT_VERSION).upper()

    if parsed_end_verse is not None and parsed_end_verse < start_verse:
        raise ValueError(
            f"Invalid verse range in {ref!r}: end verse must be >= start verse."
        )

    bible_id = VERSION_CODES.get(version_code)
    if bible_id is None:
        raise ValueError(
            f"Unknown Bible version {version_code!r}. "
            f"Supported versions: {', '.join(sorted(VERSION_CODES))}."
        )

    return {
        "book": book.upper(),
        "chapter": int(chapter),
        "verse": start_verse,
        "end_verse": parsed_end_verse,
        "version": version_code,
        "bible_id": bible_id,
    }


async def retrieve_verse(ref: str) -> str:
    parts = await _disect_verse_ref(ref)
    passage = (
        f"{parts['book']}.{parts['chapter']}.{parts['verse']}"
        f"{f'-{parts['end_verse']}' if parts['end_verse'] else ''}"
    )
    url = f"{BIBLE_URL.format(bible_id=parts['bible_id'])}{passage}/text"

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
    if response.status_code != 200:
        raise ValueError(
            f"Unable to find verse {ref!r} in {parts['version']} (HTTP {response.status_code})."
        )

    response.encoding = "utf-8"
    return response.text
