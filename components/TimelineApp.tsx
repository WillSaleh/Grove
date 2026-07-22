"use client";

import { useCallback, useRef, useState } from "react";

import { ConnectPlaceholder } from "@/components/connect/ConnectPlaceholder";
import { JourneyView } from "@/components/journey/JourneyView";
import { Toast } from "@/components/journey/Toast";
import type { ToastState } from "@/components/journey/Toast";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopNav } from "@/components/shell/TopNav";
import { FRIENDS } from "@/lib/friends";
import type { TimelineView } from "@/types/tree";

export function TimelineApp() {
  const [view, setView] = useState<TimelineView>("journey");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const toastTimer = useRef<number | undefined>(undefined);

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
