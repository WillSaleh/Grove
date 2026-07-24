"use client";

import { useState } from "react";

import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { MONTHS_LONG } from "@/lib/timeline";

interface Props {
  activeMonth: number;
  activeYear: number;
  monthMode: boolean;
  onJumpMonth: (month: number) => void;
  onOpenTestimony: () => void;
  onSelectYear: (year: number) => void;
  personInitials: string;
  subtitle?: string;
  testimonyIcon?: string;
  testimonyLabel: string;
  votRef: string;
  votText: string;
  welcomeText: string;
  years: Array<number>;
}

const FROSTED =
  "inline-flex flex-none items-center gap-[9px] rounded-full border border-[color-mix(in_srgb,var(--glass)_60%,transparent)] bg-[color-mix(in_srgb,var(--glass)_55%,transparent)] shadow-[0_4px_16px_rgba(0,0,0,.1),inset_0_1px_0_color-mix(in_srgb,var(--glass)_60%,transparent)] backdrop-blur-[24px] backdrop-saturate-[1.8] cursor-pointer";

const MENU =
  "absolute top-[calc(100%+8px)] z-[45] flex flex-col gap-[2px] rounded-2xl border border-[color-mix(in_srgb,var(--glass)_65%,transparent)] bg-[color-mix(in_srgb,var(--glass)_70%,transparent)] p-[7px] shadow-[0_12px_40px_rgba(0,0,0,.18)] backdrop-blur-[30px] backdrop-saturate-[1.8]";

function rowClass(selected: boolean) {
  return `flex cursor-pointer items-center gap-[9px] whitespace-nowrap rounded-[10px] py-[9px] pl-[11px] pr-[15px] text-[15px] font-semibold ${
    selected ? "bg-accent/10 text-accent" : "text-content hover:bg-black/5"
  }`;
}

export function TimelineHeader({
  activeMonth,
  activeYear,
  monthMode,
  onJumpMonth,
  onOpenTestimony,
  onSelectYear,
  personInitials,
  subtitle,
  testimonyIcon = "ph-hand-heart",
  testimonyLabel,
  votRef,
  votText,
  welcomeText,
  years,
}: Props) {
  const [yearOpen, setYearOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);

  function handleSelectYear(year: number) {
    setYearOpen(false);
    onSelectYear(year);
  }

  function handleJumpMonth(month: number) {
    setMonthOpen(false);
    onJumpMonth(month);
  }

  return (
    <header className="relative bg-transparent px-[clamp(20px,4vw,52px)] pb-6 pt-[26px]">
      <div className={`mb-[18px] flex items-start gap-7${votText ? " md:pr-[346px]" : ""}`}>
        <div className="flex min-w-0 items-start gap-4">
          <Avatar border="3px solid var(--ring)" fontSize={19} initials={personInitials} size={54} />
          <div className="min-w-0">
            <div className="font-display text-[clamp(24px,3vw,32px)] font-semibold leading-[1.05] tracking-[-.022em] text-accent">
              {welcomeText}
            </div>
            {subtitle ? <div className="mt-1 text-[14.5px] text-subtle">{subtitle}</div> : null}
            <button
              className="mt-3 inline-flex cursor-pointer items-center gap-[7px] rounded-full border border-edge-strong bg-[color-mix(in_srgb,var(--glass)_50%,transparent)] px-[13px] py-[6px] text-[12.5px] font-semibold text-accent transition-colors hover:border-accent hover:bg-accent/[.08]"
              onClick={onOpenTestimony}
              type="button"
            >
              <Icon name={testimonyIcon} weight="bold" /> {testimonyLabel}
            </button>
          </div>
        </div>

        {votText ? (
          <div className="absolute right-[clamp(20px,4vw,52px)] top-[26px] hidden max-w-[330px] text-right opacity-[.62] md:block">
            <div className="inline-flex items-center justify-end gap-[6px] text-[10px] font-bold uppercase tracking-[.14em] text-subtle-2">
              <Icon className="text-[13px]" name="ph-book-bookmark" weight="duotone" /> Verse of the Day
            </div>
            <div className="mt-[5px] font-display text-[14.5px] italic leading-[1.45] text-accent">&ldquo;{votText}&rdquo;</div>
            <div className="mt-1 text-[11px] font-semibold tracking-[.02em] text-subtle-2">{votRef}</div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-[14px]">
        <div className="relative inline-flex flex-none items-center">
          <button
            aria-label="Select year"
            className={`${FROSTED} px-[18px] py-[10px] text-[17px] font-semibold tracking-[-.01em] text-accent`}
            onClick={() => setYearOpen((open) => !open)}
            type="button"
          >
            {activeYear} <Icon className="text-xs" name="ph-caret-down" weight="bold" />
          </button>
          {yearOpen ? (
            <>
              <div className="fixed inset-0 z-[44]" onClick={() => setYearOpen(false)} />
              <div className={`${MENU} left-0 right-0`} style={{ animation: "gr-pop .18s cubic-bezier(.22,.61,.36,1) both" }}>
                {years.map((year) => (
                  <button className={rowClass(year === activeYear)} key={year} onClick={() => handleSelectYear(year)} type="button">
                    <span className="flex-1 text-left">{year}</span>
                    <span className="inline-flex w-4 flex-none justify-center">
                      {year === activeYear ? <Icon className="text-sm" name="ph-check" weight="bold" /> : null}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>

        {monthMode ? (
          <div className="relative inline-flex flex-none items-center">
            <button
              aria-label="Select month"
              className={`${FROSTED} px-[18px] py-[10px] text-[17px] font-semibold tracking-[-.01em] text-accent`}
              onClick={() => setMonthOpen((open) => !open)}
              type="button"
            >
              {MONTHS_LONG[activeMonth]} <Icon className="text-xs" name="ph-caret-down" weight="bold" />
            </button>
            {monthOpen ? (
              <>
                <div className="fixed inset-0 z-[44]" onClick={() => setMonthOpen(false)} />
                <div
                  className={`${MENU} left-0 max-h-[340px] min-w-[190px] overflow-y-auto`}
                  style={{ animation: "gr-pop .18s cubic-bezier(.22,.61,.36,1) both" }}
                >
                  {MONTHS_LONG.map((label, idx) => (
                    <button className={rowClass(idx === activeMonth)} key={label} onClick={() => handleJumpMonth(idx)} type="button">
                      <span className="flex-1 text-left">{label}</span>
                      <span className="inline-flex w-4 flex-none justify-center">
                        {idx === activeMonth ? <Icon className="text-sm" name="ph-check" weight="bold" /> : null}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
