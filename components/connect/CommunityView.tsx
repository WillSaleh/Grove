"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";

import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { ENCOURAGEMENT_KIND, feedKind, GROUPS } from "@/lib/community";
import type { FeedKind } from "@/lib/community";
import { communityFeed } from "@/lib/communitySeed";
import type { CommunityComment, CommunityEntry } from "@/lib/communitySeed";
import { ENTRY_TYPES } from "@/lib/entryTypes";
import { formatShortDate, MONTHS, PAD, SLOT, truncate } from "@/lib/timeline";
import type { EntryType } from "@/types/tree";

interface Props {
  connectTab: "groups" | "feed" | "timeline";
  onOpenFriend: (id: string) => void;
  onShowToast: (message: string, icon: string) => void;
}

const INITIAL_JOINED = ["g_new", "g_women", "g_worship"];

// Category filter chips (design cats order + plural labels).
const CT_CATS: Array<[EntryType, string]> = [
  ["milestone", "Milestones"],
  ["verse", "Verses"],
  ["gratitude", "Gratitude"],
  ["prayer", "Prayers"],
  ["reflection", "Reflections"],
];

// Display-only reaction chips on timeline nodes (design CBASE), sourced from seed counts.
const CT_REACTIONS: Array<{ icon: string; iconColor: string; key: "amen" | "heart" | "pray" }> = [
  { icon: "ph-thumbs-up", iconColor: "#4a7fb5", key: "amen" },
  { icon: "ph-heart-straight", iconColor: "#cf5069", key: "heart" },
  { icon: "ph-hands-praying", iconColor: "#4a7fb5", key: "pray" },
];

type LocalPost = { body: string; id: string };

// A post shaped for the feed card renderer — covers both my own posts and community entries.
type ShapedPost = {
  amenBase: number;
  answeredNote: string;
  authorId: string;
  authorInitials: string;
  authorName: string;
  body: string;
  dateLabel: string;
  id: string;
  isVerse: boolean;
  kind: FeedKind;
  prayCount: number;
  seedComments: Array<CommunityComment>;
  title: string;
  verseRef: string;
  verseText: string;
};

const CARD = "rounded-[20px] border border-edge bg-card shadow-[var(--shadow-1)]";

function heading(title: string, note: string) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <h2 className="m-0 font-display text-[19px] font-semibold tracking-[-.01em] text-content">{title}</h2>
      <span className="text-[13px] text-subtle-2">{note}</span>
    </div>
  );
}

const REACTION_BTN_BASE: CSSProperties = {
  alignItems: "center",
  borderRadius: 999,
  cursor: "pointer",
  display: "inline-flex",
  fontSize: 13,
  fontWeight: 600,
  gap: 7,
  padding: "7px 14px",
  transition: "all .18s",
};

function amenStyle(liked: boolean): CSSProperties {
  return {
    ...REACTION_BTN_BASE,
    background: liked ? "rgba(165,99,74,.1)" : "transparent",
    border: `1px solid ${liked ? "#a5634a" : "var(--border)"}`,
    color: liked ? "#a5634a" : "var(--muted)",
  };
}

const PRAY_STYLE: CSSProperties = {
  ...REACTION_BTN_BASE,
  background: "transparent",
  border: "1px solid var(--border)",
  color: "var(--muted)",
};

export function CommunityView({ connectTab, onOpenFriend, onShowToast }: Props) {
  const [joined, setJoined] = useState<Array<string>>(INITIAL_JOINED);
  const [topDraft, setTopDraft] = useState("");
  const [myPosts, setMyPosts] = useState<Array<LocalPost>>([]);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  // Frontend-only reaction toggles for timeline nodes, keyed `${entryId}:${reactionKey}` (mock).
  const [nodeReacted, setNodeReacted] = useState<Record<string, boolean>>({});
  const [replies, setReplies] = useState<Record<string, Array<CommunityComment>>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [dragging, setDragging] = useState(false);
  const [visible, setVisible] = useState<Record<EntryType, boolean>>({
    gratitude: true,
    milestone: true,
    prayer: true,
    reflection: true,
    verse: true,
  });

  const scrollElRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ left: number; moved: boolean; x: number } | null>(null);
  const suppressClickRef = useRef(false);

  const feed = useMemo(() => communityFeed(), []);
  const timelineEntries = feed.filter((entry) => visible[entry.type]);

  function toggleGroup(id: string, name: string) {
    setJoined((current) => {
      if (current.includes(id)) {
        return current.filter((groupId) => groupId !== id);
      }
      onShowToast(`Joined ${name}`, "ph-check-circle");
      return [...current, id];
    });
  }

  function shareTop() {
    const text = topDraft.trim();
    if (!text) {
      return;
    }
    setMyPosts((current) => [{ body: text, id: `me-${current.length}` }, ...current]);
    setTopDraft("");
    onShowToast("Shared with the community", "ph-hand-heart");
  }

  function toggleAmen(id: string) {
    setLiked((current) => ({ ...current, [id]: !current[id] }));
  }

  function prayFor() {
    onShowToast("Praying with them", "ph-hands-praying");
  }

  function toggleNodeReaction(mapKey: string) {
    setNodeReacted((current) => ({ ...current, [mapKey]: !current[mapKey] }));
  }

  function sendReply(id: string) {
    const text = (replyDrafts[id] ?? "").trim();
    if (!text) {
      return;
    }
    setReplies((current) => ({ ...current, [id]: [...(current[id] ?? []), { initials: "MB", name: "Maya Bennett", text }] }));
    setReplyDrafts((current) => ({ ...current, [id]: "" }));
    onShowToast("Encouragement sent", "ph-hand-heart");
  }

  // ---- Feed (composer + posts) --------------------------------------------

  const myShaped: Array<ShapedPost> = myPosts.map((post) => ({
    amenBase: 0,
    answeredNote: "",
    authorId: "me",
    authorInitials: "MB",
    authorName: "Maya Bennett",
    body: post.body,
    dateLabel: "Just now",
    id: post.id,
    isVerse: false,
    kind: ENCOURAGEMENT_KIND,
    prayCount: 0,
    seedComments: [],
    title: "",
    verseRef: "",
    verseText: "",
  }));

  const communityShaped: Array<ShapedPost> = feed.slice(0, 8).map((entry) => {
    const isVerse = entry.type === "verse";
    return {
      amenBase: entry.reactions.amen + entry.reactions.heart,
      answeredNote: entry.type === "prayer" && entry.answered && entry.answeredNote ? entry.answeredNote : "",
      authorId: entry.authorId,
      authorInitials: entry.authorInitials,
      authorName: entry.authorName,
      body: isVerse ? entry.note ?? "" : entry.body ?? "",
      dateLabel: formatShortDate(entry.year, entry.month, entry.day),
      id: entry.id,
      isVerse,
      kind: feedKind(entry.type, entry.answered),
      prayCount: entry.reactions.pray,
      seedComments: entry.comments,
      title: isVerse ? "" : entry.title ?? "",
      verseRef: isVerse ? `${entry.ref ?? ""}${entry.translation ? `  ·  ${entry.translation}` : ""}` : "",
      verseText: isVerse ? entry.verseText ?? "" : "",
    };
  });

  function renderPost(post: ShapedPost, index: number) {
    const clickable = post.authorId !== "me";
    const isLiked = Boolean(liked[post.id]);
    const amen = post.amenBase + (isLiked ? 1 : 0);
    const comments = [...post.seedComments, ...(replies[post.id] ?? [])];

    return (
      <div
        className={`${CARD} p-[20px_22px]`}
        key={post.id}
        style={{ animation: "gr-cardin .5s cubic-bezier(.22,1,.36,1) backwards", animationDelay: `${index * 0.05}s` }}
      >
        <div className="flex items-center gap-3">
          {clickable ? (
            <button className="cursor-pointer border-none bg-transparent p-0" onClick={() => onOpenFriend(post.authorId)} type="button">
              <Avatar background="var(--accent)" border="2px solid var(--ring)" fontSize={16} initials={post.authorInitials} size={44} />
            </button>
          ) : (
            <Avatar background="var(--accent)" border="2px solid var(--ring)" fontSize={16} initials={post.authorInitials} size={44} />
          )}
          <div className="min-w-0 flex-1">
            {clickable ? (
              <button
                className="cursor-pointer border-none bg-transparent p-0 text-[15px] font-semibold leading-tight text-content"
                onClick={() => onOpenFriend(post.authorId)}
                type="button"
              >
                {post.authorName}
              </button>
            ) : (
              <div className="text-[15px] font-semibold leading-tight text-content">{post.authorName}</div>
            )}
            <div className="mt-[2px] text-xs text-subtle-2">{post.dateLabel}</div>
          </div>
          <div
            className="inline-flex items-center gap-[6px] rounded-full px-[10px] py-[4px] text-[11.5px] font-bold tracking-[.03em]"
            style={{ background: `color-mix(in srgb, ${post.kind.color} 14%, transparent)`, color: post.kind.color }}
          >
            <Icon name={post.kind.icon} weight="duotone" /> {post.kind.label}
          </div>
        </div>

        {post.isVerse ? (
          <div style={{ borderLeft: "3px solid #8a6b32", margin: "15px 0 6px", padding: "2px 0 2px 16px" }}>
            <div className="font-serif text-[18px] italic leading-[1.5] text-content">“{post.verseText}”</div>
            <div className="mt-[7px] text-[12.5px] font-semibold" style={{ color: "#8a6b32" }}>
              {post.verseRef}
            </div>
          </div>
        ) : null}
        {!post.isVerse && post.title ? <div className="mt-[14px] text-base font-semibold leading-tight text-content">{post.title}</div> : null}
        {post.body ? <div className="mt-[7px] text-[14.5px] leading-[1.6] text-content-soft">{post.body}</div> : null}
        {post.answeredNote ? (
          <div className="mt-[13px] flex items-start gap-[9px] rounded-[14px] p-[12px_14px]" style={{ background: "rgba(165,99,74,.08)" }}>
            <Icon className="mt-px flex-none text-[17px]" name="ph-seal-check" style={{ color: "#a5634a" }} weight="fill" />
            <div className="text-[13.5px] leading-[1.5] text-content-soft">
              <span className="font-semibold" style={{ color: "#a5634a" }}>Answered.</span> {post.answeredNote}
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex items-center gap-[10px]">
          <button onClick={() => toggleAmen(post.id)} style={amenStyle(isLiked)} type="button">
            <Icon name="ph-hands-clapping" weight="fill" /> Amen · {amen}
          </button>
          <button onClick={prayFor} style={PRAY_STYLE} type="button">
            <Icon name="ph-hands-praying" weight="duotone" /> Pray · {post.prayCount}
          </button>
        </div>

        {comments.length ? (
          <div className="mt-4 flex flex-col gap-[11px] border-t border-divide pt-[15px]">
            {comments.map((comment, index) => (
              <div className="flex items-start gap-[10px]" key={index}>
                <Avatar background="var(--accent)" border="2px solid var(--ring)" fontSize={11} initials={comment.initials} size={30} />
                <div className="min-w-0 flex-1 rounded-[14px] bg-canvas p-[9px_13px]">
                  <div className="text-[12.5px] font-semibold text-content">{comment.name}</div>
                  <div className="mt-[2px] text-[13.5px] leading-[1.45] text-content-soft">{comment.text}</div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-[14px] flex items-center gap-[10px]">
          <Avatar background="var(--accent)" border="2px solid var(--ring)" fontSize={11} initials="MB" size={30} />
          <input
            className="min-w-0 flex-1 rounded-full border border-edge bg-field px-[15px] py-[9px] text-[13.5px] text-content outline-none"
            onChange={(event) => setReplyDrafts((current) => ({ ...current, [post.id]: event.target.value }))}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                sendReply(post.id);
              }
            }}
            placeholder="Write an encouragement…"
            value={replyDrafts[post.id] ?? ""}
          />
          <button
            aria-label="Send encouragement"
            className="flex h-[38px] w-[38px] flex-none cursor-pointer items-center justify-center rounded-full border-none text-[15px] text-white"
            onClick={() => sendReply(post.id)}
            style={{ background: "var(--accent)" }}
            type="button"
          >
            <Icon name="ph-paper-plane-tilt" weight="bold" />
          </button>
        </div>
      </div>
    );
  }

  // ---- Community Timeline (horizontal drag-scroll track) ------------------

  const setScrollRef = useCallback((element: HTMLDivElement | null) => {
    scrollElRef.current = element;
  }, []);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
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

  function openNode(entry: CommunityEntry) {
    if (suppressClickRef.current) {
      return;
    }
    onOpenFriend(entry.authorId);
  }

  if (connectTab === "timeline") {
    const isEmpty = timelineEntries.length === 0;
    const trackKey = `ctcat-${CT_CATS.filter(([type]) => visible[type]).map(([type]) => type).join("")}`;
    const scrollStyle: CSSProperties = {
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
    };
    const trackStyle: CSSProperties = {
      flexShrink: 0,
      minWidth: "100%",
      position: "relative",
      width: PAD * 2 + Math.max(1, timelineEntries.length) * SLOT,
    };

    return (
      <div className="flex min-h-0 flex-1 flex-col bg-canvas" style={{ padding: "22px clamp(20px,4vw,52px) 14px" }}>
        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="mb-3 flex flex-col items-start gap-[14px]">
            <h1 className="m-0 font-display font-semibold text-content" style={{ fontSize: "clamp(24px,3vw,32px)", letterSpacing: "-0.022em" }}>
              Community Timeline
            </h1>
            <div className="flex flex-wrap items-center gap-[9px]">
              {CT_CATS.map(([type, label]) => {
                const meta = ENTRY_TYPES[type];
                const on = visible[type];
                return (
                  <button
                    aria-checked={on}
                    className="inline-flex cursor-pointer items-center gap-[9px] rounded-full text-[14px] font-semibold transition-all"
                    key={type}
                    onClick={() => setVisible((current) => ({ ...current, [type]: !current[type] }))}
                    role="checkbox"
                    style={{
                      background: on ? meta.tint : "var(--card)",
                      border: `1px solid ${on ? meta.color : "var(--border-strong)"}`,
                      color: on ? "var(--text)" : "var(--muted2)",
                      padding: "8px 15px 8px 11px",
                    }}
                    type="button"
                  >
                    <Icon name={meta.icon} style={{ color: on ? meta.color : "var(--muted2)", fontSize: 18 }} weight="duotone" /> {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 flex-col">
            <div
              className="gr-scroll"
              onKeyDown={onKeyDownTrack}
              onPointerDown={onPointerDown}
              onPointerLeave={onPointerUp}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              ref={setScrollRef}
              style={scrollStyle}
              tabIndex={0}
            >
              <div key={trackKey} style={trackStyle}>
                {timelineEntries.map((entry, index) => {
                  const label = `${MONTHS[entry.month]} ${entry.day} ’${String(entry.year).slice(2)}`;
                  return (
                    <div key={`g-${entry.id}`}>
                      <div
                        style={{
                          background: index === 0 ? "transparent" : "color-mix(in srgb, var(--accent) 9%, transparent)",
                          bottom: 24,
                          left: PAD + index * SLOT,
                          position: "absolute",
                          top: 24,
                          width: 1,
                        }}
                      />
                      <div
                        className="uppercase"
                        style={{
                          bottom: 33,
                          color: "#b0b0b5",
                          fontSize: 11.5,
                          fontWeight: 600,
                          left: PAD + index * SLOT + SLOT / 2,
                          letterSpacing: ".04em",
                          position: "absolute",
                          transform: "translateX(-50%)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {label}
                      </div>
                    </div>
                  );
                })}
                {/* trailing guide line closing the last slot */}
                <div
                  style={{
                    background: "color-mix(in srgb, var(--accent) 9%, transparent)",
                    bottom: 24,
                    left: PAD + timelineEntries.length * SLOT,
                    position: "absolute",
                    top: 24,
                    width: 1,
                  }}
                />

                <div style={{ background: "var(--timeline)", borderRadius: 999, bottom: 67, height: 6, left: 0, opacity: 0.95, position: "absolute", right: 0 }} />

                {timelineEntries.map((entry, index) => {
                  const meta = ENTRY_TYPES[entry.type];
                  const isAns = entry.type === "prayer" && Boolean(entry.answered);
                  const title = entry.type === "verse" ? entry.ref ?? "" : entry.title;
                  const snippet = entry.type === "verse" ? truncate(entry.verseText, 72) : truncate(entry.body, 72);
                  return (
                    <div key={entry.id} style={{ bottom: 0, left: PAD + (index + 0.5) * SLOT, position: "absolute", top: 0, width: 0 }}>
                      <div
                        style={{
                          background: isAns ? "color-mix(in srgb, var(--accent) 60%, transparent)" : "var(--border-strong)",
                          borderRadius: 999,
                          bottom: 70,
                          height: 42,
                          left: "50%",
                          position: "absolute",
                          transform: "translateX(-50%)",
                          width: 3,
                          zIndex: 1,
                        }}
                      />
                      <div
                        style={{
                          background: "var(--card)",
                          border: "5px solid var(--border-strong)",
                          borderRadius: 999,
                          bottom: 70,
                          height: 22,
                          left: "50%",
                          position: "absolute",
                          transform: "translate(-50%,50%)",
                          width: 22,
                          zIndex: 3,
                        }}
                      />
                      <div
                        aria-label={`${entry.authorName} — ${entry.type}: ${entry.title || entry.body || entry.ref || ""}`}
                        className="gr-card"
                        onClick={() => openNode(entry)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openNode(entry);
                          }
                        }}
                        role="button"
                        style={{
                          animation: "gr-rise .5s cubic-bezier(.22,.61,.36,1) backwards",
                          animationDelay: `${index * 0.05}s`,
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: 18,
                          bottom: 114,
                          boxShadow: "none",
                          cursor: "pointer",
                          left: "50%",
                          padding: "13px 15px",
                          position: "absolute",
                          transform: "translateX(-50%)",
                          width: 214,
                          zIndex: 2,
                        }}
                        tabIndex={0}
                      >
                        <div className="flex items-center gap-[9px]">
                          <Avatar background="var(--accent)" border="2px solid var(--ring)" fontSize={11} initials={entry.authorInitials} size={28} />
                          <span className="min-w-0 truncate text-[13.5px] font-semibold text-content">{entry.authorName}</span>
                          <div
                            className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full text-base"
                            style={{ background: meta.tint, color: meta.color, marginLeft: "auto" }}
                          >
                            <Icon name={meta.icon} weight="duotone" />
                          </div>
                        </div>
                        {title ? <div className="mt-2 text-sm font-semibold leading-[1.25] text-content">{title}</div> : null}
                        {entry.type === "verse" ? (
                          <div className="mt-1 font-display text-[12.5px] italic leading-[1.4] text-subtle">{snippet}</div>
                        ) : (
                          <div className="mt-1 text-[12.5px] leading-[1.4] text-subtle">{snippet}</div>
                        )}
                        {isAns ? (
                          <div
                            className="mt-2 inline-flex items-center gap-[5px] rounded-full px-[10px] py-[3px] text-[11px] font-semibold"
                            style={{ background: "var(--accent)", color: "#fff" }}
                          >
                            <Icon name="ph-check-circle" weight="fill" /> Answered
                          </div>
                        ) : null}
                        <div className="mt-[11px] flex flex-wrap gap-[6px]">
                          {CT_REACTIONS.map((reaction) => {
                            const mapKey = `${entry.id}:${reaction.key}`;
                            const on = Boolean(nodeReacted[mapKey]);
                            const count = entry.reactions[reaction.key] + (on ? 1 : 0);
                            return (
                              <button
                                aria-pressed={on}
                                className="inline-flex cursor-pointer items-center gap-[4px] rounded-full text-[11px] font-semibold transition-[background,border-color,transform] duration-200 ease-[cubic-bezier(.22,.61,.36,1)] active:scale-[.9]"
                                key={reaction.key}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  toggleNodeReaction(mapKey);
                                }}
                                style={
                                  on
                                    ? { background: "color-mix(in srgb, var(--accent) 12%, transparent)", border: "1px solid var(--accent)", color: "var(--accent)", padding: "3px 9px" }
                                    : { background: "var(--input)", border: "1px solid var(--border)", color: "var(--muted)", padding: "3px 9px" }
                                }
                                type="button"
                              >
                                <Icon name={reaction.icon} style={{ color: reaction.iconColor }} weight="fill" />
                                {count > 0 ? count : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {isEmpty ? (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <Icon name="ph-users-three" style={{ color: "#b0b0b5", fontSize: 40 }} weight="duotone" />
                <div className="mt-[10px] font-display text-xl text-subtle">Nothing to show</div>
                <div className="mt-1 text-[13.5px] text-subtle-2">Turn a category back on to see entries.</div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="gr-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-canvas">
      <div className="px-[clamp(20px,4vw,52px)] pb-16 pt-[26px]">
        {connectTab === "groups" ? (
          <section className="mb-3">
            {heading("Community Groups", "Find a place to belong")}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4 p-[4px_2px_14px]">
              {GROUPS.map((group, i) => {
                const isJoined = joined.includes(group.id);
                return (
                  <div
                    className={`${CARD} flex flex-col gap-[12px] p-[18px] transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(.22,.61,.36,1)] hover:-translate-y-1 hover:border-edge-strong hover:shadow-[0_16px_34px_-16px_rgba(0,0,0,.26)]`}
                    key={group.id}
                    style={{ animation: "gr-cardin .5s cubic-bezier(.22,1,.36,1) backwards", animationDelay: `${i * 0.04}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-[14px] text-[24px]"
                        style={{ background: `color-mix(in srgb, ${group.color} 15%, transparent)`, color: group.color }}
                      >
                        <Icon name={group.icon} weight="duotone" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[15.5px] font-semibold leading-tight text-content">{group.name}</div>
                        <div className="mt-[2px] text-xs text-subtle-2">{(group.members + (isJoined ? 1 : 0)).toLocaleString()} members</div>
                      </div>
                    </div>
                    <div className="flex-1 text-[13px] leading-[1.45] text-subtle">{group.blurb}</div>
                    <button
                      className="inline-flex w-full cursor-pointer items-center justify-center gap-[6px] rounded-[11px] py-[9px] text-[13px] font-semibold transition-[filter,transform,background,border-color] duration-200 ease-[cubic-bezier(.22,.61,.36,1)] hover:brightness-[.95] active:scale-[.98]"
                      onClick={() => toggleGroup(group.id, group.name)}
                      style={
                        isJoined
                          ? { background: "transparent", border: "1px solid var(--border-strong)", color: "var(--muted)" }
                          : { background: group.color, border: `1px solid ${group.color}`, color: "#fff" }
                      }
                      type="button"
                    >
                      <Icon name={isJoined ? "ph-check" : "ph-plus"} weight="bold" /> {isJoined ? "Joined" : "Join"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {connectTab === "feed" ? (
          <section className="min-w-0 flex-1">
            {heading("Community Feed", "Encourage one another")}
            <div className={`${CARD} mb-5 p-[16px_18px]`}>
              <div className="flex items-start gap-[13px]">
                <Avatar background="var(--accent)" border="2px solid var(--ring)" fontSize={15} initials="MB" size={40} />
                <textarea
                  className="min-w-0 flex-1 resize-none border-none bg-transparent pt-2 text-[14.5px] leading-[1.5] text-content outline-none"
                  onChange={(event) => setTopDraft(event.target.value)}
                  placeholder="Share a verse, a praise, or a word of encouragement…"
                  rows={2}
                  value={topDraft}
                />
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  className="inline-flex cursor-pointer items-center gap-[7px] rounded-full border-none bg-[var(--timeline)] px-[18px] py-[9px] text-[13.5px] font-semibold text-white transition-colors hover:bg-[var(--timeline-strong)]"
                  onClick={shareTop}
                  type="button"
                >
                  <Icon name="ph-paper-plane-tilt" weight="bold" /> Share
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-[18px]">
              {[...myShaped, ...communityShaped].map((post, index) => renderPost(post, index))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
