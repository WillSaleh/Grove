"use client";

import type { CSSProperties } from "react";

import { Icon } from "@/components/Icon";
import { Bloom } from "@/components/journey/Bloom";
import { ENTRY_TYPES } from "@/lib/entryTypes";
import { mediaThumbStyle } from "@/lib/media";
import { formatLongDate } from "@/lib/timeline";
import type { Entry } from "@/types/tree";

interface Props {
  blooming: boolean;
  closing: boolean;
  entry: Entry | null;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onToggleAnswered: () => void;
}

const LABEL_CLASS = "mb-[6px] text-[11px] font-semibold uppercase tracking-[.08em] text-muted-2";

export function DetailCard({ blooming, closing, entry, onClose, onDelete, onEdit, onToggleAnswered }: Props) {
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
    background: "rgba(255,255,255,.72)",
    backdropFilter: "blur(28px) saturate(180%)",
    WebkitBackdropFilter: "blur(28px) saturate(180%)",
    border: "1px solid rgba(255,255,255,.6)",
    borderRadius: 24,
    bottom: 20,
    boxShadow: "0 24px 60px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.6)",
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
        <div style={{ background: meta.tint, borderBottom: "1px solid #ece5d9", padding: "24px 26px 22px" }}>
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-[10px]">
              <div
                style={{
                  alignItems: "center",
                  background: meta.tint,
                  borderRadius: 13,
                  color: meta.color,
                  display: "flex",
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
              className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border border-line bg-white text-lg text-muted transition-colors hover:bg-parchment-deep hover:text-ink"
              onClick={onClose}
              type="button"
            >
              <Icon name="ph-x" weight="bold" />
            </button>
          </div>
          <div className="mt-[15px] font-display text-[22px] font-semibold leading-[1.18] tracking-[-.02em] text-ink">
            {isVerse ? entry.ref : entry.title}
          </div>
          <div className="mt-2 inline-flex items-center gap-[7px] text-[12.5px] text-muted-2">
            <Icon name="ph-calendar-blank" /> {formatLongDate(entry.year, entry.month, entry.day)}
          </div>
        </div>

        <div className="px-[26px] pb-[30px] pt-[22px]">
          {isVerse ? (
            <div className="rounded-[18px] border border-brand/[.16] bg-brand/[.06] px-[22px] py-5">
              <Icon name="ph-quotes" style={{ color: "#9dc3ec", fontSize: 22 }} weight="fill" />
              <div className="mt-[6px] font-display text-[18.5px] italic leading-[1.55] tracking-[-.01em] text-ink">
                {entry.verseText}
              </div>
              <div className="mt-3 text-[13px] font-semibold tracking-[.02em] text-brand">
                {entry.ref} <span className="font-semibold text-muted-2">· {entry.translation}</span>
              </div>
            </div>
          ) : null}

          {isVerse && entry.note ? (
            <>
              <div className={`${LABEL_CLASS} mt-5`}>Personal note</div>
              <div className="text-[15px] leading-[1.65] text-body-text">{entry.note}</div>
            </>
          ) : null}

          {!isVerse && entry.body ? (
            <div className="text-[16px] leading-[1.65] text-body-text">{entry.body}</div>
          ) : null}

          {isPrayer ? (
            <div
              style={{
                background: answered ? "rgba(74,87,89,.08)" : "rgba(74,87,89,.05)",
                border: `1px solid ${answered ? "rgba(74,87,89,.28)" : "rgba(74,87,89,.16)"}`,
                borderRadius: 16,
                marginTop: 20,
                padding: "15px 16px",
                position: "relative",
                transition: "all .3s",
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-ink">{answered ? "Answered prayer" : "Still praying"}</div>
                  <div className="mt-px text-[12.5px] text-muted">
                    {answered ? "Tap to mark as still praying" : "Tap when God answers"}
                  </div>
                </div>
                <div
                  onClick={onToggleAnswered}
                  style={{
                    background: answered ? "#4a5759" : "#d7cfc1",
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
                      background: "#fff",
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
              </div>
              {answered ? (
                <div className="mt-[14px] border-t border-brand/[.18] pt-[14px]">
                  <div className="mb-[6px] text-[11px] font-semibold uppercase tracking-[.08em] text-brand">
                    How it was answered
                  </div>
                  <div className="font-display text-[15.5px] italic leading-[1.55] text-ink">
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
              <div className={`${LABEL_CLASS} mt-[22px]`}>Gallery</div>
              <div className="grid grid-cols-2 gap-[10px]">
                {(entry.media ?? []).map((item, index) => (
                  <div key={index} style={mediaThumbStyle(item)}>
                    {item.kind === "video" ? (
                      <div className="absolute inset-0 flex items-center justify-center text-3xl text-white drop-shadow">
                        <Icon name="ph-play-circle" weight="fill" />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </>
          ) : null}

          <div className="mt-[26px] flex gap-[10px]">
            <button
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-brand/35 bg-white p-[13px] text-[14.5px] font-semibold text-brand transition-colors hover:border-brand hover:bg-brand/[.07]"
              onClick={onEdit}
              type="button"
            >
              <Icon name="ph-pencil-simple" weight="bold" /> Edit
            </button>
            <button
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-type-gratitude/[.28] bg-white px-[18px] py-[13px] text-[14.5px] font-semibold text-type-gratitude transition-colors hover:border-type-gratitude hover:bg-type-gratitude/[.07]"
              onClick={onDelete}
              type="button"
            >
              <Icon name="ph-trash" weight="bold" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
