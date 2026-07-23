"use client";

import { Icon } from "@/components/Icon";
import { ACCENT_SWATCHES, useTheme } from "@/lib/useTheme";
import type { ThemeChoice } from "@/lib/useTheme";

const THEME_SEG: Array<{ icon: string; label: string; value: ThemeChoice }> = [
  { icon: "ph-sun", label: "Light", value: "light" },
  { icon: "ph-circle-half", label: "Auto", value: "auto" },
  { icon: "ph-moon-stars", label: "Dark", value: "dark" },
];

export function AppearanceControls() {
  const { accent, setAccent, setTheme, theme } = useTheme();

  return (
    <div>
      <div className="px-[10px] pb-2 pt-[2px] text-[11px] font-bold uppercase tracking-[.11em] text-subtle-2">
        Appearance
      </div>

      <div className="mx-[6px] mb-3 flex gap-[3px] rounded-[13px] bg-field p-[3px]">
        {THEME_SEG.map((seg) => {
          const active = theme === seg.value;
          return (
            <button
              className={`flex flex-1 cursor-pointer items-center justify-center gap-[7px] rounded-[10px] border-none px-[6px] py-[9px] text-[13px] font-semibold transition-all duration-200 ${
                active ? "bg-card text-accent shadow-[var(--shadow-1)]" : "bg-transparent text-subtle"
              }`}
              key={seg.value}
              onClick={() => setTheme(seg.value)}
              type="button"
            >
              <Icon name={seg.icon} style={{ fontSize: 16 }} weight="duotone" /> {seg.label}
            </button>
          );
        })}
      </div>

      <div className="px-[10px] pb-2 text-xs text-subtle">Accent color</div>
      <div className="flex flex-wrap gap-[11px] px-[10px] pb-1">
        {ACCENT_SWATCHES.map((color) => {
          const selected = accent.toLowerCase() === color.toLowerCase();
          return (
            <button
              aria-label={`Accent color ${color}`}
              className="h-[30px] w-[30px] flex-none cursor-pointer rounded-full border-2 border-[var(--card)] transition-[transform,box-shadow] duration-150 hover:scale-[1.12]"
              key={color}
              onClick={() => setAccent(color)}
              style={{ background: color, boxShadow: `0 0 0 ${selected ? `2px ${color}` : "1px var(--border-strong)"}` }}
              type="button"
            />
          );
        })}
      </div>
    </div>
  );
}
