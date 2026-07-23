// Converts between the frontend's free-text verse refs ("Jeremiah 29:11") and the backend's
// strict USFM-style refs ("JER 29:11"), which is the only format its auto-fetch regex accepts.
const BOOK_NAME_TO_CODE: Record<string, string> = {
  genesis: "GEN",
  exodus: "EXO",
  leviticus: "LEV",
  numbers: "NUM",
  deuteronomy: "DEU",
  joshua: "JOS",
  judges: "JDG",
  ruth: "RUT",
  "1 samuel": "1SA",
  "2 samuel": "2SA",
  "1 kings": "1KI",
  "2 kings": "2KI",
  "1 chronicles": "1CH",
  "2 chronicles": "2CH",
  ezra: "EZR",
  nehemiah: "NEH",
  esther: "EST",
  job: "JOB",
  psalm: "PSA",
  psalms: "PSA",
  proverbs: "PRO",
  ecclesiastes: "ECC",
  "song of solomon": "SNG",
  "song of songs": "SNG",
  isaiah: "ISA",
  jeremiah: "JER",
  lamentations: "LAM",
  ezekiel: "EZK",
  daniel: "DAN",
  hosea: "HOS",
  joel: "JOL",
  amos: "AMO",
  obadiah: "OBA",
  jonah: "JON",
  micah: "MIC",
  nahum: "NAM",
  habakkuk: "HAB",
  zephaniah: "ZEP",
  haggai: "HAG",
  zechariah: "ZEC",
  malachi: "MAL",
  matthew: "MAT",
  mark: "MRK",
  luke: "LUK",
  john: "JHN",
  acts: "ACT",
  romans: "ROM",
  "1 corinthians": "1CO",
  "2 corinthians": "2CO",
  galatians: "GAL",
  ephesians: "EPH",
  philippians: "PHP",
  colossians: "COL",
  "1 thessalonians": "1TH",
  "2 thessalonians": "2TH",
  "1 timothy": "1TI",
  "2 timothy": "2TI",
  titus: "TIT",
  philemon: "PHM",
  hebrews: "HEB",
  james: "JAS",
  "1 peter": "1PE",
  "2 peter": "2PE",
  "1 john": "1JN",
  "2 john": "2JN",
  "3 john": "3JN",
  jude: "JUD",
  revelation: "REV",
};

function titleCase(name: string): string {
  return name.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const CODE_TO_BOOK_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(BOOK_NAME_TO_CODE)
    .filter(([name]) => name !== "psalms") // "psalm"/"psalms" both map to PSA; keep "Psalm" as the canonical display name
    .map(([name, code]) => [code, titleCase(name)]),
);

const REF_PATTERN = /^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/;
const BACKEND_REF_PATTERN = /^([A-Z0-9]{2,3})\s+(\d+):(\d+)(?:-(\d+))?(?:\s+[A-Z]{2,4})?$/i;

// "Jeremiah 29:11" + "NIV" -> "JER 29:11 NIV". Falls back to the raw ref if the book name isn't recognized
// (the backend will still create the entry — verse_text/translation just won't auto-fetch).
export function toBackendVerseRef(ref: string, translation?: string): string {
  const trimmed = ref.trim();
  const match = REF_PATTERN.exec(trimmed);
  if (!match) return trimmed;

  const [, bookName, chapter, verse, verseEnd] = match;
  const code = BOOK_NAME_TO_CODE[bookName.trim().toLowerCase()];
  if (!code) return trimmed;

  const verseRange = verseEnd ? `${verse}-${verseEnd}` : verse;
  const suffix = translation?.trim() ? ` ${translation.trim().toUpperCase()}` : "";
  return `${code} ${chapter}:${verseRange}${suffix}`;
}

// "JER 29:11 NIV" -> "Jeremiah 29:11" (translation is dropped here; it comes back as its own field).
export function fromBackendVerseRef(ref: string | null | undefined): string | undefined {
  if (!ref) return undefined;
  const match = BACKEND_REF_PATTERN.exec(ref.trim());
  if (!match) return ref;

  const [, code, chapter, verse, verseEnd] = match;
  const name = CODE_TO_BOOK_NAME[code.toUpperCase()] ?? code;
  const verseRange = verseEnd ? `${verse}-${verseEnd}` : verse;
  return `${name} ${chapter}:${verseRange}`;
}
