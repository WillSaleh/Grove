"use client";

import { useCallback, useEffect, useState } from "react";

import { AuthPage } from "@/components/auth/AuthPage";
import { TimelineApp } from "@/components/TimelineApp";
import { clearStoredUserId, deleteUserAccount, getStoredUserId, loadUserSession } from "@/lib/api";
import { useTreeStore } from "@/store/useTreeStore";

type AppState = "loading" | "auth" | "journey";

export function GroveApp() {
  const [appState, setAppState] = useState<AppState>("loading");
  const setUserId = useTreeStore((state) => state.setUserId);
  const setPerson = useTreeStore((state) => state.setPerson);
  const setEntries = useTreeStore((state) => state.setEntries);
  const setTestimony = useTreeStore((state) => state.setTestimony);
  const clearSession = useTreeStore((state) => state.clearSession);

  const hydrateSession = useCallback(
    async (userId: string) => {
      const session = await loadUserSession(userId);
      setUserId(session.userId);
      setPerson(session.person);
      setEntries(session.entries);
      setTestimony(session.testimony);
      setAppState("journey");
    },
    [setEntries, setPerson, setTestimony, setUserId],
  );

  useEffect(() => {
    const storedUserId = getStoredUserId();
    if (!storedUserId) {
      setAppState("auth");
      return;
    }

    hydrateSession(storedUserId).catch(() => {
      clearStoredUserId();
      setAppState("auth");
    });
  }, [hydrateSession]);

  const handleAuthenticated = useCallback(
    async (userId: string) => {
      try {
        await hydrateSession(userId);
      } catch (error) {
        console.error("Failed to load journey after authentication:", error);
        clearStoredUserId();
        setAppState("auth");
      }
    },
    [hydrateSession],
  );

  const handleSwitchUser = useCallback(() => {
    clearStoredUserId();
    clearSession();
    setAppState("auth");
  }, [clearSession]);

  const handleDeleteAccount = useCallback(async () => {
    const userId = useTreeStore.getState().userId;
    if (!userId) {
      handleSwitchUser();
      return;
    }

    await deleteUserAccount(userId);
    clearStoredUserId();
    clearSession();
    setAppState("auth");
  }, [clearSession, handleSwitchUser]);

  if (appState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-parchment text-sm font-semibold text-muted">
        Loading…
      </div>
    );
  }

  if (appState === "auth") {
    return <AuthPage onAuthenticated={handleAuthenticated} />;
  }

  return <TimelineApp onDeleteAccount={handleDeleteAccount} onSwitchUser={handleSwitchUser} />;
}
