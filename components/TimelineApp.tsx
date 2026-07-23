"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ConnectPlaceholder } from "@/components/connect/ConnectPlaceholder";
import { JourneyView } from "@/components/journey/JourneyView";
import { Toast } from "@/components/journey/Toast";
import type { ToastState } from "@/components/journey/Toast";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopNav } from "@/components/shell/TopNav";
import { fetchEntries, getOrCreateUserId } from "@/lib/api";
import { FRIENDS } from "@/lib/friends";
import { useTreeStore } from "@/store/useTreeStore";
import type { TimelineView } from "@/types/tree";

export function TimelineApp() {
  const [view, setView] = useState<TimelineView>("journey");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const toastTimer = useRef<number | undefined>(undefined);
  const setUserId = useTreeStore((state) => state.setUserId);
  const setEntries = useTreeStore((state) => state.setEntries);
  const requestedUserId = useRef(false);

  useEffect(() => {
    if (requestedUserId.current) return;
    requestedUserId.current = true;
    getOrCreateUserId()
      .then(async (userId) => {
        setUserId(userId);
        setEntries(await fetchEntries(userId));
      })
      .catch((error) => console.error("Failed to load journey from backend:", error));
  }, [setEntries, setUserId]);

  const showToast = useCallback((message: string, icon: string) => {
    setToast({ icon, message });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopNav onGoHome={() => setView("journey")} onOpenSidebar={() => setSidebarOpen(true)} />

      {view === "journey" ? <JourneyView onShowToast={showToast} /> : <ConnectPlaceholder />}

      <Sidebar
        friends={FRIENDS}
        onClose={() => setSidebarOpen(false)}
        onOpenFriend={() => setView("connect")}
        onSelectView={setView}
        open={sidebarOpen}
        view={view}
      />

      <Toast toast={toast} />
    </div>
  );
}
