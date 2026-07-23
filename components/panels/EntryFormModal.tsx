"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

import { Icon } from "@/components/Icon";
import { DatePicker } from "@/components/DatePicker";
import { ENTRY_TYPES, ENTRY_TYPE_ORDER } from "@/lib/entryTypes";
import { BIBLE_BOOKS, BIBLE_VERSIONS, buildBackendVerseRef, buildDisplayVerseRef } from "@/lib/bibleBooks";
import { fetchVerseText } from "@/lib/api";
import { mediaThumbStyle } from "@/lib/media";
import type { EntryType, MediaItem } from "@/types/tree";

// The add/edit draft. Kept separate from the persisted Entry: `day` stays a string while typing,
// and `step`/`mode` are UI-only.
export type EntryForm = {
  answered: boolean;
  answeredNote: string;
  body: string;
  bookCode: string;
  chapter: string;
  day: string;
  id: string | null;
  media: Array<MediaItem>;
  mode: "add" | "edit";
  month: number;
  note: string;
  step: "type" | "fields";
  title: string;
  translation: string;
  type: EntryType | null;
  verse: string;
  verseEnd: string;
  year: string;
};

export function blankForm(year: number, month: number, day: number): EntryForm {
  return {
    answered: false,
    answeredNote: "",
    body: "",
    bookCode: "PSA",
    chapter: "",
    day: String(day),
    id: null,
    media: [],
    mode: "add",
    month,
    note: "",
    step: "type",
    title: "",
    translation: "NIV",
    type: null,
    verse: "",
    verseEnd: "",
    year: String(year),
  };
}

export function canSaveForm(form: EntryForm): boolean {
  if (form.type === "verse") {
    return Boolean(form.bookCode && form.chapter.trim() && form.verse.trim() && form.translation.trim());
  }
  return Boolean(form.title.trim());
}

interface Props {
  onAddFiles: (files: Array<File>) => void;
  onCancel: () => void;
  onChange: (patch: Partial<EntryForm>) => void;
  onPickType: (type: EntryType) => void;
  onRemoveMedia: (index: number) => void;
  onSave: () => void;
  form: EntryForm;
}

const INPUT_CLASS =
  "w-full rounded-[13px] border-[1.5px] border-edge-strong bg-card px-[14px] py-3 text-[15px] text-content outline-none";
const LABEL_CLASS = "mb-[6px] block text-xs font-semibold uppercase tracking-[.04em] text-subtle";

function titleLabel(type: EntryType): string {
  if (type === "gratitude") {
    return "What are you thankful for?";
  }
  if (type === "prayer") {
    return "Prayer request";
  }
  return "Title";
}

function titlePlaceholder(type: EntryType): string {
  if (type === "gratitude") {
    return "e.g. My small-group family";
  }
  if (type === "prayer") {
    return "e.g. For my dad’s health";
  }
  if (type === "milestone") {
    return "e.g. Baptized at Miller Creek";
  }
  return "Give it a title";
}

function bodyLabel(type: EntryType): string {
  if (type === "prayer") {
    return "Details";
  }
  if (type === "reflection") {
    return "Journal";
  }
  if (type === "gratitude") {
    return "Reflection";
  }
  return "Description";
}

function chip(meta: { color: string; tint: string }): CSSProperties {
  return {
    alignItems: "center",
    background: meta.tint,
    borderRadius: 13,
    color: meta.color,
    display: "flex",
    flex: "0 0 auto",
    fontSize: 21,
    height: 40,
    justifyContent: "center",
    width: 40,
  };
}

function TypeOption({ onPick, type }: { onPick: (type: EntryType) => void; type: EntryType }) {
  const [hover, setHover] = useState(false);
  const meta = ENTRY_TYPES[type];
  return (
    <button
      className="flex cursor-pointer items-center gap-3 rounded-2xl border-[1.5px] bg-card p-[14px] text-left transition-all"
      onClick={() => onPick(type)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ borderColor: hover ? meta.color : "var(--border)", transform: hover ? "translateY(-2px)" : "none" }}
      type="button"
    >
      <div style={chip(meta)}>
        <Icon name={meta.icon} weight="duotone" />
      </div>
      <div>
        <div className="text-[15px] font-semibold" style={{ color: meta.color }}>
          {meta.label}
        </div>
        <div className="mt-px text-xs text-subtle">{meta.hint}</div>
      </div>
    </button>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border border-edge bg-card text-lg text-subtle transition-colors hover:bg-canvas"
      onClick={onClick}
      type="button"
    >
      <Icon name="ph-x" weight="bold" />
    </button>
  );
}

export function EntryFormModal({
  form,
  onAddFiles,
  onCancel,
  onChange,
  onPickType,
  onRemoveMedia,
  onSave,
}: Props) {
  const meta = form.type ? ENTRY_TYPES[form.type] : null;
  const isType = form.step === "type";
  const saveEnabled = canSaveForm(form);
  const [previewText, setPreviewText] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const displayRef =
    form.type === "verse" && form.bookCode && form.chapter.trim() && form.verse.trim()
      ? buildDisplayVerseRef(form.bookCode, form.chapter.trim(), form.verse.trim(), form.verseEnd.trim() || undefined)
      : "";

  useEffect(() => {
    if (form.type !== "verse") {
      return;
    }

    const chapter = form.chapter.trim();
    const verse = form.verse.trim();
    if (!form.bookCode || !chapter || !verse) {
      setPreviewText("");
      setPreviewError(null);
      setPreviewLoading(false);
      return;
    }

    const backendRef = buildBackendVerseRef(
      form.bookCode,
      chapter,
      verse,
      form.verseEnd.trim() || undefined,
      form.translation,
    );

    setPreviewLoading(true);
    setPreviewError(null);

    const timer = window.setTimeout(() => {
      fetchVerseText(backendRef)
        .then((text) => {
          setPreviewText(text);
          setPreviewError(null);
        })
        .catch(() => {
          setPreviewText("");
          setPreviewError("Couldn't load this verse. Check the reference and try again.");
        })
        .finally(() => setPreviewLoading(false));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [form.bookCode, form.chapter, form.translation, form.type, form.verse, form.verseEnd]);

  return (
    <div className="fixed inset-0 z-[70] flex overflow-y-auto p-5">
      <div
        className="fixed inset-0 bg-black/[.42] backdrop-blur-[3px]"
        onClick={onCancel}
        style={{ animation: "gr-fade .2s both" }}
      />
      <div
        className="relative m-auto w-[min(560px,100%)] rounded-[18px] border border-edge bg-card"
        style={{ animation: "gr-pop .3s cubic-bezier(.22,.61,.36,1) both" }}
      >
        {isType ? (
          <div className="p-[28px_28px_30px]">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-display text-[25px] font-semibold text-content">Add to your journey</div>
                <div className="mt-[3px] text-sm text-subtle">What kind of moment is this?</div>
              </div>
              <CloseButton onClick={onCancel} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-[11px]">
              {ENTRY_TYPE_ORDER.map((type) => (
                <TypeOption key={type} onPick={onPickType} type={type} />
              ))}
            </div>
          </div>
        ) : null}

        {!isType && form.type && meta ? (
          <div>
            <div style={{ background: meta.tint, borderBottom: "1px solid var(--divider)", padding: "20px 26px" }}>
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-[10px]">
                  <div style={chip(meta)}>
                    <Icon name={meta.icon} weight="duotone" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-subtle">
                      {form.mode === "edit" ? "Editing" : "New entry"}
                    </div>
                    <div className="text-[17px] font-semibold text-content">{meta.label}</div>
                  </div>
                </div>
                <CloseButton onClick={onCancel} />
              </div>
            </div>

            <div className="flex flex-col gap-4 p-[22px_26px_26px]">
              {form.type !== "verse" ? (
                <label className="block">
                  <span className={LABEL_CLASS}>{titleLabel(form.type)}</span>
                  <input
                    className={INPUT_CLASS}
                    onChange={(event) => onChange({ title: event.target.value })}
                    placeholder={titlePlaceholder(form.type)}
                    value={form.title}
                  />
                </label>
              ) : null}

              {form.type === "verse" ? (
                <>
                  <div className="flex gap-3">
                    <label className="flex-[1.6]">
                      <span className={LABEL_CLASS}>Book</span>
                      <select
                        className={`${INPUT_CLASS} cursor-pointer`}
                        onChange={(event) => onChange({ bookCode: event.target.value })}
                        style={{ paddingInline: 12 }}
                        value={form.bookCode}
                      >
                        {BIBLE_BOOKS.map((book) => (
                          <option key={book.code} value={book.code}>
                            {book.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex-1">
                      <span className={LABEL_CLASS}>Version</span>
                      <select
                        className={`${INPUT_CLASS} cursor-pointer`}
                        onChange={(event) => onChange({ translation: event.target.value })}
                        style={{ paddingInline: 12 }}
                        value={form.translation}
                      >
                        {BIBLE_VERSIONS.map((version) => (
                          <option key={version} value={version}>
                            {version}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <label className="flex-1">
                      <span className={LABEL_CLASS}>Chapter</span>
                      <input
                        className={INPUT_CLASS}
                        min={1}
                        onChange={(event) => onChange({ chapter: event.target.value })}
                        placeholder="1"
                        type="number"
                        value={form.chapter}
                      />
                    </label>
                    <label className="flex-1">
                      <span className={LABEL_CLASS}>Verse</span>
                      <input
                        className={INPUT_CLASS}
                        min={1}
                        onChange={(event) => onChange({ verse: event.target.value })}
                        placeholder="1"
                        type="number"
                        value={form.verse}
                      />
                    </label>
                    <label className="flex-1">
                      <span className={LABEL_CLASS}>
                        End verse <span className="font-semibold normal-case tracking-normal text-ghost">— optional</span>
                      </span>
                      <input
                        className={INPUT_CLASS}
                        min={1}
                        onChange={(event) => onChange({ verseEnd: event.target.value })}
                        placeholder="—"
                        type="number"
                        value={form.verseEnd}
                      />
                    </label>
                  </div>

                  {displayRef ? (
                    <div className="text-[12.5px] font-semibold text-subtle-2">{displayRef}</div>
                  ) : null}

                  <div className="block">
                    <span className={LABEL_CLASS}>Verse text</span>
                    <div
                      className={`${INPUT_CLASS} min-h-[72px] font-display italic leading-[1.5] text-content ${
                        previewLoading ? "text-subtle-2" : ""
                      }`}
                    >
                      {previewLoading
                        ? "Loading verse…"
                        : previewError
                          ? previewError
                          : previewText || "Choose a book, chapter, and verse to preview the passage."}
                    </div>
                  </div>
                </>
              ) : null}

              <DatePicker
                onChange={({ day, month, year }) => onChange({ day, month, year })}
                value={{ day: form.day, month: form.month, year: form.year }}
              />

              {form.type !== "verse" ? (
                <label className="block">
                  <span className={LABEL_CLASS}>{bodyLabel(form.type)}</span>
                  <textarea
                    className={`${INPUT_CLASS} leading-[1.55]`}
                    onChange={(event) => onChange({ body: event.target.value })}
                    placeholder={form.type === "reflection" ? "Write freely…" : "Say a little more…"}
                    rows={3}
                    value={form.body}
                  />
                </label>
              ) : null}

              {form.type === "verse" ? (
                <label className="block">
                  <span className={LABEL_CLASS}>Personal note</span>
                  <textarea
                    className={`${INPUT_CLASS} leading-[1.55]`}
                    onChange={(event) => onChange({ note: event.target.value })}
                    placeholder="What is God saying to you through this?"
                    rows={2}
                    value={form.note}
                  />
                </label>
              ) : null}

              {form.type === "prayer" ? (
                <div
                  className="rounded-2xl p-[15px_16px]"
                  style={{
                    background: "color-mix(in srgb, var(--accent) 7%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-content">Has this been answered?</div>
                    <div
                      onClick={() => onChange({ answered: !form.answered })}
                      style={{
                        background: form.answered ? "var(--accent)" : "var(--border-strong)",
                        borderRadius: 999,
                        cursor: "pointer",
                        flex: "0 0 auto",
                        height: 30,
                        position: "relative",
                        transition: "background .25s",
                        width: 52,
                      }}
                    >
                      <div
                        style={{
                          background: "var(--card)",
                          borderRadius: 999,
                          height: 24,
                          left: form.answered ? 25 : 3,
                          position: "absolute",
                          top: 3,
                          transition: "left .25s cubic-bezier(.22,.61,.36,1)",
                          width: 24,
                        }}
                      />
                    </div>
                  </div>
                  {form.answered ? (
                    <textarea
                      className={`${INPUT_CLASS} mt-3 leading-[1.5]`}
                      onChange={(event) => onChange({ answeredNote: event.target.value })}
                      placeholder="How did God answer?"
                      rows={2}
                      style={{ borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)" }}
                      value={form.answeredNote}
                    />
                  ) : null}
                </div>
              ) : null}

              <div>
                <span className={LABEL_CLASS}>
                  Photos &amp; video <span className="font-semibold normal-case tracking-normal text-ghost">— optional</span>
                </span>
                <div className="flex flex-wrap items-center gap-[10px]">
                  {form.media.map((item, index) => (
                    <div key={index} style={mediaThumbStyle(item, 64)}>
                      <div
                        className="absolute right-1 top-1 flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-full bg-black/60 text-xs text-white"
                        onClick={() => onRemoveMedia(index)}
                      >
                        <Icon name="ph-x" weight="bold" />
                      </div>
                    </div>
                  ))}
                  <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-[14px] border-[1.5px] border-dashed border-edge-strong text-[22px] text-subtle-2 transition-colors hover:border-accent hover:bg-accent/[.05] hover:text-accent">
                    <Icon name="ph-plus" weight="bold" />
                    <input
                      accept="image/*,video/*"
                      className="hidden"
                      multiple
                      onChange={(event) => {
                        // event.target.files is a live FileList — read it into a plain array before
                        // resetting the input, or the reset clears it out from under React's setState.
                        if (event.target.files) {
                          onAddFiles(Array.from(event.target.files));
                        }
                        event.target.value = "";
                      }}
                      type="file"
                    />
                  </label>
                </div>
              </div>

              <div className="mt-[6px] flex gap-[10px]">
                <button
                  className="flex-none cursor-pointer rounded-[14px] border-[1.5px] border-edge-strong bg-card px-5 py-[13px] text-[14.5px] font-semibold text-subtle transition-colors hover:bg-canvas"
                  onClick={onCancel}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-[14px] border-none p-[13px] text-[14.5px] font-semibold transition-all"
                  disabled={!saveEnabled}
                  onClick={onSave}
                  style={
                    saveEnabled
                      ? { background: "var(--accent)", color: "#fff", cursor: "pointer" }
                      : { background: "var(--border)", color: "#b0b0b5", cursor: "not-allowed" }
                  }
                  type="button"
                >
                  <Icon name="ph-check" weight="bold" /> {form.mode === "edit" ? "Save changes" : "Add entry"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
