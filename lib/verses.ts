import { TODAY } from "@/lib/timeline";

// Verse-of-the-day pool, ported from the design. Rendered in the journey header.
export const VERSES: Array<[string, string]> = [
  ["The Lord is my shepherd; I shall not want.", "Psalm 23:1"],
  ["I can do all things through Christ who strengthens me.", "Philippians 4:13"],
  ["Be still, and know that I am God.", "Psalm 46:10"],
  ["Trust in the Lord with all your heart, and lean not on your own understanding.", "Proverbs 3:5"],
  ["The Lord is close to the brokenhearted and saves those who are crushed in spirit.", "Psalm 34:18"],
  ["Cast all your anxiety on him because he cares for you.", "1 Peter 5:7"],
  ["For I know the plans I have for you, plans to prosper you and not to harm you.", "Jeremiah 29:11"],
  ["Weeping may stay for the night, but rejoicing comes in the morning.", "Psalm 30:5"],
  ["Come to me, all who are weary and burdened, and I will give you rest.", "Matthew 11:28"],
  ["The Lord your God is with you, the Mighty Warrior who saves.", "Zephaniah 3:17"],
  ["Let all that you do be done in love.", "1 Corinthians 16:14"],
  ["This is the day the Lord has made; let us rejoice and be glad in it.", "Psalm 118:24"],
  ["Wait for the Lord; be strong and take heart and wait for the Lord.", "Psalm 27:14"],
  ["The steadfast love of the Lord never ceases; his mercies are new every morning.", "Lamentations 3:22-23"],
  ["Do not be anxious about anything, but in every situation, present your requests to God.", "Philippians 4:6"],
  ["He gives strength to the weary and increases the power of the weak.", "Isaiah 40:29"],
  ["Taste and see that the Lord is good; blessed is the one who takes refuge in him.", "Psalm 34:8"],
  ["Your word is a lamp for my feet, a light on my path.", "Psalm 119:105"],
  ["Give thanks to the Lord, for he is good; his love endures forever.", "Psalm 107:1"],
  ["And we know that in all things God works for the good of those who love him.", "Romans 8:28"],
  ["Be strong and courageous. Do not be afraid; the Lord your God will be with you.", "Joshua 1:9"],
  ["Rejoice in hope, be patient in tribulation, be constant in prayer.", "Romans 12:12"],
  ["The joy of the Lord is your strength.", "Nehemiah 8:10"],
  ["Peace I leave with you; my peace I give you. Do not let your hearts be troubled.", "John 14:27"],
  ["Love is patient, love is kind. It does not envy, it does not boast.", "1 Corinthians 13:4"],
  ["In their hearts humans plan their course, but the Lord establishes their steps.", "Proverbs 16:9"],
  ["The Lord is my light and my salvation — whom shall I fear?", "Psalm 27:1"],
  ["Whatever you do, work at it with all your heart, as working for the Lord.", "Colossians 3:23"],
  ["Cast your cares on the Lord and he will sustain you.", "Psalm 55:22"],
  ["Delight yourself in the Lord, and he will give you the desires of your heart.", "Psalm 37:4"],
];

// Stable per calendar day (day-of-year modulo the pool size), matching the design.
export function verseOfTheDay(): { ref: string; text: string } {
  const start = new Date(TODAY.year, 0, 0).getTime();
  const now = new Date(TODAY.year, TODAY.month, TODAY.day).getTime();
  const dayOfYear = Math.floor((now - start) / 86_400_000);
  const [text, ref] = VERSES[dayOfYear % VERSES.length];
  return { ref, text };
}
