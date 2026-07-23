"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { AppearanceControls } from "@/components/shell/AppearanceControls";
import type { Friend } from "@/lib/friends";
import { useTreeStore } from "@/store/useTreeStore";
import type { ConnectTab, TimelineView } from "@/types/tree";

const CONNECT_TABS: Array<{ icon: string; id: ConnectTab; label: string }> = [
  { icon: "ph-compass", id: "groups", label: "Groups" },
  { icon: "ph-chat-circle-dots", id: "feed", label: "Community Feed" },
  { icon: "ph-path", id: "timeline", label: "Timeline" },
];

const SECTION_LABEL = "px-[10px] pb-[5px] text-[11px] font-bold uppercase tracking-[.11em] text-subtle-2";

const NAV_HOVER_BG = "color-mix(in srgb, var(--accent) 8%, transparent)";
const SUBTAB_HOVER_BG = "color-mix(in srgb, var(--accent) 6%, transparent)";

function navStyle(active: boolean, fontSize = 15): CSSProperties {
  return {
    alignItems: "center",
    background: active ? "var(--accent)" : "transparent",
    border: "none",
    borderRadius: 14,
    color: active ? "#fff" : "var(--text)",
    cursor: "pointer",
    display: "flex",
    fontSize,
    fontWeight: 600,
    gap: 13,
    padding: "12px 14px",
    textAlign: "left",
    transition: "background .16s",
    width: "100%",
  };
}

interface Props {
  connectTab: ConnectTab;
  friends: Array<Friend>;
  onClose: () => void;
  onDeleteAccount: () => Promise<void>;
  onNavCommunity: () => void;
  onNavFriends: () => void;
  onNavJourney: () => void;
  onOpenFriend: (id: string) => void;
  onSelectConnectTab: (tab: ConnectTab) => void;
  onSwitchUser: () => void;
  open: boolean;
  view: TimelineView;
  viewingId: string | null;
}

export function Sidebar({
  connectTab,
  friends,
  onClose,
  onDeleteAccount,
  onNavCommunity,
  onNavFriends,
  onNavJourney,
  onOpenFriend,
  onSelectConnectTab,
  onSwitchUser,
  open,
  view,
  viewingId,
}: Props) {
  const person = useTreeStore((state) => state.person);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!open) {
    return null;
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await onDeleteAccount();
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }
  return (
    <>
      <div
        className="fixed inset-0 z-[70] backdrop-blur-[2px]"
        onClick={onClose}
        style={{ animation: "gr-fade .2s ease both", background: "var(--scrim)" }}
      />
      <div
        className="fixed bottom-0 left-0 top-0 z-[71] flex w-[min(322px,86vw)] flex-col gap-[3px] overflow-y-auto p-[18px_16px] backdrop-blur-[30px] backdrop-saturate-[1.8]"
        style={{
          animation: "gr-drawer .3s cubic-bezier(.22,.61,.36,1) both",
          background: "color-mix(in srgb, var(--glass) 72%, transparent)",
          borderRight: "1px solid color-mix(in srgb, var(--glass) 60%, transparent)",
          boxShadow: "0 20px 60px rgba(0,0,0,.22)",
        }}
      >
        <div className="flex items-center justify-between px-[6px] pb-[14px] pt-1">
          <span className="font-logo text-[21px] font-extrabold tracking-[-.02em] text-content">Thread</span>
          <button
            aria-label="Close menu"
            className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border border-edge bg-card text-base text-subtle transition-all duration-[180ms] hover:bg-canvas hover:text-content"
            onClick={onClose}
            type="button"
          >
            <Icon name="ph-x" weight="bold" />
          </button>
        </div>

        <div className={`${SECTION_LABEL} pt-[6px]`}>My Space</div>
        <button
          onClick={onNavJourney}
          onMouseEnter={(event) => {
            if (view !== "journey") event.currentTarget.style.background = NAV_HOVER_BG;
          }}
          onMouseLeave={(event) => {
            if (view !== "journey") event.currentTarget.style.background = "transparent";
          }}
          style={navStyle(view === "journey", 15.5)}
          type="button"
        >
          <Icon name="ph-path" style={{ fontSize: 21 }} weight="duotone" /> My Journey
        </button>
        <button
          onClick={onNavCommunity}
          onMouseEnter={(event) => {
            if (view !== "community") event.currentTarget.style.background = NAV_HOVER_BG;
          }}
          onMouseLeave={(event) => {
            if (view !== "community") event.currentTarget.style.background = "transparent";
          }}
          style={navStyle(view === "community", 15.5)}
          type="button"
        >
          <Icon name="ph-users-three" style={{ fontSize: 21 }} weight="duotone" /> Connect
        </button>
        <div
          className="my-[2px] ml-[22px] flex flex-col gap-[2px] pl-2"
          style={{ borderLeft: "1.5px solid color-mix(in srgb, var(--accent) 14%, transparent)" }}
        >
          {CONNECT_TABS.map((tab) => {
            const active = view === "community" && connectTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectConnectTab(tab.id)}
                onMouseEnter={(event) => {
                  if (!active) event.currentTarget.style.background = SUBTAB_HOVER_BG;
                }}
                onMouseLeave={(event) => {
                  if (!active) event.currentTarget.style.background = "transparent";
                }}
                style={{
                  alignItems: "center",
                  background: active ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent",
                  border: "none",
                  borderRadius: 12,
                  color: active ? "var(--accent)" : "var(--muted)",
                  cursor: "pointer",
                  display: "flex",
                  fontSize: 14,
                  fontWeight: 600,
                  gap: 11,
                  padding: "9px 12px 9px 16px",
                  textAlign: "left",
                  transition: "background .16s",
                  width: "100%",
                }}
                type="button"
              >
                <Icon name={tab.icon} style={{ fontSize: 17 }} weight="duotone" /> {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mx-2 mb-[6px] mt-3 h-px" style={{ background: "color-mix(in srgb, var(--accent) 14%, transparent)" }} />
        <div className={`${SECTION_LABEL} pt-[2px]`}>Friends</div>
        <button
          onClick={onNavFriends}
          onMouseEnter={(event) => {
            if (view !== "friends") event.currentTarget.style.background = NAV_HOVER_BG;
          }}
          onMouseLeave={(event) => {
            if (view !== "friends") event.currentTarget.style.background = "transparent";
          }}
          style={navStyle(view === "friends")}
          type="button"
        >
          <Icon name="ph-users" style={{ fontSize: 21 }} weight="duotone" /> Friends Home
        </button>
        {friends.map((friend) => {
          const selected = view === "profile" && viewingId === friend.id;
          return (
            <button
              key={friend.id}
              onClick={() => onOpenFriend(friend.id)}
              onMouseEnter={(event) => {
                if (!selected) event.currentTarget.style.background = NAV_HOVER_BG;
              }}
              onMouseLeave={(event) => {
                if (!selected) event.currentTarget.style.background = "transparent";
              }}
              style={{
                alignItems: "center",
                background: selected ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent",
                border: "none",
                borderRadius: 14,
                cursor: "pointer",
                display: "flex",
                gap: 11,
                padding: "9px 12px",
                transition: "background .16s",
                width: "100%",
              }}
              type="button"
            >
              <Avatar
                background="var(--accent)"
                border={selected ? "2px solid var(--accent)" : "2px solid var(--ring)"}
                fontSize={13}
                initials={friend.initials}
                size={34}
              />
              <span className="min-w-0 flex-1 truncate text-left text-[14.5px] font-semibold leading-[1.2] text-content">
                {friend.name}
              </span>
              {selected ? <Icon className="flex-none text-[15px] text-accent" name="ph-check" weight="bold" /> : null}
            </button>
          );
        })}

        <div className="flex-1" />
        <div className="mx-2 mb-[6px] mt-3 h-px bg-divide" />

        <div className={SECTION_LABEL}>Account</div>
        {person.name ? (
          <div className="mb-2 flex items-center gap-[11px] px-3 py-2">
            <Avatar
              background="var(--accent)"
              border="2px solid var(--ring)"
              fontSize={13}
              initials={person.initials}
              size={34}
            />
            <span className="min-w-0 flex-1 truncate text-left text-[14.5px] font-semibold leading-tight text-content">
              {person.name}
            </span>
          </div>
        ) : null}

        <button
          className="flex w-full cursor-pointer items-center gap-[13px] rounded-[14px] border-none bg-transparent px-[14px] py-3 text-left text-[15.5px] font-semibold text-content transition-colors hover:bg-accent/[.08]"
          onClick={onSwitchUser}
          type="button"
        >
          <Icon name="ph-sign-out" style={{ fontSize: 21 }} weight="duotone" /> Switch user
        </button>

        {confirmDelete ? (
          <div className="rounded-[14px] border border-red-200 bg-red-50 p-3">
            <div className="text-sm font-semibold text-red-800">Delete this account?</div>
            <div className="mt-1 text-[13px] leading-[1.45] text-red-700">
              This permanently removes your journey, entries, and testimony.
            </div>
            <div className="mt-3 flex gap-2">
              <button
                className="flex-1 cursor-pointer rounded-[11px] border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
                disabled={deleting}
                onClick={() => setConfirmDelete(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="flex-1 cursor-pointer rounded-[11px] border-none bg-red-700 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={deleting}
                onClick={handleDeleteAccount}
                type="button"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        ) : (
          <button
            className="flex w-full cursor-pointer items-center gap-[13px] rounded-[14px] border-none bg-transparent px-[14px] py-3 text-left text-[15.5px] font-semibold text-red-700 transition-colors hover:bg-red-50"
            onClick={() => setConfirmDelete(true)}
            type="button"
          >
            <Icon name="ph-trash" style={{ fontSize: 21 }} weight="duotone" /> Delete account
          </button>
        )}

        <div className="mx-2 mb-2 mt-3 h-px bg-divide" />
        <AppearanceControls />
      </div>
    </>
  );
}
