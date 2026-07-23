import { TODAY } from "@/lib/timeline";

export const DATE_PICKER_MIN_YEAR = 2000;

export function getDatePickerYears(): Array<number> {
  const years: Array<number> = [];
  for (let year = DATE_PICKER_MIN_YEAR; year <= TODAY.year; year += 1) {
    years.push(year);
  }
  return years;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function clampDayString(day: string, year: number, month: number): string {
  const parsed = Number.parseInt(day, 10);
  if (!day.trim() || Number.isNaN(parsed)) {
    return day;
  }

  const max = daysInMonth(year, month);
  return String(Math.max(1, Math.min(max, parsed)));
}

export function parseEntryDay(day: string, year: number, month: number): number {
  const max = daysInMonth(year, month);
  return Math.max(1, Math.min(max, Number.parseInt(day, 10) || 1));
}

export function clampDateParts(year: number, month: number, day: string): { year: number; month: number; day: string } {
  const clampedYear = Math.max(DATE_PICKER_MIN_YEAR, Math.min(TODAY.year, year));
  const clampedMonth = Math.max(0, Math.min(11, month));
  return {
    year: clampedYear,
    month: clampedMonth,
    day: clampDayString(day, clampedYear, clampedMonth),
  };
}
