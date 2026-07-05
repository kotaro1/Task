import { addDays, format, isSameDay as isSameDayFns, parseISO } from "date-fns";

// Rolling 7-day window starting from `base` (today), not a Mon-Sun calendar week —
// matches the requirement "1週間後までのタスクを一覧表示".
export function getWeekDays(base: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(base, i));
}

// Multiple consecutive 7-day windows starting from `base`, so scrolling down
// the week view reveals further weeks (a rolling month-ish view).
export function getWeeks(base: Date, weekCount: number): Date[][] {
  return Array.from({ length: weekCount }, (_, w) =>
    getWeekDays(addDays(base, w * 7)),
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
