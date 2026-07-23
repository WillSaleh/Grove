"use client";

import type { ZoomLevel } from "@/types/tree";

interface Props {
  onSetZoom: (zoom: ZoomLevel) => void;
  zoom: ZoomLevel;
}

const SEG_BASE = "cursor-pointer rounded-full border-none px-[14px] py-[6px] text-[12.5px] font-semibold transition-colors";

export function ZoomControl({ onSetZoom, zoom }: Props) {
  function segClass(active: boolean) {
    return active ? `${SEG_BASE} bg-card text-accent` : `${SEG_BASE} bg-transparent text-subtle`;
  }

  return (
    <div className="z-40 mx-auto mb-[clamp(16px,3vw,26px)] mt-[6px] inline-flex flex-none items-center gap-3 self-center rounded-full border border-[color-mix(in_srgb,var(--glass)_60%,transparent)] bg-[color-mix(in_srgb,var(--glass)_55%,transparent)] p-[6px_7px] shadow-[0_8px_30px_rgba(0,0,0,.12),inset_0_1px_0_color-mix(in_srgb,var(--glass)_60%,transparent)] backdrop-blur-[24px] backdrop-saturate-[1.8]">
      <div className="flex rounded-full bg-[rgba(120,120,128,.16)] p-[3px]">
        <button className={segClass(zoom === "month")} onClick={() => onSetZoom("month")} type="button">
          Month
        </button>
        <button className={segClass(zoom === "year")} onClick={() => onSetZoom("year")} type="button">
          Year
        </button>
      </div>
    </div>
  );
}
