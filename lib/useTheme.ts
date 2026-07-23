"use client";

import { useCallback, useSyncExternalStore } from "react";

// Appearance = a theme choice (light / auto / dark) + an accent color. Both persist to localStorage
// and are applied to <html> as attributes/inline CSS vars (the accent is auto-lightened in dark mode,
// matching the design). The pre-paint bootstrap script in the root layout applies the same on first load.
export type ThemeChoice = "light" | "auto" | "dark";

const THEME_KEY = "yv-theme";
const ACCENT_KEY = "yv-accent";
export const DEFAULT_ACCENT = "#01356D";
export const ACCENT_SWATCHES = [
  "#1C1C1E", "#6E6E73", "#01356D", "#016CA5", "#0396C7", "#04B7E7",
  "#90E0EF", "#0E7C86", "#3A5BA0", "#6B4EA0", "#2E6E4E", "#A24B6B",
];

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function readTheme(): ThemeChoice {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === "light" || stored === "dark" || stored === "auto" ? stored : "auto";
  } catch {
    return "auto";
  }
}

function readAccent(): string {
  try {
    return localStorage.getItem(ACCENT_KEY) ?? DEFAULT_ACCENT;
  } catch {
    return DEFAULT_ACCENT;
  }
}

function prefersDark(): boolean {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

function resolve(choice: ThemeChoice): "light" | "dark" {
  return choice === "auto" ? (prefersDark() ? "dark" : "light") : choice;
}

function hexToRgb(color: string): Array<number> {
  let hex = color.replace("#", "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

function rgbToHex(channels: Array<number>): string {
  return `#${channels.map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0")).join("")}`;
}

function lighten(color: string, amount: number): string {
  return rgbToHex(hexToRgb(color).map((value) => value + (255 - value) * amount));
}

function darken(color: string, amount: number): string {
  return rgbToHex(hexToRgb(color).map((value) => value * (1 - amount)));
}

function applyToDocument() {
  const resolved = resolve(readTheme());
  const accent = readAccent();
  const dark = resolved === "dark";
  const strong = dark ? lighten(accent, 0.2) : darken(accent, 0.24);
  const main = dark ? lighten(accent, 0.45) : accent;
  const style = document.documentElement.style;
  document.documentElement.setAttribute("data-theme", resolved);
  style.setProperty("--accent", main);
  style.setProperty("--accent-strong", strong);
  style.setProperty("--timeline", main);
  style.setProperty("--timeline-strong", strong);
}

function crossfade() {
  const root = document.documentElement;
  root.classList.add("theme-anim");
  window.setTimeout(() => root.classList.remove("theme-anim"), 480);
}

// Re-apply on OS theme change while in "auto" (module-level so it isn't tied to any component lifecycle).
if (typeof window !== "undefined") {
  try {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (readTheme() === "auto") {
        applyToDocument();
        emit();
      }
    });
  } catch {
    /* matchMedia unavailable */
  }
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "auto" as ThemeChoice);
  const accent = useSyncExternalStore(subscribe, readAccent, () => DEFAULT_ACCENT);

  const setTheme = useCallback((next: ThemeChoice) => {
    crossfade();
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* localStorage unavailable */
    }
    applyToDocument();
    emit();
  }, []);

  const setAccent = useCallback((next: string) => {
    crossfade();
    try {
      localStorage.setItem(ACCENT_KEY, next);
    } catch {
      /* localStorage unavailable */
    }
    applyToDocument();
    emit();
  }, []);

  return { accent, setAccent, setTheme, theme };
}
