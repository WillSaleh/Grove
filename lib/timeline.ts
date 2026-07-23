import type { CSSProperties } from "react";

import { ENTRY_TYPES } from "@/lib/entryTypes";
import type { Entry, EntryType, ZoomLevel } from "@/types/tree";

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// How many years before `person.since` the year picker still allows.
export const YEARS_BEFORE_SINCE = 3;

function todayParts() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
}

export const TODAY = todayParts();

// Timeline geometry (px), ported from the design.
export const PAD = 64; // leading padding before the first column in month mode
export const SLOT = 300; // width of one entry column in month mode
export const STEP = 48; // vertical gap between stacked chips in year mode
export const GAP = 44; // distance from the axis to the first chip
export const AXIS_OFFSET = 70; // chips/stems rise this far above the track bottom
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function entriesForYear(entries: Array<Entry>, year: number): Array<Entry> {
  return entries
    .filter((entry) => entry.year === year)
    .sort((a, b) => a.month - b.month || a.day - b.day);
}

export function truncate(value: string | undefined, max: number): string {
  const text = value ?? "";
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

export function formatLongDate(year: number, month: number, day: number): string {
  return `${MONTHS_LONG[month]} ${day}, ${year}`;
}

export function formatShortDate(year: number, month: number, day: number): string {
  return `${MONTHS[month]} ${day}, ${year}`;
}

function weekOf(year: number, month: number, day: number): number {
  return Math.floor(new Date(year, month, day).getTime() / WEEK_MS);
}

export type JourneyStats = {
  answered: number;
  milestones: number;
  streak: number;
  total: number;
  years: number;
};

export function statsFor(entries: Array<Entry>, since: number): JourneyStats {
  const weeks = new Set(entries.map((entry) => weekOf(entry.year, entry.month, entry.day)));
  const last = entries.length ? Math.max(...weeks) : 0;
  let streak = 0;
  while (entries.length && weeks.has(last - streak)) {
    streak += 1;
  }
  return {
    answered: entries.filter((entry) => entry.type === "prayer" && entry.answered).length,
    milestones: entries.filter((entry) => entry.type === "milestone").length,
    streak,
    total: entries.length,
    years: TODAY.year - since + 1,
  };
}

export type TimelineNode = {
  answered: boolean;
  ariaLabel: string;
  badgeStyle?: CSSProperties;
  blooming: boolean;
  cardStyle: CSSProperties;
  compact: boolean;
  dateLabel: string;
  dotStyle: CSSProperties;
  entryId: string | null;
  hasPhoto: boolean;
  iconChipStyle: CSSProperties;
  iconName: string;
  id: string;
  isOverflow: boolean;
  isVerse: boolean;
  kind: "entry" | "overflow";
  labelStyle?: CSSProperties;
  overflowMonth: number | null;
  overflowText: string | null;
  photoPlaceholder: boolean;
  photoUrl: string | null;
  showBody: boolean;
  showDate: boolean;
  showHoverTitle: boolean;
  showTitle: boolean;
  showTypeLabel: boolean;
  snippet: string;
  stemStyle: CSSProperties;
  title: string;
  type?: EntryType;
  typeLabel?: string;
  wrapStyle: CSSProperties;
};

type BuildNodesParams = {
  activeMonth: number;
  bloomId: string | null;
  entries: Array<Entry>;
  motion: boolean;
  trackHeight: number;
  year: number;
  zoom: ZoomLevel;
};

// Lays out every entry (and any "+N more" overflow chip) for the active year.
// Year mode stacks chips per-month above the axis; month mode spreads full cards across 300px columns.
export function buildTimelineNodes({
  activeMonth,
  bloomId,
  entries,
  motion,
  trackHeight,
  year,
  zoom,
}: BuildNodesParams): Array<TimelineNode> {
  const monthMode = zoom === "month";
  const compactMode = !monthMode;
  const yearEntries = entriesForYear(entries, year);
  const src = monthMode ? yearEntries.filter((entry) => entry.month === activeMonth) : yearEntries;

  // How many chips fit in a month's stack before we roll the rest into an overflow chip.
  const maxStack = trackHeight ? Math.max(1, Math.floor((trackHeight - 12 - 160) / STEP) + 1) : 3;
  const totals: Record<number, number> = {};
  if (compactMode) {
    src.forEach((entry) => {
      totals[entry.month] = (totals[entry.month] ?? 0) + 1;
    });
  }

  const seen: Record<number, number> = {};
  const overflowFor: Record<number, number> = {};
  const kept = compactMode
    ? src.filter((entry) => {
        const total = totals[entry.month];
        const count = (seen[entry.month] = (seen[entry.month] ?? 0) + 1);
        if (total <= maxStack) {
          return true;
        }
        if (count <= maxStack - 1) {
          return true;
        }
        overflowFor[entry.month] = total - (maxStack - 1);
        return false;
      })
    : src;

  const monthCounts: Record<number, number> = {};
  const nodes: Array<TimelineNode> = kept.map((entry, index) => {
    const meta = ENTRY_TYPES[entry.type];
    const compact = compactMode;
    const stackIdx = compact ? (monthCounts[entry.month] = (monthCounts[entry.month] ?? -1) + 1) : 0;
    const left = monthMode ? PAD + (index + 0.5) * SLOT : `${((entry.month + 0.5) / 12) * 100}%`;
    const isAnswered = entry.type === "prayer" && Boolean(entry.answered);
    const hasPhoto = Boolean(entry.media && entry.media.length);
    const isCurrentMonth = entry.month === TODAY.month && year === TODAY.year;
    const photoUrl = entry.media?.[0]?.url ?? null;

    const cardStyle: CSSProperties = compact
      ? {
          alignItems: "center",
          background: "#fff",
          border: "1px solid #e4ddd0",
          borderRadius: 999,
          bottom: AXIS_OFFSET + GAP + stackIdx * STEP,
          cursor: "pointer",
          display: "inline-flex",
          justifyContent: "flex-start",
          left: "50%",
          padding: 4,
          position: "absolute",
          transform: "translateX(-23px)",
          transition: motion ? "transform .2s cubic-bezier(.22,.61,.36,1)" : "none",
          zIndex: 2,
          ...(motion ? { animation: "gr-risec .5s cubic-bezier(.22,.61,.36,1) backwards", animationDelay: `${index * 0.05}s` } : {}),
        }
      : {
          background: "#fff",
          border: "1px solid #e4ddd0",
          borderRadius: 18,
          bottom: AXIS_OFFSET + GAP,
          boxShadow: "none",
          cursor: "pointer",
          left: "50%",
          padding: "13px 15px",
          position: "absolute",
          transform: "translateX(-50%)",
          transition: motion ? "transform .25s cubic-bezier(.22,.61,.36,1), box-shadow .25s" : "none",
          width: 214,
          zIndex: 2,
          ...(motion ? { animation: "gr-rise .5s cubic-bezier(.22,.61,.36,1) backwards", animationDelay: `${index * 0.05}s` } : {}),
        };

    const dotStyle: CSSProperties = isCurrentMonth
      ? {
          background: "#5c7a5e",
          border: "4px solid #fff",
          borderRadius: 999,
          bottom: AXIS_OFFSET,
          boxShadow: "0 0 0 2px #5c7a5e",
          height: 22,
          left: "50%",
          position: "absolute",
          transform: "translate(-50%,50%)",
          width: 22,
          zIndex: 3,
        }
      : {
          background: "#fff",
          border: "5px solid #d7cfc1",
          borderRadius: 999,
          bottom: AXIS_OFFSET,
          height: 22,
          left: "50%",
          position: "absolute",
          transform: "translate(-50%,50%)",
          width: 22,
          zIndex: 3,
        };

    return {
      answered: !compact && isAnswered,
      ariaLabel: `${entry.type}: ${entry.title || entry.body || entry.ref || ""}`,
      badgeStyle: isAnswered
        ? { alignItems: "center", background: "#4a5759", borderRadius: 999, color: "#fff", display: "inline-flex", fontSize: 11, fontWeight: 600, gap: 5, marginTop: 8, padding: "3px 10px" }
        : { alignItems: "center", background: meta.tint, borderRadius: 999, color: meta.color, display: "inline-flex", fontSize: 11, fontWeight: 600, gap: 5, marginTop: 8, padding: "3px 9px" },
      blooming: bloomId === entry.id,
      cardStyle,
      compact,
      dateLabel: formatShortDate(entry.year, entry.month, entry.day),
      dotStyle,
      entryId: entry.id,
      hasPhoto: !compact && hasPhoto,
      iconChipStyle: compact
        ? { alignItems: "center", background: isAnswered ? meta.color : meta.tint, borderRadius: 999, color: isAnswered ? "#fff" : meta.color, display: "flex", flex: "0 0 auto", fontSize: 20, height: 38, justifyContent: "center", width: 38 }
        : { alignItems: "center", background: isAnswered ? meta.color : meta.tint, borderRadius: 999, color: isAnswered ? "#fff" : meta.color, display: "flex", flex: "0 0 auto", fontSize: 18, height: 34, justifyContent: "center", width: 34 },
      iconName: meta.icon,
      id: entry.id,
      isOverflow: false,
      isVerse: !compact && entry.type === "verse",
      kind: "entry",
      labelStyle: { color: meta.color, fontSize: compact ? 11.5 : 10.5, fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase" },
      overflowMonth: null,
      overflowText: null,
      photoPlaceholder: !compact && hasPhoto && !photoUrl,
      photoUrl: !compact && hasPhoto ? photoUrl : null,
      showBody: !compact && entry.type !== "verse",
      showDate: !compact,
      showHoverTitle: compact,
      showTitle: !compact,
      showTypeLabel: !compact,
      snippet: entry.type === "verse" ? truncate(entry.verseText, 72) : truncate(entry.body, 72),
      stemStyle: {
        background: isAnswered ? "rgba(74,87,89,.6)" : "#d7cfc1",
        borderRadius: 999,
        bottom: AXIS_OFFSET,
        height: (compact ? GAP + stackIdx * STEP : GAP) - 2,
        left: "50%",
        position: "absolute",
        transform: "translateX(-50%)",
        width: 3,
        zIndex: 1,
      },
      title: entry.type === "verse" ? entry.ref ?? "" : entry.title,
      type: entry.type,
      typeLabel: meta.label,
      wrapStyle: { bottom: 0, left, position: "absolute", top: 0, width: 0 },
    };
  });

  if (compactMode) {
    Object.keys(overflowFor).forEach((monthStr) => {
      const month = Number(monthStr);
      const more = overflowFor[month];
      const stackIdx = maxStack - 1;
      nodes.push({
        answered: false,
        ariaLabel: `${more} more entries in ${MONTHS_LONG[month]} — open month view`,
        blooming: false,
        cardStyle: {
          alignItems: "center",
          background: "rgba(74,87,89,.1)",
          border: "1px solid rgba(74,87,89,.3)",
          borderRadius: 999,
          bottom: AXIS_OFFSET + GAP + stackIdx * STEP,
          cursor: "pointer",
          display: "inline-flex",
          justifyContent: "flex-start",
          left: "50%",
          padding: 4,
          position: "absolute",
          transform: "translateX(-23px)",
          transition: motion ? "transform .2s cubic-bezier(.22,.61,.36,1)" : "none",
          zIndex: 4,
          ...(motion ? { animation: "gr-risec .5s cubic-bezier(.22,.61,.36,1) backwards" } : {}),
        },
        compact: true,
        dateLabel: "",
        dotStyle: { display: "none" },
        entryId: null,
        hasPhoto: false,
        iconChipStyle: { alignItems: "center", background: "#4a5759", borderRadius: 999, color: "#fff", display: "flex", flex: "0 0 auto", height: 38, justifyContent: "center", width: 38 },
        iconName: "ph-plus",
        id: `ovf-${month}`,
        isOverflow: true,
        isVerse: false,
        kind: "overflow",
        overflowMonth: month,
        overflowText: `+${more}`,
        photoPlaceholder: false,
        photoUrl: null,
        showBody: false,
        showDate: false,
        showHoverTitle: true,
        showTitle: false,
        showTypeLabel: false,
        snippet: "",
        stemStyle: {
          background: "#d7cfc1",
          borderRadius: 999,
          bottom: AXIS_OFFSET,
          height: GAP + stackIdx * STEP - 2,
          left: "50%",
          position: "absolute",
          transform: "translateX(-50%)",
          width: 3,
          zIndex: 1,
        },
        title: `${more} more`,
        wrapStyle: { bottom: 0, left: `${((month + 0.5) / 12) * 100}%`, position: "absolute", top: 0, width: 0 },
      });
    });
  }

  return nodes;
}
