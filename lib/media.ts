import type { CSSProperties } from "react";

import type { MediaItem } from "@/types/tree";

// Thumbnail box for a media item. With a `size` it's a fixed square (upload chips); without, it fills
// its grid cell at 4:3 (galleries). A real url renders as a cover image; a placeholder is a soft gray tile.
export function mediaThumbStyle(item: MediaItem | undefined, size?: number): CSSProperties {
  const base: CSSProperties = {
    aspectRatio: size ? "1" : "4/3",
    border: "1px solid var(--border)",
    borderRadius: size ? 8 : 12,
    flex: "0 0 auto",
    height: size ?? "auto",
    overflow: "hidden",
    position: "relative",
    width: size ?? "100%",
  };
  if (item?.url) {
    return { ...base, backgroundImage: `url(${item.url})`, backgroundPosition: "center", backgroundSize: "cover" };
  }
  return { ...base, background: "var(--input)" };
}
