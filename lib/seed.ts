import type { Entry, Journey } from "@/types/tree";

// Seed journey ported from the Timeline_V2 design so the app opens fully populated.
// When the backend is wired in, this is replaced by a fetch in the repository layer.

const PLACEHOLDER = { kind: "placeholder" as const };

const ENTRIES: Array<Entry> = [
  { id: "e1", type: "reflection", year: 2021, month: 0, day: 14, title: "The night everything changed", body: "A friend prayed with me in her kitchen and I finally said yes to Jesus." },
  { id: "e2", type: "verse", year: 2021, month: 2, day: 3, title: "", body: "", ref: "Jeremiah 29:11", translation: "NIV", verseText: "“For I know the plans I have for you,” declares the Lord, “plans to prosper you and not to harm you.”", note: "Taped this to my mirror for the whole year." },
  { id: "e3", type: "milestone", year: 2021, month: 3, day: 25, title: "Baptized at Miller Creek", body: "Went under the cold water and came up laughing. My whole small group drove out to watch.", media: [PLACEHOLDER, PLACEHOLDER] },
  { id: "e4", type: "gratitude", year: 2021, month: 5, day: 12, title: "The friend who invited me", body: "Grateful for Priya, who kept a seat for me every Sunday until I finally came." },
  { id: "e5", type: "prayer", year: 2021, month: 7, day: 9, title: "Courage to tell my family", body: "Praying for the right words to tell my parents I’ve started following Jesus.", answered: true, answeredNote: "Told them at dinner in September. Mom cried — the good kind." },
  { id: "e6", type: "verse", year: 2021, month: 8, day: 21, title: "", body: "", ref: "Psalm 23:1", translation: "NIV", verseText: "The Lord is my shepherd, I lack nothing.", note: "Read this the night before a hard conversation." },
  { id: "e7", type: "reflection", year: 2021, month: 10, day: 5, title: "First time through the Gospels", body: "Finished reading Matthew through John. Jesus is so much kinder than I expected." },
  { id: "e8", type: "gratitude", year: 2021, month: 11, day: 24, title: "A church that felt like home", body: "Candlelight service. For the first time in years I wasn’t pretending." },
  { id: "e9", type: "verse", year: 2022, month: 1, day: 8, title: "", body: "", ref: "Proverbs 3:5", translation: "NIV", verseText: "Trust in the Lord with all your heart and lean not on your own understanding.", note: "My anthem for a season of big decisions." },
  { id: "e10", type: "prayer", year: 2022, month: 2, day: 15, title: "Wisdom about my job", body: "Should I stay, or take the role in Denver? Asking God for clarity and peace.", answered: false },
  { id: "e11", type: "milestone", year: 2022, month: 4, day: 20, title: "First mission trip — Guatemala", body: "Ten days building alongside a church in Xela. I came home changed.", media: [PLACEHOLDER, PLACEHOLDER] },
  { id: "e12", type: "reflection", year: 2022, month: 5, day: 30, title: "Learning to actually pray", body: "Stopped performing prayers and started talking to God like He’s in the room." },
  { id: "e13", type: "gratitude", year: 2022, month: 7, day: 18, title: "Mentors who go first", body: "Thankful for Pastor Ruiz, who lets me ask the questions I’m afraid of." },
  { id: "e14", type: "prayer", year: 2022, month: 8, day: 27, title: "For my brother’s marriage", body: "Praying hard for James and Kayla this year — for softness and honesty.", answered: true, answeredNote: "They started counseling and are gentler with each other. Thank You, Lord." },
  { id: "e15", type: "verse", year: 2022, month: 9, day: 11, title: "", body: "", ref: "Romans 8:28", translation: "NIV", verseText: "And we know that in all things God works for the good of those who love him.", note: "Underlined twice." },
  { id: "e16", type: "reflection", year: 2022, month: 11, day: 12, title: "A year of small yeses", body: "Growth wasn’t one big moment — it was a hundred quiet obediences." },
  { id: "e17", type: "verse", year: 2023, month: 1, day: 6, title: "", body: "", ref: "Isaiah 41:10", translation: "NIV", verseText: "So do not fear, for I am with you; do not be dismayed, for I am your God.", note: "Prayed this over Dad before his diagnosis." },
  { id: "e18", type: "gratitude", year: 2023, month: 3, day: 3, title: "My small-group family", body: "Thankful for people who show up on the hard weeks, not just the easy ones." },
  { id: "e19", type: "milestone", year: 2023, month: 5, day: 17, title: "Started leading a small group", body: "Terrified and honored. Eight women around my table on Tuesday nights.", media: [PLACEHOLDER] },
  { id: "e20", type: "prayer", year: 2023, month: 6, day: 9, title: "Dad’s surgery", body: "Surgery is on the 14th. Please, God, steady the surgeon’s hands and calm our house.", answered: true, answeredNote: "Surgery went well and the scans were clear in October. We wept in the parking lot." },
  { id: "e21", type: "reflection", year: 2023, month: 7, day: 22, title: "A hard, holy summer", body: "Learning that waiting on God is not the same as being forgotten by Him." },
  { id: "e22", type: "verse", year: 2023, month: 8, day: 30, title: "", body: "", ref: "Lamentations 3:22-23", translation: "ESV", verseText: "The steadfast love of the Lord never ceases; his mercies are new every morning.", note: "Some mornings this was the only thing that got me out of bed." },
  { id: "e23", type: "gratitude", year: 2023, month: 10, day: 19, title: "Rest I didn’t earn", body: "A whole Sabbath with no guilt. Grateful God isn’t measuring my productivity." },
  { id: "e24", type: "prayer", year: 2023, month: 11, day: 8, title: "Patience with myself", body: "Asking for grace to grow slowly and not despise small beginnings.", answered: false },
  { id: "e25", type: "verse", year: 2024, month: 0, day: 15, title: "", body: "", ref: "Philippians 4:6", translation: "ESV", verseText: "do not be anxious about anything, but in everything by prayer… let your requests be made known to God.", note: "Framed it for our new apartment." },
  { id: "e26", type: "reflection", year: 2024, month: 2, day: 9, title: "Doubt didn’t disqualify me", body: "Told my group I still have questions. Nobody flinched. Faith has room for honesty." },
  { id: "e27", type: "milestone", year: 2024, month: 3, day: 27, title: "Married Daniel", body: "Covenant before God and everyone we love. He prayed over me at the altar.", media: [PLACEHOLDER, PLACEHOLDER] },
  { id: "e28", type: "gratitude", year: 2024, month: 5, day: 14, title: "Answered prayers I forgot I prayed", body: "Found an old journal — half the things I begged for quietly came true." },
  { id: "e29", type: "prayer", year: 2024, month: 7, day: 2, title: "For our first home", body: "Praying for provision and peace as we look for a place to plant roots.", answered: true, answeredNote: "Keys in hand by October — the exact street we’d circled on the map." },
  { id: "e30", type: "verse", year: 2024, month: 8, day: 20, title: "", body: "", ref: "Matthew 11:28", translation: "NIV", verseText: "Come to me, all you who are weary and burdened, and I will give you rest.", note: "For the tired season." },
  { id: "e31", type: "reflection", year: 2024, month: 9, day: 25, title: "Serving when it’s inconvenient", body: "Set up chairs at 6am. Nobody saw. God did. That was enough." },
  { id: "e32", type: "gratitude", year: 2024, month: 11, day: 22, title: "Five Decembers with Jesus", body: "Looked back over four years of this timeline and just said thank You." },
  { id: "e33", type: "milestone", year: 2025, month: 1, day: 9, title: "Led my first baptism", body: "Stood in the water with a woman from my group. Full circle from Miller Creek.", media: [PLACEHOLDER, PLACEHOLDER] },
  { id: "e34", type: "verse", year: 2025, month: 6, day: 13, title: "", body: "", ref: "2 Corinthians 12:9", translation: "NIV", verseText: "My grace is sufficient for you, for my power is made perfect in weakness.", note: "On a low-energy week." },
  { id: "e35", type: "reflection", year: 2025, month: 6, day: 20, title: "Still learning to rest", body: "Turned my phone off for a whole afternoon and let God be God." },
  { id: "e36", type: "gratitude", year: 2025, month: 6, day: 27, title: "A hard conversation that healed", body: "We said the true things kindly and came out closer. Grateful." },
  { id: "e37", type: "verse", year: 2025, month: 7, day: 3, title: "", body: "", ref: "Psalm 46:10", translation: "NIV", verseText: "Be still, and know that I am God.", note: "Whispered it on the drive to work." },
  { id: "e38", type: "prayer", year: 2025, month: 7, day: 10, title: "For our small group to grow", body: "Praying two more seats fill by fall — for the ones still on the edges.", answered: false },
  { id: "e39", type: "gratitude", year: 2025, month: 7, day: 17, title: "Neighbors who became friends", body: "The Osei family across the hall. Dinner turned into praying together." },
  { id: "e40", type: "reflection", year: 2025, month: 7, day: 24, title: "Sunday quiet before the week", body: "A slow morning with coffee and the Psalms. My favorite kind of full." },
];

export const SEED_JOURNEY: Journey = {
  person: { name: "Maya Bennett", initials: "MB", since: 2021, av: ["#4a5759"] },
  entries: ENTRIES,
  testimony: {
    text: "For years I filled the ache with achievement — more work, more approval, and somehow never enough.\n\nIn 2021 my friend Priya prayed with me in her kitchen, and I finally let Jesus carry what I’d been dragging alone. He’s been remaking me ever since: gentler, freer, less afraid of being known. This timeline is my thank-you note to Him — one moment at a time.",
    media: [PLACEHOLDER, PLACEHOLDER],
  },
};
