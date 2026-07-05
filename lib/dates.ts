import { addDays, format, isSameDay as isSameDayFns, parseISO } from "date-fns";

// Rolling 7-day window starting from `base` (today), not a Mon-Sun calendar week —
// matches the requirement "1週間後までのタスクを一覧表示".
export function getWeekDays(base: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(base, i));
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
