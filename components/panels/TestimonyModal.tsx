"use client";

import { Icon } from "@/components/Icon";
import { mediaThumbStyle } from "@/lib/media";
import type { Testimony } from "@/types/tree";

interface Props {
  draft: Testimony;
  onAddPhotos: (files: FileList) => void;
  onCancel: () => void;
  onChangeText: (text: string) => void;
  onRemovePhoto: (index: number) => void;
  onRemoveVideo: () => void;
  onSave: () => void;
  onSetVideo: (files: FileList) => void;
}

const LABEL_CLASS = "mb-[10px] text-xs font-semibold uppercase tracking-[.06em] text-muted-2";

export function TestimonyModal({
  draft,
  onAddPhotos,
  onCancel,
  onChangeText,
  onRemovePhoto,
  onRemoveVideo,
  onSave,
  onSetVideo,
}: Props) {
  const saveEnabled = Boolean(draft.text.trim() || draft.video || draft.photos.length);

  return (
    <div className="fixed inset-0 z-[80] flex overflow-y-auto p-5">
      <div
        className="fixed inset-0 bg-black/[.44] backdrop-blur-[4px]"
        onClick={onCancel}
        style={{ animation: "gr-fade .2s both" }}
      />
      <div
        className="relative m-auto w-[min(600px,100%)] rounded-[18px] border border-line bg-white"
        style={{ animation: "gr-pop .3s cubic-bezier(.22,.61,.36,1) both" }}
      >
        <div className="p-[24px_26px_0]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-display text-[25px] font-semibold text-ink">Your testimony</div>
              <div className="mt-[3px] max-w-[430px] text-sm text-muted">
                The story of what God has done — written, spoken, or shown. Friends can read it from your journey.
              </div>
            </div>
            <button
              className="flex h-[38px] w-[38px] flex-none cursor-pointer items-center justify-center rounded-full border border-line bg-white text-lg text-muted transition-colors hover:bg-parchment"
              onClick={onCancel}
              type="button"
            >
              <Icon name="ph-x" weight="bold" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-[22px] p-[22px_26px_26px]">
          <div>
            <div className={LABEL_CLASS}>Your story</div>
            <textarea
              className="w-full rounded-2xl border-[1.5px] border-line-3 bg-white p-4 font-display text-base leading-[1.6] text-ink outline-none"
              onChange={(event) => onChangeText(event.target.value)}
              placeholder="Before I met Jesus…  ·  The turning point was…  ·  Today, He is…"
              rows={7}
              value={draft.text}
            />
          </div>

          <div>
            <div className={LABEL_CLASS}>Photos</div>
            <div className="flex flex-wrap items-center gap-3">
              {draft.photos.map((item, index) => (
                <div key={index} style={mediaThumbStyle(item, 80)}>
                  <div
                    className="absolute right-[5px] top-[5px] flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-black/[.62] text-xs text-white"
                    onClick={() => onRemovePhoto(index)}
                  >
                    <Icon name="ph-x" weight="bold" />
                  </div>
                </div>
              ))}
              <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-[14px] border-[1.5px] border-dashed border-line-3 text-2xl text-muted-2 transition-colors hover:border-brand hover:bg-brand/[.05] hover:text-brand">
                <Icon name="ph-plus" weight="bold" />
                <input
                  accept="image/*"
                  className="hidden"
                  multiple
                  onChange={(event) => {
                    if (event.target.files) {
                      onAddPhotos(event.target.files);
                    }
                    event.target.value = "";
                  }}
                  type="file"
                />
              </label>
            </div>
          </div>

          <div>
            <div className={LABEL_CLASS}>Video</div>
            {draft.video ? (
              <div className="relative overflow-hidden rounded-2xl border border-line-3 bg-black">
                <video className="block max-h-[320px] w-full" controls src={draft.video} />
                <button
                  className="absolute right-[10px] top-[10px] flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border-none bg-black/[.65] text-white"
                  onClick={onRemoveVideo}
                  type="button"
                >
                  <Icon name="ph-trash" weight="bold" />
                </button>
              </div>
            ) : (
              <label className="flex h-[180px] cursor-pointer flex-col items-center justify-center gap-[10px] rounded-2xl border-[1.5px] border-dashed border-line-3 text-center text-muted-2 transition-colors hover:border-brand hover:bg-brand/[.04] hover:text-brand">
                <Icon className="text-[34px]" name="ph-video-camera" weight="duotone" />
                <div className="text-[15px] font-semibold">Upload a video testimony</div>
                <div className="text-[12.5px] text-faint">It previews right here once attached</div>
                <input
                  accept="video/*"
                  className="hidden"
                  onChange={(event) => {
                    if (event.target.files) {
                      onSetVideo(event.target.files);
                    }
                    event.target.value = "";
                  }}
                  type="file"
                />
              </label>
            )}
          </div>

          <div className="flex gap-[10px]">
            <button
              className="flex-none cursor-pointer rounded-[14px] border-[1.5px] border-line-3 bg-white px-5 py-[13px] text-[14.5px] font-semibold text-muted transition-colors hover:bg-parchment"
              onClick={onCancel}
              type="button"
            >
              Cancel
            </button>
            <button
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-[14px] border-none p-[13px] text-[14.5px] font-semibold transition-all"
              disabled={!saveEnabled}
              onClick={onSave}
              style={
                saveEnabled
                  ? { background: "#4a5759", color: "#fff", cursor: "pointer" }
                  : { background: "#e7e0d3", color: "#b0b0b5", cursor: "not-allowed" }
              }
              type="button"
            >
              <Icon name="ph-hand-heart" weight="fill" /> Save testimony
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
