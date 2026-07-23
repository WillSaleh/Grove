"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";

import { TimelineHeader } from "@/components/journey/TimelineHeader";
import { TimelineTrack } from "@/components/journey/TimelineTrack";
import type { TrackMonth } from "@/components/journey/TimelineTrack";
import { ZoomControl } from "@/components/journey/ZoomControl";
import { DetailCard } from "@/components/panels/DetailCard";
import { TestimonyReadModal } from "@/components/panels/TestimonyReadModal";
import type { CommunityProfile } from "@/lib/communitySeed";
import { buildTimelineNodes, entriesForYear, MONTHS, MONTHS_LONG, PAD, SLOT, TODAY, YEARS_BEFORE_SINCE } from "@/lib/timeline";
import type { ZoomLevel } from "@/types/tree";

interface Props {
  profile: CommunityProfile;
}

const AXIS_STYLE: CSSProperties = {
  background: "var(--timeline)",
  borderRadius: 999,
  bottom: 67,
  height: 6,
  left: 0,
  opacity: 0.95,
  position: "absolute",
  right: 0,
};

function latestYear(years: Array<number>): number {
  return years.length ? Math.max(...years) : TODAY.year;
}

function buildProfileYears(entryYears: Array<number>, since: number): Array<number> {
  const min = Math.min(since - YEARS_BEFORE_SINCE, since, ...(entryYears.length ? entryYears : [since]));
  const max = Math.max(since, ...(entryYears.length ? entryYears : [since]));
  const years: Array<number> = [];
  for (let year = min; year <= max; year += 1) {
    years.push(year);
  }
  return years;
}

// Read-only timeline for viewing a friend's journey — same layout as My Journey, sourced from the
// friend's mock profile (no add/edit; entries open a read-only detail with reactions + comments).
export function ProfileView({ profile }: Props) {
  const entries = profile.entries;
  const firstName = profile.person.name.split(" ")[0];
  const entryYears = useMemo(() => entries.map((entry) => entry.year), [entries]);
  const initialYear = latestYear(entryYears);
  const initialMonth = useMemo(() => {
    const months = entries.filter((entry) => entry.year === initialYear).map((entry) => entry.month);
    return months.length ? Math.max(...months) : TODAY.month;
  }, [entries, initialYear]);

  const [activeYear, setActiveYear] = useState(initialYear);
  const [activeMonth, setActiveMonth] = useState(initialMonth);
  const [zoom, setZoom] = useState<ZoomLevel>("month");
  const [zoomKey, setZoomKey] = useState(0);
  const [zoomDir, setZoomDir] = useState<"in" | "out">("in");
  const [trackHeight, setTrackHeight] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cardClosing, setCardClosing] = useState(false);
  const [testimonyOpen, setTestimonyOpen] = useState(false);
  // Local, frontend-only reaction toggles keyed by `${entryId}:${reactionKey}` (mock — not persisted).
  const [reacted, setReacted] = useState<Record<string, boolean>>({});

  const scrollElRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const dragRef = useRef<{ left: number; moved: boolean; x: number } | null>(null);
  const suppressClickRef = useRef(false);
  const cardCloseTimer = useRef<number | undefined>(undefined);

  // The view resets per friend via the `key` on <ProfileView> in TimelineApp (remount re-runs the
  // useState initializers above), so no reset effect is needed here.
  const years = buildProfileYears(entryYears, profile.person.since);
  const monthMode = zoom === "month";
  const yearEntries = entriesForYear(entries, activeYear);
  const monthEntries = yearEntries.filter((entry) => entry.month === activeMonth);
  const nodes = useMemo(
    () => buildTimelineNodes({ activeMonth, bloomId: null, entries, motion: true, trackHeight, year: activeYear, zoom }),
    [activeMonth, activeYear, entries, trackHeight, zoom],
  );
  const selectedEntry = selectedId ? entries.find((entry) => entry.id === selectedId) ?? null : null;
  const hasTestimony = Boolean(profile.testimony.text.trim() || profile.testimony.photos.length);

  const handleWheel = useCallback((event: WheelEvent) => {
    const element = scrollElRef.current;
    if (!element) {
      return;
    }
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      element.scrollLeft += event.deltaX;
      event.preventDefault();
    }
  }, []);

  const setScrollRef = useCallback(
    (element: HTMLDivElement | null) => {
      if (scrollElRef.current && scrollElRef.current !== element) {
        scrollElRef.current.removeEventListener("wheel", handleWheel);
        observerRef.current?.disconnect();
      }
      scrollElRef.current = element;
      if (element) {
        element.addEventListener("wheel", handleWheel, { passive: false });
        setTrackHeight(element.clientHeight);
        const observer = new ResizeObserver(() => {
          if (scrollElRef.current) {
            setTrackHeight(scrollElRef.current.clientHeight);
          }
        });
        observer.observe(element);
        observerRef.current = observer;
      }
    },
    [handleWheel],
  );

  function resetScroll() {
    requestAnimationFrame(() => {
      scrollElRef.current?.scrollTo({ behavior: "auto", left: 0 });
    });
  }

  function selectYear(year: number) {
    setActiveYear(year);
    setActiveMonth(0);
    resetScroll();
  }

  function jumpMonth(month: number) {
    setActiveMonth(month);
    resetScroll();
  }

  function openMonth(month: number) {
    setZoom("month");
    setActiveMonth(month);
    setZoomDir("in");
    setZoomKey((key) => key + 1);
    resetScroll();
  }

  function changeZoom(next: ZoomLevel) {
    if (next === zoom) {
      return;
    }
    setZoomDir(next === "month" ? "in" : "out");
    setZoomKey((key) => key + 1);
    if (next === "month") {
      const months = yearEntries.map((entry) => entry.month);
      setActiveMonth(months.length ? Math.max(...months) : TODAY.month);
    }
    setZoom(next);
    resetScroll();
  }

  function openEntry(id: string) {
    if (suppressClickRef.current) {
      return;
    }
    window.clearTimeout(cardCloseTimer.current);
    setSelectedId(id);
    setCardClosing(false);
  }

  function closeCard() {
    setCardClosing(true);
    cardCloseTimer.current = window.setTimeout(() => {
      setSelectedId(null);
      setCardClosing(false);
    }, 260);
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!monthMode) {
      return;
    }
    const element = scrollElRef.current;
    if (!element) {
      return;
    }
    dragRef.current = { left: element.scrollLeft, moved: false, x: event.clientX };
    setDragging(true);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const element = scrollElRef.current;
    const drag = dragRef.current;
    if (!element || !drag) {
      return;
    }
    const dx = event.clientX - drag.x;
    if (Math.abs(dx) > 4) {
      drag.moved = true;
    }
    element.scrollLeft = drag.left - dx;
  }

  function onPointerUp() {
    const drag = dragRef.current;
    if (drag) {
      suppressClickRef.current = drag.moved;
      dragRef.current = null;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 40);
    }
    setDragging(false);
  }

  function onKeyDownTrack(event: KeyboardEvent<HTMLDivElement>) {
    const element = scrollElRef.current;
    if (!element) {
      return;
    }
    if (event.key === "ArrowRight") {
      element.scrollBy({ behavior: "smooth", left: SLOT });
      event.preventDefault();
    } else if (event.key === "ArrowLeft") {
      element.scrollBy({ behavior: "smooth", left: -SLOT });
      event.preventDefault();
    } else if (event.key === "Home") {
      element.scrollTo({ behavior: "smooth", left: 0 });
      event.preventDefault();
    } else if (event.key === "End") {
      element.scrollTo({ behavior: "smooth", left: element.scrollWidth });
      event.preventDefault();
    }
  }

  const zoomAnim = `${zoomDir === "out" ? "gr-zoomout" : "gr-zoomin"} .42s cubic-bezier(.22,.61,.36,1) both`;
  const scrollStyle: CSSProperties = monthMode
    ? {
        cursor: dragging ? "grabbing" : "grab",
        display: "flex",
        flex: 1,
        minHeight: 0,
        outline: "none",
        overflowX: "auto",
        overflowY: "hidden",
        padding: "0 0 6px clamp(20px,4vw,52px)",
        position: "relative",
        userSelect: "none",
        WebkitOverflowScrolling: "touch",
      }
    : {
        display: "flex",
        flex: 1,
        minHeight: 0,
        outline: "none",
        overflow: "hidden",
        padding: "0 clamp(20px,4vw,52px) 16px",
        position: "relative",
      };
  const trackStyle: CSSProperties = monthMode
    ? { animation: zoomAnim, flexShrink: 0, minWidth: "100%", position: "relative", width: PAD * 2 + Math.max(1, nodes.length) * SLOT }
    : { animation: zoomAnim, flex: "1 1 auto", position: "relative", width: "100%" };

  const trackMonths: Array<TrackMonth> = monthMode
    ? [
        ...monthEntries.map((entry, index) => ({
          bandStyle: { display: "none" as const },
          guideStyle: {
            background: index === 0 ? "transparent" : "color-mix(in srgb, var(--accent) 9%, transparent)",
            bottom: 24,
            left: PAD + index * SLOT,
            position: "absolute" as const,
            top: 24,
            width: 1,
          },
          labelStyle: {
            bottom: 33,
            color: "#b0b0b5",
            fontSize: 11.5,
            fontWeight: 600,
            left: PAD + index * SLOT + SLOT / 2,
            letterSpacing: ".04em",
            position: "absolute" as const,
            textTransform: "uppercase" as const,
            transform: "translateX(-50%)",
          },
          month: null,
          name: `${MONTHS[entry.month]} ${entry.day}`,
        })),
        {
          bandStyle: { display: "none" as const },
          guideStyle: {
            background: "color-mix(in srgb, var(--accent) 9%, transparent)",
            bottom: 24,
            left: PAD + monthEntries.length * SLOT,
            position: "absolute" as const,
            top: 24,
            width: 1,
          },
          labelStyle: { bottom: 33, left: -9999, position: "absolute" as const },
          month: null,
          name: "",
        },
      ]
    : MONTHS.map((name, index) => ({
        bandStyle: {
          borderRadius: 10,
          bottom: 24,
          cursor: "pointer",
          height: 30,
          left: `${(index / 12) * 100}%`,
          position: "absolute" as const,
          width: `${100 / 12}%`,
          zIndex: 0,
        },
        guideStyle: {
          background: index === 0 ? "transparent" : "color-mix(in srgb, var(--accent) 7%, transparent)",
          bottom: 24,
          left: `${(index / 12) * 100}%`,
          position: "absolute" as const,
          top: 24,
          width: 1,
        },
        labelActive: index === activeMonth,
        labelStyle: {
          bottom: 33,
          cursor: "pointer",
          fontSize: 11.5,
          fontWeight: 600,
          left: `${((index + 0.5) / 12) * 100}%`,
          letterSpacing: ".04em",
          position: "absolute" as const,
          textTransform: "uppercase" as const,
          transform: "translateX(-50%)",
          transition: "color .2s",
          zIndex: 1,
        },
        month: index,
        name,
      }));

  const emptyText = monthMode ? `Nothing in ${MONTHS_LONG[activeMonth]} ${activeYear}` : `Nothing in ${activeYear}`;
  const emptySub = monthMode ? "Try another month or year." : "Try another year above.";

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-canvas">
      <TimelineHeader
        activeMonth={activeMonth}
        activeYear={activeYear}
        monthMode={monthMode}
        onJumpMonth={jumpMonth}
        onOpenTestimony={() => setTestimonyOpen(true)}
        onSelectYear={selectYear}
        personInitials={profile.person.initials}
        subtitle={`${firstName} has been walking with God since ${profile.person.since}`}
        testimonyIcon="ph-book-open"
        testimonyLabel={hasTestimony ? "Read Testimony" : "No Testimony Yet"}
        votRef=""
        votText=""
        welcomeText={profile.person.name}
        years={years}
      />

      <TimelineTrack
        axisStyle={AXIS_STYLE}
        emptySub={emptySub}
        emptyText={emptyText}
        isEmpty={nodes.length === 0}
        nodes={nodes}
        onKeyDownTrack={onKeyDownTrack}
        onOpenEntry={openEntry}
        onOpenMonth={openMonth}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onScroll={() => undefined}
        scrollRef={setScrollRef}
        scrollStyle={scrollStyle}
        trackKey={`z${zoomKey}`}
        trackMonths={trackMonths}
        trackStyle={trackStyle}
      />

      <ZoomControl onSetZoom={changeZoom} zoom={zoom} />

      {selectedEntry ? (
        <DetailCard
          blooming={false}
          closing={cardClosing}
          comments={selectedEntry.comments}
          entry={selectedEntry}
          onClose={closeCard}
          onReact={(key) =>
            setReacted((current) => {
              const mapKey = `${selectedEntry.id}:${key}`;
              return { ...current, [mapKey]: !current[mapKey] };
            })
          }
          reacted={{
            amen: reacted[`${selectedEntry.id}:amen`],
            heart: reacted[`${selectedEntry.id}:heart`],
            pray: reacted[`${selectedEntry.id}:pray`],
          }}
          reactions={selectedEntry.reactions}
          readOnly
        />
      ) : null}

      {testimonyOpen && hasTestimony ? (
        <TestimonyReadModal
          initials={profile.person.initials}
          name={profile.person.name}
          onClose={() => setTestimonyOpen(false)}
          photos={profile.testimony.photos}
          text={profile.testimony.text}
        />
      ) : null}
    </div>
  );
}
