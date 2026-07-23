"use client";

import { Icon } from "@/components/Icon";
import { mediaThumbStyle } from "@/lib/media";
import type { MediaItem } from "@/types/tree";

interface Props {
  initials: string;
  name: string;
  onClose: () => void;
  photos: Array<MediaItem>;
  text: string;
}

// Read-only view of a friend's testimony (design lines 882-906): hero with avatar + "Testimony" eyebrow
// + serif-display name, the story text, an optional photo grid, and a full-width Close button.
export function TestimonyReadModal({ initials, name, onClose, photos, text }: Props) {
  const gallery = photos.filter((item) => item.kind !== "video");
  const video = photos.find((item) => item.kind === "video") ?? null;

  return (
    <div className="fixed inset-0 z-[80] flex overflow-y-auto p-5">
      <div
        className="fixed inset-0 bg-black/[.44] backdrop-blur-[4px]"
        onClick={onClose}
        style={{ animation: "gr-fade .2s both" }}
      />
      <div
        className="relative m-auto w-[min(600px,100%)] overflow-hidden rounded-[18px] border border-edge bg-card"
        style={{ animation: "gr-pop .3s cubic-bezier(.22,.61,.36,1) both" }}
      >
        <div className="flex items-center gap-[14px] border-b border-divide bg-field p-[22px_28px]">
          <div className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-[16px] border-[3px] border-[var(--ring)] bg-accent text-base font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-[.14em] text-accent">Testimony</div>
            <div className="font-display text-[22px] font-semibold leading-[1.1] text-content">{name}</div>
          </div>
          <button
            className="flex h-[38px] w-[38px] flex-none cursor-pointer items-center justify-center rounded-full border border-edge bg-card text-lg text-subtle transition-colors hover:bg-canvas"
            onClick={onClose}
            type="button"
          >
            <Icon name="ph-x" weight="bold" />
          </button>
        </div>

        <div className="p-[22px_28px_28px]">
          {video ? (
            <video className="mb-5 block max-h-[340px] w-full rounded-[16px] bg-black" controls src={video.url} />
          ) : null}

          <div className="whitespace-pre-wrap text-[18px] leading-[1.66] text-content-soft">{text}</div>

          {gallery.length ? (
            <div className="mt-5 grid grid-cols-2 gap-[10px]">
              {gallery.map((item, index) => (
                <div key={index} style={mediaThumbStyle(item)} />
              ))}
            </div>
          ) : null}

          <button
            className="mt-[22px] w-full cursor-pointer rounded-[14px] border-[1.5px] border-accent/30 bg-card p-[13px] text-[14.5px] font-semibold text-accent transition-colors hover:border-accent hover:bg-accent/[.06]"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
