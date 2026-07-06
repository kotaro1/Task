import {
  addDays,
  format,
  isSameDay as isSameDayFns,
  parseISO,
  startOfWeek,
} from "date-fns";

// A calendar week (Sun-Sat) containing `base` — Sunday is always the
// first/leftmost column.
export function getWeekDays(base: Date): Date[] {
  const start = startOfWeek(base, { weekStartsOn: 0 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

// Multiple consecutive calendar weeks starting from the week containing
// `base`, so scrolling down the week view reveals further weeks (a rolling
// month-ish view). The first row may include days before `base` (earlier
// this week) — callers should dim those.
export function getWeeks(base: Date, weekCount: number): Date[][] {
  const firstWeekStart = startOfWeek(base, { weekStartsOn: 0 });
  return Array.from({ length: weekCount }, (_, w) =>
    getWeekDays(addDays(firstWeekStart, w * 7)),
  );
}

export function formatWeekRangeJp(weekDays: Date[]): string {
  const start = weekDays[0];
  const end = weekDays[weekDays.length - 1];
  return `${format(start, "M/d")} 〜 ${format(end, "M/d")}`;
}

export function toDateInputValue(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

const JP_WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function formatJpDay(date: Date): string {
  return `${format(date, "M/d")} (${JP_WEEKDAYS[date.getDay()]})`;
}

export function isSameDay(a: string | Date, b: Date): boolean {
  const dateA = typeof a === "string" ? parseISO(a) : a;
  return isSameDayFns(dateA, b);
}

export function formatDateTimeJp(iso: string): string {
  return format(parseISO(iso), "yyyy/MM/dd HH:mm");
}

export function formatTimeJp(iso: string): string {
  return format(parseISO(iso), "HH:mm");
}
