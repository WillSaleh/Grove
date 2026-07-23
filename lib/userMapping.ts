import type { BackendUser } from "@/types/backend";
import type { Person } from "@/types/tree";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return "?";
}

export function backendUserToPerson(user: Pick<BackendUser, "display_name" | "walking_since">): Person {
  const since = user.walking_since ? new Date(user.walking_since).getFullYear() : new Date().getFullYear();
  return {
    name: user.display_name,
    initials: initialsFromName(user.display_name),
    since,
    av: ["#4a5759"],
  };
}
