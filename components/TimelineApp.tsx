"use client";

import { useCallback, useRef, useState } from "react";

import { ComingSoon } from "@/components/connect/ComingSoon";
import { CommunityView } from "@/components/connect/CommunityView";
import { FriendsDashboard } from "@/components/connect/FriendsDashboard";
import { JourneyView } from "@/components/journey/JourneyView";
import { ProfileView } from "@/components/journey/ProfileView";
import { Toast } from "@/components/journey/Toast";
import type { ToastState } from "@/components/journey/Toast";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopNav } from "@/components/shell/TopNav";
import { findProfile } from "@/lib/communitySeed";
import { FRIENDS } from "@/lib/friends";
import type { ConnectTab, FriendsTab, TimelineView } from "@/types/tree";

interface Props {
  onDeleteAccount: () => Promise<void>;
  onSwitchUser: () => void;
}

export function TimelineApp({ onDeleteAccount, onSwitchUser }: Props) {
  const [view, setView] = useState<TimelineView>("journey");
  const [connectTab, setConnectTab] = useState<ConnectTab>("feed");
  const [friendsTab, setFriendsTab] = useState<FriendsTab>("all");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const toastTimer = useRef<number | undefined>(undefined);

  const showToast = useCallback((message: string, icon: string) => {
    setToast({ icon, message });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  function goJourney() {
    setView("journey");
    setSidebarOpen(false);
  }

  function goCommunity() {
    setView("community");
    setSidebarOpen(false);
  }

  function goFriends() {
    setView("friends");
    setSidebarOpen(false);
  }

  function selectConnectTab(tab: ConnectTab) {
    setConnectTab(tab);
    setView("community");
    setSidebarOpen(false);
  }

  function openFriend(id: string) {
    setViewingId(id);
    setView("profile");
    setSidebarOpen(false);
  }

  const viewingFriend = viewingId ? FRIENDS.find((friend) => friend.id === viewingId) ?? null : null;
  const viewingProfile = viewingId ? findProfile(viewingId) ?? null : null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-canvas">
      <TopNav onGoHome={goJourney} onOpenSidebar={() => setSidebarOpen(true)} />

      {view === "journey" ? <JourneyView onShowToast={showToast} /> : null}
      {view === "friends" ? (
        <FriendsDashboard
          friends={FRIENDS}
          friendsTab={friendsTab}
          onOpenFriend={openFriend}
          onSelectTab={setFriendsTab}
          onShowToast={showToast}
        />
      ) : null}
      {view === "community" ? (
        <CommunityView connectTab={connectTab} onOpenFriend={openFriend} onShowToast={showToast} />
      ) : null}
      {view === "profile" ? (
        viewingProfile ? (
          <ProfileView key={viewingProfile.id} profile={viewingProfile} />
        ) : (
          <ComingSoon
            icon="ph-user-circle"
            note={`${viewingFriend ? `${viewingFriend.name.split(" ")[0]}’s` : "Their"} timeline, testimony, and answered prayers will live here.`}
            title={viewingFriend ? viewingFriend.name : "Profile"}
          />
        )
      ) : null}

      <Sidebar
        connectTab={connectTab}
        friends={FRIENDS}
        onClose={() => setSidebarOpen(false)}
        onDeleteAccount={async () => {
          try {
            await onDeleteAccount();
            setSidebarOpen(false);
          } catch (error) {
            console.error("Failed to delete account:", error);
            showToast("Couldn't delete account — try again", "ph-warning-circle");
          }
        }}
        onNavCommunity={goCommunity}
        onNavFriends={goFriends}
        onNavJourney={goJourney}
        onOpenFriend={openFriend}
        onSelectConnectTab={selectConnectTab}
        onSwitchUser={() => {
          onSwitchUser();
          setSidebarOpen(false);
        }}
        open={sidebarOpen}
        view={view}
        viewingId={viewingId}
      />

      <Toast toast={toast} />
    </div>
  );
}
