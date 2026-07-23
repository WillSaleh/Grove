"use client";

import { clampDayString, daysInMonth, getDatePickerYears } from "@/lib/dates";
import { MONTHS_LONG } from "@/lib/timeline";

export type DatePickerValue = {
  day: string;
  month: number;
  year: number;
};

interface Props {
  onChange: (value: DatePickerValue) => void;
  value: DatePickerValue;
}

const INPUT_CLASS =
  "w-full rounded-[13px] border-[1.5px] border-line-3 bg-white px-[14px] py-3 text-[15px] text-ink outline-none";
const LABEL_CLASS = "mb-[6px] block text-xs font-semibold uppercase tracking-[.04em] text-muted";

export function DatePicker({ onChange, value }: Props) {
  const years = getDatePickerYears();
  const maxDay = daysInMonth(value.year, value.month);

  function update(patch: Partial<DatePickerValue>) {
    const next = { ...value, ...patch };
    onChange({
      day: clampDayString(next.day, next.year, next.month),
      month: next.month,
      year: next.year,
    });
  }

  return (
    <div className="flex items-end gap-3">
      <label className="flex-[1.4]">
        <span className={LABEL_CLASS}>Month</span>
        <select
          className={`${INPUT_CLASS} cursor-pointer`}
          onChange={(event) => update({ month: Number(event.target.value) })}
          value={String(value.month)}
        >
          {MONTHS_LONG.map((label, index) => (
            <option key={label} value={index}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex-[0.8]">
        <span className={LABEL_CLASS}>Day</span>
        <input
          className={INPUT_CLASS}
          max={maxDay}
          min={1}
          onBlur={() => update({ day: value.day })}
          onChange={(event) => onChange({ ...value, day: event.target.value })}
          type="number"
          value={value.day}
        />
      </label>
      <label className="flex-1">
        <span className={LABEL_CLASS}>Year</span>
        <select
          className={`${INPUT_CLASS} cursor-pointer`}
          onChange={(event) => update({ year: Number(event.target.value) })}
          value={String(value.year)}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
