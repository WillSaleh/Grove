// Mock data for the Connect area (Friends dashboard + Community). Client-only until the social backend
// exists. Groups / directory people / relationship copy are ported from the Timeline_V2 design.
import type { EntryType } from "@/types/tree";

export type Group = {
  blurb: string;
  color: string; // a CSS var reference, e.g. "var(--cat-green)"
  icon: string;
  id: string;
  members: number;
  name: string;
};

export const GROUPS: Array<Group> = [
  { blurb: "First steps in faith, walked together.", color: "var(--cat-green)", icon: "ph-plant", id: "g_new", members: 1284, name: "New Believers" },
  { blurb: "Bring your needs; we’ll pray with you.", color: "var(--accent)", icon: "ph-hands-praying", id: "g_prayer", members: 3102, name: "Prayer Requests" },
  { blurb: "Dig into Scripture verse by verse.", color: "var(--cat-amber)", icon: "ph-book-open-text", id: "g_bible", members: 2456, name: "Bible Study" },
  { blurb: "Brothers sharpening one another.", color: "var(--accent)", icon: "ph-barbell", id: "g_men", members: 842, name: "Men’s Group" },
  { blurb: "Sisters encouraging one another.", color: "var(--cat-rose)", icon: "ph-flower-lotus", id: "g_women", members: 1673, name: "Women’s Group" },
  { blurb: "Faith, friendship, and real life.", color: "var(--cat-emerald)", icon: "ph-users-three", id: "g_young", members: 1985, name: "Young Adults" },
  { blurb: "Raising kids who know Him.", color: "var(--cat-mustard)", icon: "ph-house-line", id: "g_parents", members: 1120, name: "Parents" },
  { blurb: "Building Christ-centered homes.", color: "var(--cat-coral)", icon: "ph-heart", id: "g_marriage", members: 934, name: "Marriage" },
  { blurb: "Keeping faith through the busy years.", color: "var(--accent)", icon: "ph-graduation-cap", id: "g_college", members: 1541, name: "College Students" },
  { blurb: "Taking hope beyond these walls.", color: "var(--cat-forest)", icon: "ph-globe-hemisphere-west", id: "g_mission", members: 768, name: "Mission & Outreach" },
  { blurb: "Lifting His name together.", color: "var(--cat-gold)", icon: "ph-music-notes", id: "g_worship", members: 2210, name: "Worship & Music" },
  { blurb: "Connect with believers near you.", color: "var(--accent)", icon: "ph-church", id: "g_church", members: 1357, name: "Local Church" },
];

export type DirectoryPerson = {
  church: string;
  city: string;
  id: string;
  initials: string;
  mutuals: number;
  name: string;
  reason: string;
  tag: string;
};

// Suggested / Discover people (lightweight — no full timeline).
export const DIRECTORY: Array<DirectoryPerson> = [
  { church: "Grace Community Church", city: "Austin, TX", id: "d_ana", initials: "AD", mutuals: 5, name: "Ana Delgado", reason: "You both attend Grace Community Church", tag: "Same church" },
  { church: "Redeemer City Church", city: "Austin, TX", id: "d_sam", initials: "SK", mutuals: 3, name: "Samuel Kim", reason: "Currently reading the same Bible plan", tag: "Same Bible plan" },
  { church: "Hill Country Bible", city: "Austin, TX", id: "d_ruth", initials: "RM", mutuals: 2, name: "Ruth Mensah", reason: "Lives nearby", tag: "Nearby" },
  { church: "Grace Community Church", city: "San Marcos, TX", id: "d_leo", initials: "LA", mutuals: 8, name: "Leo Alvarez", reason: "8 mutual friends", tag: "Mutual friends" },
  { church: "Austin Chinese Church", city: "Austin, TX", id: "d_hana", initials: "HS", mutuals: 1, name: "Hana Suzuki", reason: "Both serve in outreach ministry", tag: "Ministry" },
  { church: "Grace Community Church", city: "Austin, TX", id: "d_noah", initials: "NB", mutuals: 4, name: "Noah Bennett", reason: "New believer looking for community", tag: "New believer" },
  { church: "Redeemer City Church", city: "Pflugerville, TX", id: "d_mia", initials: "MT", mutuals: 2, name: "Mia Torres", reason: "Both enjoy serving in worship", tag: "Worship" },
  { church: "Grace Community Church", city: "Austin, TX", id: "d_eli", initials: "EC", mutuals: 6, name: "Eli Carter", reason: "In the same Life Group", tag: "Life Group" },
];

export type DiscoverFilter = { key: string; label: string };

// Discover tab filter chips. `key` drives the client-side matching in FriendsDashboard; `label` matches the design.
export const DISCOVER_FILTERS: Array<DiscoverFilter> = [
  { key: "all", label: "All" },
  { key: "church", label: "Same church" },
  { key: "nearby", label: "Nearby" },
  { key: "mutual", label: "Mutual friends" },
  { key: "ministry", label: "Ministry" },
  { key: "new", label: "New believers" },
];

export type FriendRequest = {
  id: string;
  initials: string;
  name: string;
  reason: string;
};

export const FRIEND_REQUESTS: Array<FriendRequest> = [
  { id: "req_tomas", initials: "TR", name: "Tomás Rivera", reason: "Sent you a request · 3 mutual friends · Grace Community Church" },
  { id: "req_dana", initials: "DK", name: "Dana Kowalski", reason: "Sent you a request · Serves with you on the prayer team" },
];

export type PrivacyKey = "timeline" | "prayer" | "journals" | "tree" | "groups" | "activity" | "reading";

export type PrivacyRow = {
  icon: string;
  key: PrivacyKey;
  label: string;
};

export const PRIVACY_ROWS: Array<PrivacyRow> = [
  { icon: "ph-path", key: "timeline", label: "Timeline" },
  { icon: "ph-hands-praying", key: "prayer", label: "Prayer Requests" },
  { icon: "ph-notebook", key: "journals", label: "Journals" },
  { icon: "ph-tree", key: "tree", label: "Growth Tree" },
  { icon: "ph-users-three", key: "groups", label: "Groups" },
  { icon: "ph-pulse", key: "activity", label: "Activity" },
  { icon: "ph-book-open-text", key: "reading", label: "Reading Progress" },
];

export type PrivacyLevel = "public" | "friends" | "groups" | "private";

export const PRIVACY_OPTIONS: Array<{ label: string; value: PrivacyLevel }> = [
  { label: "Public", value: "public" },
  { label: "Friends", value: "friends" },
  { label: "Groups", value: "groups" },
  { label: "Private", value: "private" },
];

export const DEFAULT_PRIVACY: Record<PrivacyKey, PrivacyLevel> = {
  activity: "friends",
  groups: "public",
  journals: "private",
  prayer: "friends",
  reading: "friends",
  timeline: "friends",
  tree: "public",
};

// The "kind" pill shown on a Community Feed / timeline post — label, icon, and color keyed off the
// entry type and (for prayers) whether it was answered. Ported from the design's feedKind().
export type FeedKind = { color: string; icon: string; label: string };

export function feedKind(type: EntryType, answered?: boolean): FeedKind {
  if (type === "verse") return { color: "var(--cat-orange)", icon: "ph-book-open-text", label: "Scripture" };
  if (type === "reflection") return { color: "var(--cat-green)", icon: "ph-notebook", label: "Reflection" };
  if (type === "prayer") {
    return answered
      ? { color: "var(--cat-coral)", icon: "ph-hands-praying", label: "Praise Report" }
      : { color: "var(--accent)", icon: "ph-hands-praying", label: "Prayer Request" };
  }
  if (type === "gratitude") return { color: "var(--cat-rose)", icon: "ph-heart", label: "Gratitude" };
  return { color: "var(--cat-blue)", icon: "ph-mountains", label: "Milestone" };
}

// The kind pill for the current user's own feed posts ("Encouragement", design shapePost()).
export const ENCOURAGEMENT_KIND: FeedKind = { color: "#527257", icon: "ph-hand-heart", label: "Encouragement" };
