export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function yearForCalendar(year: string): number {
  const parsed = Number.parseInt(year, 10);
  return Number.isNaN(parsed) ? new Date().getFullYear() : parsed;
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

export function parseEntryYear(year: string, fallback: number): number {
  const parsed = Number.parseInt(year.trim(), 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}
