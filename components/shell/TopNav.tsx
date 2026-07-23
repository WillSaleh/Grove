"use client";

import { Icon } from "@/components/Icon";

interface Props {
  onGoHome: () => void;
  onOpenSidebar: () => void;
}

export function TopNav({ onGoHome, onOpenSidebar }: Props) {
  return (
    <nav className="sticky top-0 z-50 bg-transparent">
      <div className="flex items-center gap-4 px-[clamp(20px,4vw,52px)] py-3">
        <button
          aria-label="Open menu"
          className="flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-[14px] text-xl text-content backdrop-blur-[24px] backdrop-saturate-[1.8] transition-[background] duration-[180ms]"
          onClick={onOpenSidebar}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = "color-mix(in srgb, var(--glass) 85%, transparent)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = "color-mix(in srgb, var(--glass) 55%, transparent)";
          }}
          style={{
            background: "color-mix(in srgb, var(--glass) 55%, transparent)",
            border: "1px solid color-mix(in srgb, var(--glass) 60%, transparent)",
            boxShadow: "0 4px 16px rgba(0,0,0,.08), inset 0 1px 0 color-mix(in srgb, var(--glass) 60%, transparent)",
          }}
          type="button"
        >
          <Icon name="ph-list" weight="bold" />
        </button>
        <button
          className="flex flex-none cursor-pointer items-center gap-[11px] border-none bg-transparent p-0"
          onClick={onGoHome}
          type="button"
        >
          <span className="font-logo text-2xl font-extrabold tracking-[-.02em] text-content">Thread</span>
        </button>
      </div>
    </nav>
  );
}
