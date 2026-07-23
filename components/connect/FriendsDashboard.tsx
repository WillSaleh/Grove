"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import {
  DEFAULT_PRIVACY,
  DIRECTORY,
  DISCOVER_FILTERS,
  FRIEND_REQUESTS,
  PRIVACY_OPTIONS,
  PRIVACY_ROWS,
} from "@/lib/community";
import type { PrivacyKey, PrivacyLevel } from "@/lib/community";
import type { Friend } from "@/lib/friends";
import type { FriendsTab } from "@/types/tree";

const TABS: Array<{ icon: string; id: FriendsTab; label: string }> = [
  { icon: "ph-users", id: "all", label: "My Friends" },
  { icon: "ph-user-plus", id: "requests", label: "Requests" },
  { icon: "ph-sparkle", id: "suggested", label: "Suggested" },
  { icon: "ph-compass", id: "discover", label: "Discover" },
  { icon: "ph-lock-simple", id: "privacy", label: "Privacy" },
];

const CARD = "rounded-[20px] border border-edge bg-card p-[18px] shadow-[var(--shadow-1)]";
const CARD_PERSON = "rounded-[20px] border border-edge bg-card px-[18px] py-5 shadow-[var(--shadow-1)]";
const ACCENT_AVATAR = "var(--accent)";
const PRAY_HOVER_BG = "color-mix(in srgb, var(--accent) 8%, transparent)";

// Staggered entrance for card grids — matches the design's gr-cardin "populate" animation.
function cardIn(index: number): CSSProperties {
  return { animation: "gr-cardin .5s cubic-bezier(.22,1,.36,1) backwards", animationDelay: `${index * 0.05}s` };
}

function accentBtn(): CSSProperties {
  return {
    alignItems: "center",
    background: "var(--accent)",
    border: "none",
    borderRadius: 12,
    color: "#fff",
    cursor: "pointer",
    display: "inline-flex",
    fontSize: 13.5,
    fontWeight: 600,
    gap: 7,
    justifyContent: "center",
    padding: "10px 0",
    transition: "filter .18s",
    width: "100%",
  };
}

// The "Requested" (already-sent) state for Add-Friend buttons — muted, non-interactive.
function sentBtn(): CSSProperties {
  return {
    alignItems: "center",
    background: "transparent",
    border: "1px solid var(--border-strong)",
    borderRadius: 12,
    color: "var(--muted)",
    cursor: "default",
    display: "inline-flex",
    fontSize: 13.5,
    fontWeight: 600,
    gap: 7,
    justifyContent: "center",
    padding: "10px 0",
    width: "100%",
  };
}

// Pray / Encourage buttons on friend cards.
function ghostBtn(): CSSProperties {
  return {
    alignItems: "center",
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: 11,
    color: "var(--accent)",
    cursor: "pointer",
    display: "inline-flex",
    flex: 1,
    fontSize: 13,
    fontWeight: 600,
    gap: 7,
    justifyContent: "center",
    padding: "9px 0",
    transition: "background .16s",
  };
}

interface Props {
  friends: Array<Friend>;
  friendsTab: FriendsTab;
  onOpenFriend: (id: string) => void;
  onSelectTab: (tab: FriendsTab) => void;
  onShowToast: (message: string, icon: string) => void;
}

export function FriendsDashboard({ friends, friendsTab, onOpenFriend, onSelectTab, onShowToast }: Props) {
  const [search, setSearch] = useState("");
  const [discoverFilter, setDiscoverFilter] = useState("all");
  const [privacy, setPrivacy] = useState<Record<PrivacyKey, PrivacyLevel>>(DEFAULT_PRIVACY);
  const [sentIds, setSentIds] = useState<Array<string>>([]);
  const [requestIds, setRequestIds] = useState<Array<string>>(FRIEND_REQUESTS.map((request) => request.id));

  const query = search.trim().toLowerCase();
  const shownFriends = query ? friends.filter((friend) => friend.name.toLowerCase().includes(query)) : friends;
  const requests = FRIEND_REQUESTS.filter((request) => requestIds.includes(request.id));
  const discoverPeople = DIRECTORY.filter((person) => {
    switch (discoverFilter) {
      case "church":
        return person.church === "Grace Community Church";
      case "nearby":
        return person.city.includes("Austin");
      case "mutual":
        return person.mutuals >= 5;
      case "new":
        return person.tag === "New believer";
      case "ministry":
        return /ministr|worship|outreach/i.test(`${person.tag} ${person.reason}`);
      default:
        return true;
    }
  });

  function addPerson(id: string, name: string) {
    setSentIds((current) => (current.includes(id) ? current : [...current, id]));
    onShowToast(`Friend request sent to ${name.split(" ")[0]}`, "ph-paper-plane-tilt");
  }

  function resolveRequest(id: string, accepted: boolean, name: string) {
    setRequestIds((current) => current.filter((requestId) => requestId !== id));
    onShowToast(accepted ? `You’re now friends with ${name.split(" ")[0]}` : "Request declined", accepted ? "ph-check-circle" : "ph-x");
  }

  return (
    <div className="gr-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-canvas">
      <div className="px-[clamp(20px,4vw,52px)] pb-[72px] pt-[26px]">
        <div className="mb-[22px] font-display text-[clamp(24px,3vw,32px)] font-semibold leading-[1.05] tracking-[-.022em] text-content">
          Friends
        </div>

        <div className="gr-scroll mb-5 flex gap-[9px] overflow-x-auto pb-1">
          {TABS.map((tab) => {
            const active = friendsTab === tab.id;
            const badge = tab.id === "requests" && requestIds.length ? String(requestIds.length) : "";
            return (
              <button
                className="inline-flex flex-none cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-[15px] py-[9px] text-[13.5px] font-semibold shadow-[var(--shadow-1)] transition-colors"
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                style={{ background: active ? "var(--accent)" : "var(--card)", color: active ? "#fff" : "var(--muted)" }}
                type="button"
              >
                <Icon name={tab.icon} weight="duotone" /> {tab.label}
                {badge ? (
                  <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-[5px] text-[11px] font-bold text-accent">
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {friendsTab === "all" ? (
          <>
            <div className="mb-[26px]">
              <div className="mb-[13px] text-xs font-bold uppercase tracking-[.06em] text-subtle-2">Recently active</div>
              <div className="gr-scroll flex gap-5 overflow-x-auto pb-2">
                {friends.slice(0, 6).map((friend, index) => (
                  <button
                    className="flex w-[72px] flex-none cursor-pointer flex-col items-center gap-2 border-none bg-transparent"
                    key={friend.id}
                    onClick={() => onOpenFriend(friend.id)}
                    style={cardIn(index)}
                    type="button"
                  >
                    <div className="relative">
                      <Avatar background={ACCENT_AVATAR} border="3px solid var(--ring)" fontSize={18} initials={friend.initials} size={52} />
                      <span
                        className="absolute bottom-[1px] right-[1px] h-[14px] w-[14px] rounded-full"
                        style={{ background: "#3fb950", border: "2.5px solid var(--bg)" }}
                      />
                    </div>
                    <span className="max-w-[72px] truncate text-[12.5px] font-semibold text-content">{friend.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4 flex items-center gap-4">
              <div className="flex-none text-xs font-bold uppercase tracking-[.06em] text-subtle-2">My friends · {friends.length}</div>
              <div className="relative inline-flex max-w-[280px] flex-1 items-center">
                <Icon className="absolute left-[14px] text-[15px] text-subtle-2" name="ph-magnifying-glass" />
                <input
                  className="w-full rounded-full border border-edge bg-card py-[10px] pl-[38px] pr-4 text-sm text-content outline-none"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search friends…"
                  value={search}
                />
              </div>
            </div>

            {shownFriends.length ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                {shownFriends.map((friend, index) => (
                  <div className={CARD} key={friend.id} style={cardIn(index)}>
                    <button
                      className="flex w-full cursor-pointer items-center gap-[14px] border-none bg-transparent p-0 text-left"
                      onClick={() => onOpenFriend(friend.id)}
                      type="button"
                    >
                      <Avatar background={ACCENT_AVATAR} border="3px solid var(--ring)" fontSize={19} initials={friend.initials} size={54} />
                      <div className="min-w-0 flex-1">
                        <div className="text-base font-semibold leading-[1.2] text-content">{friend.name}</div>
                        <div className="mt-[3px] truncate text-[12.5px] text-subtle">{friend.church}</div>
                        <div className="mt-[2px] text-xs text-subtle-2">{friend.mutuals} mutual friends</div>
                      </div>
                    </button>
                    <div className="mt-[15px] flex gap-[9px]">
                      <button
                        onClick={() => onShowToast(`Praying with ${friend.name.split(" ")[0]}`, "ph-hands-praying")}
                        onMouseEnter={(event) => { event.currentTarget.style.background = PRAY_HOVER_BG; }}
                        onMouseLeave={(event) => { event.currentTarget.style.background = "transparent"; }}
                        style={ghostBtn()}
                        type="button"
                      >
                        <Icon name="ph-hands-praying" weight="duotone" /> Pray
                      </button>
                      <button
                        onClick={() => onShowToast("Encouragement sent", "ph-hand-heart")}
                        onMouseEnter={(event) => { event.currentTarget.style.background = PRAY_HOVER_BG; }}
                        onMouseLeave={(event) => { event.currentTarget.style.background = "transparent"; }}
                        style={ghostBtn()}
                        type="button"
                      >
                        <Icon name="ph-hand-heart" weight="duotone" /> Encourage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-14 text-center text-subtle-2">
                <Icon className="text-[40px]" name="ph-users" weight="duotone" />
                <div className="mt-[10px] text-base text-subtle">No friends match your search.</div>
              </div>
            )}
          </>
        ) : null}

        {friendsTab === "requests" ? (
          requests.length ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
              {requests.map((request, index) => (
                <div className={CARD} key={request.id} style={cardIn(index)}>
                  <div className="flex items-center gap-[14px]">
                    <Avatar background={ACCENT_AVATAR} border="3px solid var(--ring)" fontSize={18} initials={request.initials} size={50} />
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-semibold leading-[1.2] text-content">{request.name}</div>
                      <div className="mt-[3px] text-[12.5px] text-subtle">{request.reason}</div>
                    </div>
                  </div>
                  <div className="mt-[15px] flex gap-[9px]">
                    <button onClick={() => resolveRequest(request.id, true, request.name)} style={{ ...accentBtn(), flex: 1, width: undefined }} type="button">
                      <Icon name="ph-check" weight="bold" /> Accept
                    </button>
                    <button
                      className="flex-1"
                      onClick={() => resolveRequest(request.id, false, request.name)}
                      style={{ background: "transparent", border: "1px solid var(--border-strong)", borderRadius: 12, color: "var(--muted)", cursor: "pointer", fontSize: 13.5, fontWeight: 600, padding: "10px 0" }}
                      type="button"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-14 text-center text-subtle-2">
              <Icon className="text-[40px]" name="ph-user-check" weight="duotone" />
              <div className="mt-[10px] text-base text-subtle">No pending requests.</div>
              <div className="mt-1 text-[13.5px]">You’re all caught up.</div>
            </div>
          )
        ) : null}

        {friendsTab === "suggested" ? (
          <>
            <div className="mb-4 text-[13px] text-subtle">People you may know — matched by church, plans, ministries and mutual friends.</div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
              {DIRECTORY.map((person, index) => {
                const sent = sentIds.includes(person.id);
                return (
                  <div className={`${CARD_PERSON} flex flex-col items-center gap-[11px] text-center`} key={person.id} style={cardIn(index)}>
                    <Avatar background={ACCENT_AVATAR} border="3px solid var(--ring)" fontSize={20} initials={person.initials} size={56} />
                    <div>
                      <div className="text-base font-semibold leading-[1.2] text-content">{person.name}</div>
                      <div
                        className="mt-[7px] inline-flex items-center gap-[5px] rounded-full px-[10px] py-1 text-[11.5px] font-semibold text-accent"
                        style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)" }}
                      >
                        <Icon name="ph-sparkle" weight="fill" /> {person.tag}
                      </div>
                      <div className="mt-[9px] text-[12.5px] leading-[1.4] text-subtle">{person.reason}</div>
                    </div>
                    <button
                      disabled={sent}
                      onClick={() => addPerson(person.id, person.name)}
                      style={sent ? sentBtn() : accentBtn()}
                      type="button"
                    >
                      <Icon name={sent ? "ph-check" : "ph-user-plus"} weight="bold" /> {sent ? "Requested" : "Add Friend"}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        ) : null}

        {friendsTab === "discover" ? (
          <>
            <div className="gr-scroll mb-[18px] flex gap-[9px] overflow-x-auto pb-1">
              {DISCOVER_FILTERS.map((filter) => {
                const active = discoverFilter === filter.key;
                return (
                  <button
                    className="flex-none cursor-pointer whitespace-nowrap rounded-full text-[13px] font-semibold transition-all"
                    key={filter.key}
                    onClick={() => setDiscoverFilter(filter.key)}
                    style={{
                      background: active ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "var(--card)",
                      border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
                      color: active ? "var(--accent)" : "var(--muted)",
                      padding: "8px 15px",
                    }}
                    type="button"
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
              {discoverPeople.map((person, index) => {
                const sent = sentIds.includes(person.id);
                return (
                  <div className={`${CARD_PERSON} flex flex-col items-center gap-[11px] text-center`} key={person.id} style={cardIn(index)}>
                    <Avatar background={ACCENT_AVATAR} border="3px solid var(--ring)" fontSize={20} initials={person.initials} size={56} />
                    <div>
                      <div className="text-base font-semibold leading-[1.2] text-content">{person.name}</div>
                      <div className="mt-[5px] text-[12.5px] text-subtle">{person.church}</div>
                      <div className="mt-[2px] text-xs text-subtle-2">{person.city} · {person.mutuals} mutual friends</div>
                    </div>
                    <button disabled={sent} onClick={() => addPerson(person.id, person.name)} style={sent ? sentBtn() : accentBtn()} type="button">
                      <Icon name={sent ? "ph-check" : "ph-user-plus"} weight="bold" /> {sent ? "Requested" : "Add Friend"}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        ) : null}

        {friendsTab === "privacy" ? (
          <>
            <div className="mb-[18px] max-w-[560px] text-[13px] text-subtle">
              You control what friends can see. Choose who can view each part of your journey.
            </div>
            <div className="overflow-hidden rounded-[20px] border border-edge bg-card shadow-[var(--shadow-1)]">
              {PRIVACY_ROWS.map((row) => (
                <div className="flex flex-wrap items-center gap-[14px] border-b border-divide px-[18px] py-4" key={row.key}>
                  <div
                    className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[11px] text-[19px] text-accent"
                    style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)" }}
                  >
                    <Icon name={row.icon} weight="duotone" />
                  </div>
                  <div className="min-w-[120px] flex-1 text-[15px] font-semibold text-content">{row.label}</div>
                  <div className="flex flex-none gap-[3px] rounded-[11px] bg-field p-[3px]">
                    {PRIVACY_OPTIONS.map((option) => {
                      const active = privacy[row.key] === option.value;
                      return (
                        <button
                          className="flex-1 cursor-pointer rounded-[9px] border-none px-[4px] py-[7px] text-[12px] font-semibold transition-all"
                          key={option.value}
                          onClick={() => setPrivacy((current) => ({ ...current, [row.key]: option.value }))}
                          style={{ background: active ? "var(--card)" : "transparent", boxShadow: active ? "var(--shadow-1)" : "none", color: active ? "var(--accent)" : "var(--muted)" }}
                          type="button"
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
