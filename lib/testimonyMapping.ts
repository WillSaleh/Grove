// Translates between the frontend's Testimony (types/tree.ts) and the backend's user bio + testimony_media
// rows — mirrors lib/entryMapping.ts's role for entries.
import { resolveMediaUrl } from "@/lib/config";
import type { BackendTestimonyMedia } from "@/types/backend";
import type { Testimony } from "@/types/tree";

export function backendUserToTestimony(bio: string | null, media: Array<BackendTestimonyMedia>): Testimony {
  return {
    text: bio ?? "",
    media: media.map((item) => ({
      kind: item.media_type === "video" ? "video" : "image",
      url: resolveMediaUrl(item.url),
      mediaId: item.id,
    })),
  };
}
