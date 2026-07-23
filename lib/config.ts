// Override the base URL (e.g. for a Cloudflare tunnel demo) via NEXT_PUBLIC_API_BASE_URL.
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

// The backend returns media URLs as paths relative to itself (e.g. "/uploads/xyz.jpg"), which the
// browser would otherwise resolve against the frontend's own origin. Absolute URLs pass through
// untouched — media.url can also be an external URL per the backend's API docs.
export function resolveMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  return url.startsWith("/") ? `${API_BASE}${url}` : url;
}
