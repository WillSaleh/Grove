"use client";

import { useState } from "react";

import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import type { Friend } from "@/lib/friends";
import { useTreeStore } from "@/store/useTreeStore";
import type { TimelineView } from "@/types/tree";

interface Props {
  friends: Array<Friend>;
  onClose: () => void;
  onDeleteAccount: () => Promise<void>;
  onOpenFriend: (id: string) => void;
  onSelectView: (view: TimelineView) => void;
  onSwitchUser: () => void;
  open: boolean;
  view: TimelineView;
}

const SECTION_LABEL = "px-[10px] pb-[5px] pt-[6px] text-[11px] font-bold uppercase tracking-[.11em] text-muted-2";

function navClass(active: boolean) {
  return `flex w-full cursor-pointer items-center gap-[13px] rounded-[14px] border-none px-[14px] py-3 text-left text-[15.5px] font-semibold transition-colors ${
    active ? "bg-brand text-white" : "bg-transparent text-ink hover:bg-brand/[.08]"
  }`;
}

export function Sidebar({
  friends,
  onClose,
  onDeleteAccount,
  onOpenFriend,
  onSelectView,
  onSwitchUser,
  open,
  view,
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

  function selectView(next: TimelineView) {
    onSelectView(next);
    onClose();
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[70] bg-[rgba(50,64,63,.2)] backdrop-blur-[2px]"
        onClick={onClose}
        style={{ animation: "gr-fade .2s ease both" }}
      />
      <div
        className="fixed bottom-0 left-0 top-0 z-[71] flex w-[min(322px,86vw)] flex-col gap-[3px] overflow-y-auto border-r border-white/60 bg-white/[.72] p-[18px_16px] shadow-[0_20px_60px_rgba(0,0,0,.22)] backdrop-blur-[30px] backdrop-saturate-[1.8]"
        style={{ animation: "gr-drawer .3s cubic-bezier(.22,.61,.36,1) both" }}
      >
        <div className="flex items-center justify-between px-[6px] pb-[14px] pt-1">
          <span className="font-logo text-[21px] font-extrabold tracking-[-.02em] text-ink">YV Social</span>
          <button
            aria-label="Close menu"
            className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border border-line bg-white text-base text-muted transition-colors hover:bg-parchment-deep hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <Icon name="ph-x" weight="bold" />
          </button>
        </div>

        <div className={SECTION_LABEL}>My Space</div>
        <button className={navClass(view === "journey")} onClick={() => selectView("journey")} type="button">
          <Icon name="ph-path" style={{ fontSize: 21 }} weight="duotone" /> My Journey
        </button>
        <button className={navClass(view === "connect")} onClick={() => selectView("connect")} type="button">
          <Icon name="ph-users-three" style={{ fontSize: 21 }} weight="duotone" /> Connect
        </button>

        <div className="mx-2 mb-[6px] mt-3 h-px bg-brand/[.14]" />

        <div className={SECTION_LABEL}>Friends</div>
        {friends.map((friend) => (
          <button
            className="flex w-full cursor-pointer items-center gap-[11px] rounded-[14px] border-none bg-transparent px-3 py-[9px] transition-colors hover:bg-brand/[.08]"
            key={friend.id}
            onClick={() => {
              onOpenFriend(friend.id);
              onClose();
            }}
            type="button"
          >
            <Avatar border="2px solid #fff" fontSize={13} initials={friend.initials} size={34} />
            <span className="min-w-0 flex-1 truncate text-left text-[14.5px] font-semibold leading-tight text-ink">
              {friend.name}
            </span>
          </button>
        ))}

        <div className="mx-2 mb-[6px] mt-auto h-px bg-brand/[.14]" />

        <div className={SECTION_LABEL}>Account</div>
        {person.name ? (
          <div className="mb-2 flex items-center gap-[11px] px-3 py-2">
            <Avatar border="2px solid #fff" fontSize={13} initials={person.initials} size={34} />
            <span className="min-w-0 flex-1 truncate text-left text-[14.5px] font-semibold leading-tight text-ink">
              {person.name}
            </span>
          </div>
        ) : null}

        <button
          className="flex w-full cursor-pointer items-center gap-[13px] rounded-[14px] border-none bg-transparent px-[14px] py-3 text-left text-[15.5px] font-semibold text-ink transition-colors hover:bg-brand/[.08]"
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
      </div>
    </>
  );
}
