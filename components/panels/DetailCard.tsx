"use client";

import type { CSSProperties } from "react";

import { Icon } from "@/components/Icon";
import { Bloom } from "@/components/journey/Bloom";
import { ENTRY_TYPES } from "@/lib/entryTypes";
import { mediaThumbStyle } from "@/lib/media";
import { formatLongDate } from "@/lib/timeline";
import type { Entry } from "@/types/tree";

export type DetailComment = { initials: string; name: string; text: string };
export type DetailReactions = { amen: number; heart: number; pray: number };

interface Props {
  blooming: boolean;
  closing: boolean;
  comments?: Array<DetailComment>;
  entry: Entry | null;
  onClose: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onReact?: (key: keyof DetailReactions) => void;
  onToggleAnswered?: () => void;
  reacted?: Partial<Record<keyof DetailReactions, boolean>>;
  reactions?: DetailReactions;
  // Read-only "viewing a friend's entry" mode: hides edit/delete, shows a static prayer status, and
  // renders the social layer (reactions + comments) instead of the owner's action buttons.
  readOnly?: boolean;
}

const LABEL_CLASS = "text-[11px] font-semibold uppercase tracking-[.08em] text-subtle-2";

const REACTION_META: Array<{ icon: string; key: keyof DetailReactions; label: string }> = [
  { icon: "ph-hands-clapping", key: "amen", label: "Amen" },
  { icon: "ph-heart", key: "heart", label: "Love" },
  { icon: "ph-hands-praying", key: "pray", label: "Pray" },
];

export function DetailCard({ blooming, closing, comments, entry, onClose, onDelete, onEdit, onReact, onToggleAnswered, reacted, reactions, readOnly = false }: Props) {
  if (!entry) {
    return null;
  }

  const meta = ENTRY_TYPES[entry.type];
  const isVerse = entry.type === "verse";
  const isPrayer = entry.type === "prayer";
  const answered = Boolean(entry.answered);
  const hasMedia = Boolean(entry.media && entry.media.length);

  // Non-modal floating panel: no dimming backdrop, the timeline stays interactive behind it.
  const panelBase: CSSProperties = {
    background: "color-mix(in srgb, var(--glass) 72%, transparent)",
    backdropFilter: "blur(28px) saturate(180%)",
    WebkitBackdropFilter: "blur(28px) saturate(180%)",
    border: "1px solid color-mix(in srgb, var(--glass) 60%, transparent)",
    borderRadius: 24,
    bottom: 20,
    boxShadow: "0 24px 60px rgba(0,0,0,.2), inset 0 1px 0 color-mix(in srgb, var(--glass) 60%, transparent)",
    overflowY: "auto",
    pointerEvents: "auto",
    position: "fixed",
    right: 20,
    top: 20,
    width: "min(380px,92vw)",
  };
  const panelStyle: CSSProperties = closing
    ? { ...panelBase, opacity: 0, transition: "opacity .22s ease" }
    : { ...panelBase, animation: "gr-dissolve .26s ease both" };

  return (
    <div className="fixed inset-0 z-[60]" style={{ pointerEvents: "none" }}>
      <div style={panelStyle}>
        <div style={{ background: meta.tint, borderBottom: "1px solid var(--divider)", padding: "24px 26px 22px" }}>
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-[10px]">
              <div
                style={{
                  alignItems: "center",
                  background: meta.tint,
                  borderRadius: 13,
                  color: meta.color,
                  display: "flex",
                  flex: "0 0 auto",
                  fontSize: 21,
                  height: 40,
                  justifyContent: "center",
                  width: 40,
                }}
              >
                <Icon name={meta.icon} weight="duotone" />
              </div>
              <span
                style={{ color: meta.color, fontSize: 12, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase" }}
              >
                {meta.label}
              </span>
            </div>
            <button
              className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border border-edge bg-card text-lg text-subtle transition-colors hover:bg-canvas hover:text-content"
              onClick={onClose}
              type="button"
            >
              <Icon name="ph-x" weight="bold" />
            </button>
          </div>
          <div className="mt-[15px] font-display text-[22px] font-semibold leading-[1.18] tracking-[-.02em] text-content">
            {isVerse ? entry.ref : entry.title}
          </div>
          <div className="mt-2 inline-flex items-center gap-[7px] text-[12.5px] text-subtle-2">
            <Icon name="ph-calendar-blank" /> {formatLongDate(entry.year, entry.month, entry.day)}
          </div>
        </div>

        <div className="px-[26px] pb-[30px] pt-[22px]">
          {isVerse ? (
            <div className="rounded-[18px] border border-accent/[.16] bg-accent/[.06] px-[22px] py-5">
              <Icon name="ph-quotes" style={{ color: "#9dc3ec", fontSize: 22 }} weight="fill" />
              <div className="mt-[6px] font-serif text-[19.5px] italic leading-[1.55] tracking-[-.01em] text-content">
                {entry.verseText}
              </div>
              <div className="mt-3 text-[13px] font-semibold tracking-[.02em] text-accent">
                {entry.ref} <span className="font-semibold text-subtle-2">· {entry.translation}</span>
              </div>
            </div>
          ) : null}

          {isVerse && entry.note ? (
            <>
              <div className={`${LABEL_CLASS} mt-5 mb-[7px]`}>Personal note</div>
              <div className="text-[15px] leading-[1.65] text-content-soft">{entry.note}</div>
            </>
          ) : null}

          {!isVerse && entry.body ? (
            <div className="text-[16px] leading-[1.65] text-content-soft">{entry.body}</div>
          ) : null}

          {isPrayer ? (
            <div
              style={{
                background: answered
                  ? "color-mix(in srgb, var(--accent) 8%, transparent)"
                  : "color-mix(in srgb, var(--accent) 5%, transparent)",
                border: `1px solid ${answered ? "color-mix(in srgb, var(--accent) 28%, transparent)" : "color-mix(in srgb, var(--accent) 16%, transparent)"}`,
                borderRadius: 16,
                marginTop: 20,
                padding: "15px 16px",
                position: "relative",
                transition: "all .3s",
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-content">{answered ? "Answered prayer" : "Still praying"}</div>
                  <div className="mt-0.5 text-[12.5px] text-subtle">
                    {readOnly
                      ? answered
                        ? "God moved in this one"
                        : "Being carried in prayer"
                      : answered
                        ? "Tap to mark as still praying"
                        : "Tap when God answers"}
                  </div>
                </div>
                {readOnly ? (
                  <div
                    className="inline-flex flex-none items-center gap-[6px] rounded-full px-3 py-[6px] text-xs font-semibold"
                    style={
                      answered
                        ? { background: "var(--accent)", color: "#fff" }
                        : { background: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)" }
                    }
                  >
                    <Icon name={answered ? "ph-check-circle" : "ph-hands-praying"} weight="fill" />
                    {answered ? "Answered" : "Ongoing"}
                  </div>
                ) : (
                  <div
                    onClick={onToggleAnswered}
                    style={{
                      background: answered ? "var(--accent)" : "var(--border-strong)",
                      borderRadius: 999,
                      cursor: "pointer",
                      flex: "0 0 auto",
                      height: 30,
                      position: "relative",
                      transition: "background .25s",
                      width: 52,
                    }}
                  >
                    <div
                      style={{
                        background: "var(--card)",
                        borderRadius: 999,
                        height: 24,
                        left: answered ? 25 : 3,
                        position: "absolute",
                        top: 3,
                        transition: "left .25s cubic-bezier(.22,.61,.36,1)",
                        width: 24,
                      }}
                    />
                  </div>
                )}
              </div>
              {answered ? (
                <div className="mt-[14px] border-t border-accent/[.18] pt-[14px]">
                  <div className="mb-[6px] text-[11px] font-semibold uppercase tracking-[.08em] text-accent">
                    How it was answered
                  </div>
                  <div className="font-display text-[15.5px] italic leading-[1.55] text-content">
                    {entry.answeredNote || "A note about how God moved."}
                  </div>
                </div>
              ) : null}
              {blooming ? (
                <div style={{ left: "50%", pointerEvents: "none", position: "absolute", top: "50%", zIndex: 5 }}>
                  <Bloom />
                </div>
              ) : null}
            </div>
          ) : null}

          {hasMedia ? (
            <>
              <div className={`${LABEL_CLASS} mt-[22px] mb-[9px]`}>Gallery</div>
              <div className="grid grid-cols-2 gap-[10px]">
                {(entry.media ?? []).map((item, index) => (
                  <div key={index} style={mediaThumbStyle(item)}>
                    {item.kind === "video" ? (
                      <div
                        className="absolute inset-0 flex items-center justify-center text-3xl text-white"
                        style={{ textShadow: "0 2px 8px rgba(0,0,0,.4)" }}
                      >
                        <Icon name="ph-play-circle" weight="fill" />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {readOnly ? (
            <>
              {reactions ? (
                <div className="mt-[22px] flex flex-wrap gap-[7px]">
                  {REACTION_META.map((reaction) => {
                    const on = Boolean(reacted?.[reaction.key]);
                    const count = reactions[reaction.key] + (on ? 1 : 0);
                    return (
                      <button
                        aria-pressed={on}
                        className="inline-flex cursor-pointer items-center gap-[6px] rounded-full border px-[13px] py-[7px] text-[13px] font-semibold transition-[background,border-color,color,transform] duration-200 ease-[cubic-bezier(.22,.61,.36,1)] active:scale-[.94]"
                        key={reaction.key}
                        onClick={() => onReact?.(reaction.key)}
                        style={
                          on
                            ? { background: "color-mix(in srgb, var(--accent) 12%, transparent)", borderColor: "var(--accent)", color: "var(--accent)" }
                            : { background: "var(--bg)", borderColor: "var(--border)", color: "var(--muted)" }
                        }
                        title={reaction.label}
                        type="button"
                      >
                        <Icon className={on ? "text-accent" : "text-subtle-2"} name={reaction.icon} weight="fill" /> {count}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {comments && comments.length ? (
                <div className="mt-[18px] flex flex-col gap-[11px] border-t border-divide pt-[16px]">
                  {comments.map((comment, index) => (
                    <div className="flex items-start gap-[10px]" key={index}>
                      <div className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full border-2 border-[var(--ring)] bg-accent text-[11px] font-semibold text-white">
                        {comment.initials}
                      </div>
                      <div className="min-w-0 flex-1 rounded-[14px] bg-canvas px-[13px] py-[9px]">
                        <div className="text-[12.5px] font-semibold text-content">{comment.name}</div>
                        <div className="mt-0.5 text-[13.5px] leading-[1.45] text-content-soft">{comment.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div className="mt-[26px] flex gap-[10px]">
              <button
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-accent/35 bg-card p-[13px] text-[14.5px] font-semibold text-accent transition-colors hover:border-accent hover:bg-accent/[.07]"
                onClick={onEdit}
                type="button"
              >
                <Icon name="ph-pencil-simple" weight="bold" /> Edit
              </button>
              <button
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-type-gratitude/[.28] bg-card px-[18px] py-[13px] text-[14.5px] font-semibold text-type-gratitude transition-colors hover:border-type-gratitude hover:bg-type-gratitude/[.07]"
                onClick={onDelete}
                type="button"
              >
                <Icon name="ph-trash" weight="bold" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
