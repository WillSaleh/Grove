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
          className="flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-[14px] border border-white/60 bg-white/55 text-xl text-ink shadow-[0_4px_16px_rgba(0,0,0,.08),inset_0_1px_0_rgba(255,255,255,.6)] backdrop-blur-[24px] backdrop-saturate-[1.8] transition-colors hover:bg-white/85"
          onClick={onOpenSidebar}
          type="button"
        >
          <Icon name="ph-list" weight="bold" />
        </button>
        <button
          className="flex flex-none cursor-pointer items-center gap-[11px] border-none bg-transparent p-0"
          onClick={onGoHome}
          type="button"
        >
          <span className="font-logo text-2xl font-extrabold tracking-[-.02em] text-ink">YV Social</span>
        </button>
      </div>
    </nav>
  );
}
