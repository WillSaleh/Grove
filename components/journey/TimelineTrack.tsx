"use client";

import type { CSSProperties, KeyboardEvent, PointerEvent, UIEvent } from "react";

import { Icon } from "@/components/Icon";
import { Bloom } from "@/components/journey/Bloom";
import type { TimelineNode } from "@/lib/timeline";

export type TrackMonth = {
  bandStyle: CSSProperties;
  guideStyle: CSSProperties;
  labelStyle: CSSProperties;
  month: number | null; // set (and clickable → zoom in) in year mode; null for month-mode day markers
  name: string;
};

interface Props {
  axisStyle: CSSProperties;
  emptySub: string;
  emptyText: string;
  isEmpty: boolean;
  nodes: Array<TimelineNode>;
  onKeyDownTrack: (event: KeyboardEvent<HTMLDivElement>) => void;
  onOpenEntry: (id: string) => void;
  onOpenMonth: (month: number) => void;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: () => void;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
  scrollRef: (element: HTMLDivElement | null) => void;
  scrollStyle: CSSProperties;
  trackKey: string;
  trackMonths: Array<TrackMonth>;
  trackStyle: CSSProperties;
}

const PHOTO_IMG_STYLE: CSSProperties = {
  border: "1px solid #e4ddd0",
  borderRadius: 12,
  display: "block",
  height: "auto",
  width: "100%",
};

const PHOTO_PLACEHOLDER_STYLE: CSSProperties = {
  aspectRatio: "16/9",
  background: "#f2f2f4",
  border: "1px solid #e4ddd0",
  borderRadius: 12,
  width: "100%",
};

export function TimelineTrack({
  axisStyle,
  emptySub,
  emptyText,
  isEmpty,
  nodes,
  onKeyDownTrack,
  onOpenEntry,
  onOpenMonth,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onScroll,
  scrollRef,
  scrollStyle,
  trackKey,
  trackMonths,
  trackStyle,
}: Props) {
  function openNode(node: TimelineNode) {
    if (node.isOverflow && node.overflowMonth !== null) {
      onOpenMonth(node.overflowMonth);
      return;
    }
    if (node.entryId) {
      onOpenEntry(node.entryId);
    }
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col pt-2">
      <div
        className="gr-scroll"
        onKeyDown={onKeyDownTrack}
        onPointerDown={onPointerDown}
        onPointerLeave={onPointerUp}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onScroll={onScroll}
        ref={scrollRef}
        style={scrollStyle}
        tabIndex={0}
      >
        <div key={trackKey} style={trackStyle}>
          {trackMonths.map((track, index) => (
            <div key={`m-${index}`}>
              <div
                className="gr-band"
                onClick={track.month === null ? undefined : () => onOpenMonth(track.month as number)}
                style={track.bandStyle}
              />
              <div style={track.guideStyle} />
              {track.month === null ? (
                <div style={track.labelStyle}>{track.name}</div>
              ) : (
                <button
                  className="border-none bg-transparent p-0"
                  onClick={() => onOpenMonth(track.month as number)}
                  style={track.labelStyle}
                  type="button"
                >
                  {track.name}
                </button>
              )}
            </div>
          ))}

          <div style={axisStyle} />

          {nodes.map((node) => (
            <div key={node.id} style={node.wrapStyle}>
              <div style={node.stemStyle} />
              <div style={node.dotStyle} />
              <div
                aria-label={node.ariaLabel}
                className={node.compact ? "gr-card" : "gr-card gr-card-lift"}
                onClick={() => openNode(node)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openNode(node);
                  }
                }}
                role="button"
                style={node.cardStyle}
                tabIndex={0}
              >
                {node.hasPhoto ? (
                  node.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- user-supplied object-URL previews
                    <img alt="" src={node.photoUrl} style={PHOTO_IMG_STYLE} />
                  ) : (
                    <div style={PHOTO_PLACEHOLDER_STYLE} />
                  )
                ) : null}

                <div
                  style={{
                    alignItems: "center",
                    display: "flex",
                    gap: node.compact ? 0 : 9,
                    marginTop: !node.compact && node.hasPhoto ? 10 : 0,
                  }}
                >
                  <div style={node.iconChipStyle}>
                    {node.isOverflow ? (
                      <span className="text-[13px] font-bold tracking-[-.02em] text-white">{node.overflowText}</span>
                    ) : (
                      <Icon name={node.iconName} weight="duotone" />
                    )}
                  </div>
                  {node.showTypeLabel ? <span style={node.labelStyle}>{node.typeLabel}</span> : null}
                  {node.showHoverTitle ? <span className="gr-titlepill">{node.title}</span> : null}
                </div>

                {node.showTitle ? (
                  <div className="mt-2 text-sm font-semibold leading-[1.25] text-ink">{node.title}</div>
                ) : null}

                {node.isVerse ? (
                  <div className="mt-1 font-display text-[12.5px] italic leading-[1.4] text-muted">{node.snippet}</div>
                ) : null}

                {node.showBody ? <div className="mt-1 text-[12.5px] leading-[1.4] text-muted">{node.snippet}</div> : null}

                {node.answered ? (
                  <div style={node.badgeStyle}>
                    <Icon name="ph-check-circle" weight="fill" /> Answered
                  </div>
                ) : null}

                {node.showDate ? <div className="mt-[6px] text-[11.5px] text-muted-2">{node.dateLabel}</div> : null}
              </div>

              {node.blooming ? (
                <div style={{ bottom: 70, left: "50%", pointerEvents: "none", position: "absolute", zIndex: 6 }}>
                  <Bloom />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {isEmpty ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <Icon className="text-[40px] text-faint" name="ph-plant" weight="duotone" />
          <div className="mt-[10px] font-display text-xl text-muted">{emptyText}</div>
          <div className="mt-1 text-[13.5px] text-muted-2">{emptySub}</div>
        </div>
      ) : null}
    </div>
  );
}
