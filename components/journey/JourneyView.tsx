"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";

import { Icon } from "@/components/Icon";
import { TimelineHeader } from "@/components/journey/TimelineHeader";
import { TimelineTrack } from "@/components/journey/TimelineTrack";
import type { TrackMonth } from "@/components/journey/TimelineTrack";
import { ZoomControl } from "@/components/journey/ZoomControl";
import { DetailCard } from "@/components/panels/DetailCard";
import { blankForm, canSaveForm, EntryFormModal } from "@/components/panels/EntryFormModal";
import type { EntryForm } from "@/components/panels/EntryFormModal";
import { TestimonyModal } from "@/components/panels/TestimonyModal";
import {
  createEntry,
  deleteBackendEntry,
  getVerseOfTheDay,
  setPrayerAnswered,
  syncEntryMedia,
  syncTestimonyMedia,
  updateBackendEntry,
  updateTestimonyText,
  type VerseOfTheDay,
} from "@/lib/api";
import { buildDisplayVerseRef, parseDisplayVerseRef } from "@/lib/bibleBooks";
import { parseEntryDay, parseEntryYear } from "@/lib/dates";
import { buildTimelineNodes, entriesForYear, MONTHS, MONTHS_LONG, PAD, SLOT, TODAY, YEARS_BEFORE_SINCE } from "@/lib/timeline";
import { verseOfTheDay as localVerseOfTheDay } from "@/lib/verses";
import { useTreeStore } from "@/store/useTreeStore";
import type { Entry, EntryType, MediaItem, Testimony, ZoomLevel } from "@/types/tree";

interface Props {
  onShowToast: (message: string, icon: string) => void;
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

function latestYear(entries: Array<Entry>): number {
  return entries.length ? Math.max(...entries.map((entry) => entry.year)) : TODAY.year;
}

function latestMonthIn(entries: Array<Entry>, year: number): number {
  const months = entries.filter((entry) => entry.year === year).map((entry) => entry.month);
  return months.length ? Math.max(...months) : TODAY.month;
}

function buildYears(entries: Array<Entry>, since: number): Array<number> {
  const entryYears = entries.map((entry) => entry.year);
  const min = Math.min(
    since - YEARS_BEFORE_SINCE,
    since,
    ...(entryYears.length ? entryYears : [since]),
  );
  const max = Math.max(TODAY.year, since, ...(entryYears.length ? entryYears : [since]));
  const years: Array<number> = [];
  for (let year = min; year <= max; year += 1) {
    years.push(year);
  }
  return years;
}

function filesToMedia(files: Array<File>): Array<MediaItem> {
  return files.map((file) => ({
    kind: file.type.startsWith("video") ? "video" : "image",
    url: URL.createObjectURL(file), // local preview only — the real, persistable URL comes from uploading `file`
    file,
  }));
}

export function JourneyView({ onShowToast }: Props) {
  const entries = useTreeStore((state) => state.entries);
  const person = useTreeStore((state) => state.person);
  const testimony = useTreeStore((state) => state.testimony);
  const addEntry = useTreeStore((state) => state.addEntry);
  const updateEntry = useTreeStore((state) => state.updateEntry);
  const deleteEntry = useTreeStore((state) => state.deleteEntry);
  const setAnswered = useTreeStore((state) => state.setAnswered);
  const persistTestimony = useTreeStore((state) => state.saveTestimony);
  const userId = useTreeStore((state) => state.userId);

  const [activeYear, setActiveYear] = useState(() => latestYear(entries));
  const [activeMonth, setActiveMonth] = useState(() => latestMonthIn(entries, latestYear(entries)));
  const [zoom, setZoom] = useState<ZoomLevel>("month");
  const [zoomKey, setZoomKey] = useState(0);
  const [zoomDir, setZoomDir] = useState<"in" | "out">("in");
  const [trackHeight, setTrackHeight] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cardClosing, setCardClosing] = useState(false);
  const [bloomId, setBloomId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<EntryForm>(() => blankForm(latestYear(entries), latestMonthIn(entries, latestYear(entries)), 15));
  const [testimonyOpen, setTestimonyOpen] = useState(false);
  const [testimonyDraft, setTestimonyDraft] = useState<Testimony>({ media: [], text: "" });
  const [verseOfTheDay, setVerseOfTheDay] = useState<VerseOfTheDay | null>(() => localVerseOfTheDay());

  const scrollElRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const dragRef = useRef<{ left: number; moved: boolean; x: number } | null>(null);
  const suppressClickRef = useRef(false);
  const cardCloseTimer = useRef<number | undefined>(undefined);
  const bloomTimer = useRef<number | undefined>(undefined);

  const years = buildYears(entries, person.since);
  const monthMode = zoom === "month";
  const yearEntries = entriesForYear(entries, activeYear);
  const monthEntries = yearEntries.filter((entry) => entry.month === activeMonth);
  // Memoized so hover/toast/menu re-renders don't rebuild every node's style objects mid-animation.
  const nodes = useMemo(
    () => buildTimelineNodes({ activeMonth, bloomId, entries, motion: true, trackHeight, year: activeYear, zoom }),
    [activeMonth, activeYear, bloomId, entries, trackHeight, zoom],
  );
  const selectedEntry = selectedId ? entries.find((entry) => entry.id === selectedId) ?? null : null;
  const firstName = person.name.split(" ")[0];
  const hasTestimony = Boolean(testimony.text.trim() || testimony.media.length);

  useEffect(() => {
    // Backend Verse of the Day when available; otherwise keep the local list value seeded above.
    getVerseOfTheDay()
      .then(setVerseOfTheDay)
      .catch(() => setVerseOfTheDay(localVerseOfTheDay()));
  }, []);

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
      setActiveMonth(latestMonthIn(entries, activeYear));
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

  async function toggleAnswered() {
    if (!selectedEntry) {
      return;
    }
    const next = !selectedEntry.answered;
    // Optimistic local update + celebration bloom — runs with or without a live backend.
    setAnswered(selectedEntry.id, next);
    if (next) {
      setBloomId(selectedEntry.id);
      window.clearTimeout(bloomTimer.current);
      bloomTimer.current = window.setTimeout(() => setBloomId(null), 1150);
      onShowToast("Prayer answered — to God be the glory", "ph-seal-check");
    }
    // Best-effort sync when signed in against a real backend prayer.
    if (userId && selectedEntry.prayerId) {
      try {
        await setPrayerAnswered(userId, selectedEntry.prayerId, next, selectedEntry.answeredNote ?? null);
      } catch (error) {
        console.error("Failed to sync prayer status:", error);
      }
    }
  }

  function openAdd() {
    setForm(blankForm(activeYear, activeMonth, 15));
    setFormOpen(true);
  }

  function editSelected() {
    if (!selectedEntry) {
      return;
    }
    const parsed =
      selectedEntry.type === "verse" ? parseDisplayVerseRef(selectedEntry.ref ?? "") : null;
    setForm({
      answered: Boolean(selectedEntry.answered),
      answeredNote: selectedEntry.answeredNote ?? "",
      body: selectedEntry.body ?? "",
      bookCode: parsed?.bookCode ?? "PSA",
      chapter: parsed?.chapter ?? "",
      day: String(selectedEntry.day),
      id: selectedEntry.id,
      media: [...(selectedEntry.media ?? [])],
      mode: "edit",
      month: selectedEntry.month,
      note: selectedEntry.note ?? "",
      step: "fields",
      title: selectedEntry.title ?? "",
      translation: selectedEntry.translation ?? "NIV",
      type: selectedEntry.type,
      verse: parsed?.verse ?? "",
      verseEnd: parsed?.verseEnd ?? "",
      year: String(selectedEntry.year),
    });
    setFormOpen(true);
    setSelectedId(null);
    setCardClosing(false);
  }

  async function deleteSelected() {
    if (!selectedEntry) {
      return;
    }
    const { id } = selectedEntry;
    deleteEntry(id);
    setSelectedId(null);
    setCardClosing(false);
    onShowToast("Entry removed", "ph-leaf");
    if (userId) {
      try {
        await deleteBackendEntry(userId, id);
      } catch (error) {
        console.error("Failed to delete entry on the backend:", error);
      }
    }
  }

  function pickType(type: EntryType) {
    setForm((current) => ({ ...current, step: "fields", type }));
  }

  async function saveForm() {
    if (!canSaveForm(form) || !form.type) {
      return;
    }
    const year = parseEntryYear(form.year, activeYear);
    const day = parseEntryDay(form.day, year, Number(form.month));
    const verseRef =
      form.type === "verse"
        ? buildDisplayVerseRef(form.bookCode, form.chapter.trim(), form.verse.trim(), form.verseEnd.trim() || undefined)
        : "";
    const isEdit = form.mode === "edit" && Boolean(form.id);
    const localId = globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}`;
    const entry: Entry = {
      answeredNote: form.answeredNote.trim(),
      answered: form.answered,
      body: form.body.trim(),
      day,
      id: isEdit ? (form.id as string) : localId,
      media: form.media,
      month: Number(form.month),
      note: form.note.trim(),
      ref: verseRef,
      title: form.title.trim(),
      translation: form.translation.trim() || "NIV",
      type: form.type,
      year,
    };

    // Optimistic local update so the journey works with or without a live backend.
    if (isEdit) {
      updateEntry(entry);
    } else {
      addEntry(entry);
    }
    setActiveYear(entry.year);
    setActiveMonth(entry.month);
    setFormOpen(false);
    onShowToast(isEdit ? "Entry updated" : "Added to your journey", "ph-seal-check");

    // Best-effort backend sync (+ media upload) when signed in; reconcile with the saved record.
    if (!userId) {
      return;
    }
    try {
      if (isEdit) {
        const saved = await updateBackendEntry(userId, entry.id, entry);
        const previousMedia = entries.find((e) => e.id === entry.id)?.media ?? [];
        saved.media = await syncEntryMedia(userId, saved.id, previousMedia, entry.media ?? []);
        updateEntry(saved);
      } else {
        const saved = await createEntry(userId, entry);
        saved.media = await syncEntryMedia(userId, saved.id, [], entry.media ?? []);
        deleteEntry(entry.id);
        addEntry(saved);
      }
    } catch (error) {
      console.error("Failed to save entry on the backend:", error);
    }
  }

  function openTestimony() {
    setTestimonyDraft({ media: [...testimony.media], text: testimony.text });
    setTestimonyOpen(true);
  }

  async function saveTestimony() {
    const text = testimonyDraft.text.trim();
    // Optimistic local save so testimony works with or without a live backend.
    persistTestimony({ text, media: testimonyDraft.media });
    setTestimonyOpen(false);
    onShowToast("Testimony saved", "ph-hand-heart");
    if (!userId) {
      return;
    }
    try {
      await updateTestimonyText(userId, text);
      const media = await syncTestimonyMedia(userId, testimony.media, testimonyDraft.media);
      persistTestimony({ text, media });
    } catch (error) {
      console.error("Failed to save testimony on the backend:", error);
    }
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

  const emptyText = monthMode
    ? `Nothing in ${MONTHS_LONG[activeMonth]} ${activeYear}`
    : `Nothing planted in ${activeYear} yet`;
  const emptySub = monthMode
    ? "Pick another month, or add an entry here."
    : "Tap “Add entry” to mark what God did this year.";

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-canvas">
      <TimelineHeader
        activeMonth={activeMonth}
        activeYear={activeYear}
        monthMode={monthMode}
        onJumpMonth={jumpMonth}
        onOpenTestimony={openTestimony}
        onSelectYear={selectYear}
        personInitials={person.initials}
        testimonyLabel={hasTestimony ? "Edit Testimony" : "Share Testimony"}
        votRef={verseOfTheDay?.ref ?? ""}
        votText={verseOfTheDay?.text ?? ""}
        welcomeText={`Welcome back, ${firstName}!`}
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

      <button
        className="fixed z-40 inline-flex cursor-pointer items-center gap-[9px] rounded-full border-none bg-timeline px-[22px] py-[15px] text-[15px] font-semibold text-white shadow-[0_8px_22px_-6px_color-mix(in_srgb,var(--timeline)_50%,transparent)] transition-[transform,box-shadow,background-color] duration-300 ease-[cubic-bezier(.22,.61,.36,1)] hover:-translate-y-[3px] hover:scale-[1.03] hover:bg-[var(--timeline-strong)] hover:shadow-[0_14px_30px_-8px_color-mix(in_srgb,var(--timeline)_60%,transparent)]"
        onClick={openAdd}
        style={{ bottom: "clamp(18px,3vw,32px)", right: "clamp(18px,3vw,36px)" }}
        type="button"
      >
        <Icon name="ph-plus" weight="bold" /> Add entry
      </button>

      {selectedEntry ? (
        <DetailCard
          blooming={bloomId === selectedEntry.id}
          closing={cardClosing}
          entry={selectedEntry}
          onClose={closeCard}
          onDelete={deleteSelected}
          onEdit={editSelected}
          onToggleAnswered={toggleAnswered}
        />
      ) : null}

      {formOpen ? (
        <EntryFormModal
          form={form}
          onAddFiles={(files) => setForm((current) => ({ ...current, media: [...current.media, ...filesToMedia(files)] }))}
          onCancel={() => setFormOpen(false)}
          onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
          onPickType={pickType}
          onRemoveMedia={(index) => setForm((current) => ({ ...current, media: current.media.filter((_, i) => i !== index) }))}
          onSave={saveForm}
        />
      ) : null}

      {testimonyOpen ? (
        <TestimonyModal
          draft={testimonyDraft}
          onAddPhotos={(files) =>
            setTestimonyDraft((current) => ({
              ...current,
              media: [...current.media, ...filesToMedia(files)],
            }))
          }
          onCancel={() => setTestimonyOpen(false)}
          onChangeText={(text) => setTestimonyDraft((current) => ({ ...current, text }))}
          onRemovePhoto={(item) => setTestimonyDraft((current) => ({ ...current, media: current.media.filter((m) => m !== item) }))}
          onRemoveVideo={() => setTestimonyDraft((current) => ({ ...current, media: current.media.filter((m) => m.kind !== "video") }))}
          onSave={saveTestimony}
          onSetVideo={(files) => {
            const file = files[0];
            if (file) {
              setTestimonyDraft((current) => ({
                ...current,
                media: [...current.media.filter((m) => m.kind !== "video"), { kind: "video", url: URL.createObjectURL(file), file }],
              }));
            }
          }}
        />
      ) : null}
    </div>
  );
}
