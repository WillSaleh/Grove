import type { Entry, MediaItem, Person } from "@/types/tree";

// The six community members' journeys, ported from the Timeline_V2 design. Mock, client-only.
// Entries carry reactions + comments (the social layer) on top of the normal Entry shape.
export type CommunityReactions = { amen: number; heart: number; pray: number };
export type CommunityComment = { initials: string; name: string; text: string };
export type CommunityEntry = Entry & {
  authorId: string;
  authorInitials: string;
  authorName: string;
  comments: Array<CommunityComment>;
  reactions: CommunityReactions;
};
export type CommunityProfile = {
  entries: Array<CommunityEntry>;
  id: string;
  lastActive: number;
  person: Person;
  testimony: { photos: Array<MediaItem>; text: string };
};

const PH = (count: number): Array<MediaItem> => Array.from({ length: count }, () => ({ kind: "placeholder" as const }));
const MAYA = { initials: "MB", name: "Maya Bennett" };

type RawExtra = Partial<Entry> & { comments?: Array<CommunityComment> };
type RawEntry = [string, Entry["type"], number, number, number, string, string, RawExtra?];

type RawProfile = {
  entries: Array<RawEntry>;
  id: string;
  lastActive: number;
  person: Person;
  testimony: { photos: Array<MediaItem>; text: string };
};

const RAW: Array<RawProfile> = [
  {
    id: "u_grace",
    lastActive: 1,
    person: { av: [], initials: "GO", name: "Grace Okafor", since: 2013 },
    testimony: {
      photos: PH(2),
      text: "I grew up in church but met Jesus for myself at a campus fellowship in 2013, on a night I’d planned to walk away from faith for good.\n\nInstead of leaving, I stayed and wept through the last song. He met me in my doubt and never let go. Twelve years later I get to disciple young women who are asking the same questions I did — and I get a front-row seat to what He does.",
    },
    entries: [
      ["g1", "milestone", 2013, 8, 12, "Gave my life to Christ", "A campus fellowship night I’ll never forget. I came to leave faith behind and left belonging to Him.", { media: PH(1) }],
      ["g2", "verse", 2013, 9, 2, "", "", { ref: "John 15:5", translation: "NIV", verseText: "I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit.", note: "The first verse I ever memorized on purpose." }],
      ["g3", "milestone", 2016, 6, 18, "Baptized in the Atlantic", "Freezing water, warm family. My mentor read Romans 6 on the shore.", { media: PH(2), comments: [{ initials: "MB", name: "Maya Bennett", text: "This picture preaches. So grateful for your yes, Grace." }] }],
      ["g4", "prayer", 2019, 4, 20, "Healing for my mother", "Stage two, and we are asking God for more time and for peace either way.", { answered: true, answeredNote: "In remission by that winter. Every scan since has been clear. He is so kind." }],
      ["g5", "gratitude", 2022, 2, 14, "The women I get to disciple", "Six of them around my table every week. I learn as much as I teach."],
      ["g6", "reflection", 2024, 10, 9, "A decade of faithfulness", "Looked back over ten years. He kept every promise, even the ones I’d forgotten."],
      ["g7", "prayer", 2025, 6, 30, "For the students this fall", "New year, new faces. Praying the shy ones in the back know they’re seen.", { answered: false }],
    ],
  },
  {
    id: "u_marcus",
    lastActive: 2,
    person: { av: [], initials: "MB", name: "Marcus Bell", since: 2016 },
    testimony: {
      photos: PH(1),
      text: "I met Jesus in a recovery meeting in the basement of a church I swore I’d never enter.\n\nI’d lost the job, the trust, most of the people. Someone handed me a coffee and a Bible and said, “He’s not done with you.” Nine years sober now, and I lead worship for the same ministry that carried me. Grace is not a word to me. It’s a room full of people who wouldn’t give up.",
    },
    entries: [
      ["m1", "milestone", 2016, 2, 3, "Day one, sober", "Walked into the meeting broken. Walked out with a sponsor and a strange, stubborn hope."],
      ["m2", "verse", 2017, 5, 9, "", "", { ref: "2 Corinthians 5:17", translation: "NIV", verseText: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!", note: "Read it every morning for a year." }],
      ["m3", "milestone", 2019, 9, 15, "Joined the worship team", "First time back on a stage sober. My hands shook through the whole set.", { media: PH(1) }],
      ["m4", "prayer", 2021, 3, 28, "My brother’s way home", "He stopped speaking to all of us. Praying he picks up the phone.", { answered: true, answeredNote: "He called on Easter. We talked for three hours. Thank You, God." }],
      ["m5", "gratitude", 2023, 7, 6, "The man who handed me coffee", "Nine years later Ray still texts me every Monday. Everyone needs a Ray."],
      ["m6", "reflection", 2024, 11, 2, "Leading from the scars", "I used to hide my story. Now it’s the most useful thing about me."],
      ["m7", "prayer", 2025, 7, 14, "For the youth band", "Half of them come from hard homes. Praying music becomes their way in.", { answered: false }],
    ],
  },
  {
    id: "u_priya",
    lastActive: 4,
    person: { av: [], initials: "PA", name: "Priya Anand", since: 2019 },
    testimony: {
      photos: PH(2),
      text: "I’m a research scientist. I came to an Alpha course to debunk it and stayed because I couldn’t explain the peace in the room.\n\nFaith didn’t ask me to stop thinking — it gave my questions somewhere to land. The best thing I’ve done since is keep a seat warm for my friend Maya until she was ready to come. Watching her say yes was watching God answer a prayer I almost didn’t dare to pray.",
    },
    entries: [
      ["p1", "reflection", 2019, 1, 22, "I came to argue", "Signed up for Alpha with a list of objections. Left with a longer list of questions I actually wanted answered."],
      ["p2", "verse", 2019, 3, 11, "", "", { ref: "Psalm 34:8", translation: "NIV", verseText: "Taste and see that the Lord is good; blessed is the one who takes refuge in him.", note: "The scientist in me appreciated the invitation to experiment." }],
      ["p3", "milestone", 2020, 2, 16, "Baptized", "A quiet service, a loud heart. My lab friends came and didn’t quite know why they cried.", { media: PH(1) }],
      ["p4", "gratitude", 2021, 5, 30, "Maya said yes", "Two years of saving her a seat. Today she stayed for the whole service and asked how to start.", { comments: [{ initials: "MB", name: "Maya Bennett", text: "You changed my life by not giving up on me. I love you, Pri." }] }],
      ["p5", "prayer", 2023, 8, 4, "Peace about the PhD", "Comprehensive exams are crushing me. Asking for a steady mind.", { answered: true, answeredNote: "Passed with a calm I can only credit to Him. Cried in the hallway after." }],
      ["p6", "milestone", 2024, 9, 8, "Started teaching kids’ church", "Turns out five-year-olds ask better theology questions than my colleagues."],
      ["p7", "gratitude", 2025, 7, 1, "A faith that holds my questions", "Grateful I never had to choose between my mind and my Maker."],
    ],
  },
  {
    id: "u_elena",
    lastActive: 6,
    person: { av: [], initials: "ER", name: "Elena Ruiz", since: 2020 },
    testimony: {
      photos: [],
      text: "Lockdown stripped my life down to the studs, and in the quiet I came back to a faith I’d let go cold.\n\nWith the world shut, our little apartment became a chapel — bedtime prayers, worship over dishes, my kids learning the songs. God rebuilt me right there at the kitchen table. I’m not a polished believer. I’m a tired mom who found Him faithful in the ordinary.",
    },
    entries: [
      ["n1", "milestone", 2020, 3, 29, "Came back to Jesus", "Rededicated my life on the living room floor while the world stood still."],
      ["n2", "gratitude", 2020, 6, 15, "A house of prayer", "We started praying at dinner. My four-year-old now prays for the mail carrier."],
      ["n3", "prayer", 2021, 1, 18, "Work for Miguel", "He lost the job in the shutdown. Praying for provision and for his dignity.", { answered: true, answeredNote: "Hired in March — better hours, closer to home. We danced in the kitchen." }],
      ["n4", "verse", 2022, 4, 7, "", "", { ref: "Joshua 24:15", translation: "NIV", verseText: "But as for me and my household, we will serve the Lord.", note: "Painted it above the door." }],
      ["n5", "reflection", 2023, 5, 21, "Faith at kid-height", "Motherhood taught me that faith is mostly showing up, tired, again and again."],
      ["n6", "gratitude", 2024, 10, 12, "The nursery volunteers", "The women who hold my baby so I can hear a whole sermon. Unsung saints."],
      ["n7", "prayer", 2025, 7, 5, "Patience", "Two under five. Asking God daily for a gentleness I do not naturally have.", { answered: false }],
    ],
  },
  {
    id: "u_josiah",
    lastActive: 11,
    person: { av: [], initials: "JK", name: "Josiah Kim", since: 2022 },
    testimony: {
      photos: [],
      text: "I gave my life to Christ at the back of a concert, half-convinced it was just the lights and the crowd.\n\nThe next morning it was still true. I’ve spent the years since learning that faith and doubt can share a room — that “I believe; help my unbelief” is a real prayer God honors. I write songs about it now. He’s not scared of my questions, so I’m learning not to be either.",
    },
    entries: [
      ["j1", "milestone", 2022, 6, 25, "Said yes at the back of the room", "A worship night I almost skipped. Something broke open and I haven’t been the same."],
      ["j2", "verse", 2022, 7, 14, "", "", { ref: "Mark 9:24", translation: "NIV", verseText: "I do believe; help me overcome my unbelief!", note: "The most honest prayer I know." }],
      ["j3", "reflection", 2023, 2, 9, "The doubting season", "Some weeks I feel nothing. Learning that faithfulness isn’t the same as feelings."],
      ["j4", "prayer", 2023, 10, 3, "Direction after graduation", "Music or the “safe” path? Asking God to make the next step obvious.", { answered: false }],
      ["j5", "gratitude", 2024, 4, 19, "Friends who pray out loud", "My campus group prays for me by name. I didn’t know I needed that until I had it."],
      ["j6", "prayer", 2025, 1, 27, "The weight of anxiety", "Some nights my chest won’t loosen. Praying for rest that actually rests.", { answered: true, answeredNote: "Started therapy and honest prayer together. The nights are quieter now." }],
      ["j7", "verse", 2025, 6, 8, "", "", { ref: "Psalm 42:11", translation: "NIV", verseText: "Why, my soul, are you downcast? Put your hope in God, for I will yet praise him.", note: "A lyric before it was a comfort." }],
    ],
  },
  {
    id: "u_daniel",
    lastActive: 18,
    person: { av: [], initials: "DF", name: "Daniel Foster", since: 2018 },
    testimony: {
      photos: [],
      text: "I was baptized my sophomore year of college after a roommate lived out a quiet, unhypocritical faith I couldn’t argue with.\n\nGod has grown me slowly — through friendship, through failure, through learning to lead by serving. The clearest answer to prayer in my whole life has a name: Maya. I asked God for a partner who’d run toward Him, and He gave me someone who makes me braver in my faith.",
    },
    entries: [
      ["d1", "milestone", 2018, 10, 7, "Baptized in college", "My roommate’s quiet faith wore me down in the best way. Went public that fall.", { media: PH(1) }],
      ["d2", "verse", 2019, 3, 15, "", "", { ref: "Micah 6:8", translation: "NIV", verseText: "To act justly and to love mercy and to walk humbly with your God.", note: "My compass verse." }],
      ["d3", "reflection", 2021, 6, 4, "Learning to lead by serving", "Signed up to stack chairs. Learned more about leadership there than in any book."],
      ["d4", "prayer", 2023, 2, 20, "For a partner who loves God more than me", "Asking boldly and a little embarrassed.", { answered: true, answeredNote: "Met Maya that spring. God has a sense of humor and impeccable timing.", comments: [{ initials: "MB", name: "Maya Bennett", text: "He answered mine with you too. ❤️" }] }],
      ["d5", "milestone", 2024, 3, 27, "Married Maya", "Best day. Prayed over her at the altar and could barely get the words out.", { media: PH(2) }],
      ["d6", "gratitude", 2025, 4, 2, "Our first home", "Keys in hand. We prayed in every empty room before the furniture came."],
    ],
  },
];

export const COMMUNITY: Array<CommunityProfile> = RAW.map((profile) => ({
  entries: profile.entries.map(([id, type, year, month, day, title, body, extra], index) => ({
    authorId: profile.id,
    authorInitials: profile.person.initials,
    authorName: profile.person.name,
    body,
    comments: extra?.comments ?? [],
    day,
    id,
    month,
    reactions: { amen: 4 + ((index * 7 + 3) % 12), heart: 3 + ((index * 5 + 1) % 13), pray: 2 + ((index * 11 + 2) % 9) },
    title,
    type,
    year,
    ...(extra ?? {}),
  })),
  id: profile.id,
  lastActive: profile.lastActive,
  person: profile.person,
  testimony: profile.testimony,
}));

export function findProfile(id: string): CommunityProfile | undefined {
  return COMMUNITY.find((profile) => profile.id === id);
}

// All community entries flattened newest-first — the source for the Community Feed.
export function communityFeed(): Array<CommunityEntry> {
  return COMMUNITY.flatMap((profile) => profile.entries).sort(
    (a, b) => b.year - a.year || b.month - a.month || b.day - a.day,
  );
}

export { MAYA };
