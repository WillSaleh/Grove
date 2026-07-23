"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { Icon } from "@/components/Icon";
import { createUserAccount, loginByUsername } from "@/lib/api";

type Mode = "login" | "create";

interface Props {
  onAuthenticated: (userId: string) => Promise<void>;
}

const INPUT_CLASS =
  "w-full rounded-[13px] border-[1.5px] border-line-3 bg-white px-[14px] py-3 text-[15px] text-ink outline-none";
const LABEL_CLASS = "mb-[6px] block text-xs font-semibold uppercase tracking-[.04em] text-muted";

export function AuthPage({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const userId =
        mode === "login"
          ? await loginByUsername(username)
          : await createUserAccount(username, displayName);
      await onAuthenticated(userId);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-parchment px-5 py-10">
      <div
        className="w-[min(460px,100%)] rounded-[18px] border border-line bg-white p-[28px_28px_30px] shadow-[0_24px_60px_rgba(0,0,0,.08)]"
        style={{ animation: "gr-pop .3s cubic-bezier(.22,.61,.36,1) both" }}
      >
        <div className="text-center">
          <div className="font-logo text-[30px] font-extrabold tracking-[-.02em] text-ink">YV Social</div>
          <div className="mt-2 font-display text-[24px] font-semibold text-ink">Welcome to Grove</div>
          <div className="mt-2 text-sm text-muted">Sign in or create an account to open your journey.</div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-[14px] border border-line-3 bg-parchment p-1">
          <button
            className={`cursor-pointer rounded-[11px] px-3 py-[10px] text-[14px] font-semibold transition-colors ${
              mode === "login" ? "bg-white text-brand shadow-sm" : "text-muted hover:text-ink"
            }`}
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            type="button"
          >
            Log in
          </button>
          <button
            className={`cursor-pointer rounded-[11px] px-3 py-[10px] text-[14px] font-semibold transition-colors ${
              mode === "create" ? "bg-white text-brand shadow-sm" : "text-muted hover:text-ink"
            }`}
            onClick={() => {
              setMode("create");
              setError(null);
            }}
            type="button"
          >
            Create account
          </button>
        </div>

        <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className={LABEL_CLASS}>Username</span>
            <input
              autoComplete="username"
              className={INPUT_CLASS}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="e.g. maya_bennett"
              value={username}
            />
          </label>

          {mode === "create" ? (
            <label className="block">
              <span className={LABEL_CLASS}>Display name</span>
              <input
                autoComplete="name"
                className={INPUT_CLASS}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="e.g. Maya Bennett"
                value={displayName}
              />
            </label>
          ) : null}

          {error ? (
            <div className="rounded-[13px] border border-red-200 bg-red-50 px-[14px] py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            className="inline-flex items-center justify-center gap-2 rounded-[14px] border-none p-[13px] text-[14.5px] font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
            style={{ background: submitting ? "#7a8a7c" : "#4a5759" }}
            type="submit"
          >
            <Icon name={mode === "login" ? "ph-sign-in" : "ph-user-plus"} weight="bold" />
            {submitting ? "Please wait…" : mode === "login" ? "Continue to your journey" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
