import { NextRequest, NextResponse } from "next/server";
import * as ical from "node-ical";
import type { VEvent } from "node-ical";
import { createClient } from "@/lib/supabase/server";
import { GoogleCalendarEvent } from "@/lib/types";

function summaryText(summary: VEvent["summary"]): string {
  if (!summary) return "";
  return typeof summary === "string" ? summary : summary.val;
}

export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  if (!from || !to) {
    return NextResponse.json({ events: [], error: "missing range" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ events: [], error: "unauthorized" }, { status: 401 });
  }

  const { data: settings } = await supabase
    .from("user_settings")
    .select("google_calendar_ics_url")
    .maybeSingle();

  const icsUrl = settings?.google_calendar_ics_url;
  if (!icsUrl) {
    return NextResponse.json({ events: [] });
  }

  const fromDate = new Date(`${from}T00:00:00`);
  const toDate = new Date(`${to}T23:59:59`);
  const events: GoogleCalendarEvent[] = [];

  try {
    const data = await ical.async.fromURL(icsUrl);

    for (const key in data) {
      const component = data[key];
      if (!component || component.type !== "VEVENT") continue;
      const event = component;

      if (event.rrule) {
        const instances = ical.expandRecurringEvent(event, {
          from: fromDate,
          to: toDate,
        });
        for (const instance of instances) {
          events.push({
            id: `${event.uid}-${instance.start.toISOString()}`,
            title: summaryText(instance.summary),
            start: instance.start.toISOString(),
            end: instance.end.toISOString(),
            allDay: instance.isFullDay,
          });
        }
        continue;
      }

      const start = event.start;
      const end = event.end ?? event.start;
      if (start && start <= toDate && end >= fromDate) {
        events.push({
          id: event.uid,
          title: summaryText(event.summary),
          start: start.toISOString(),
          end: end.toISOString(),
          allDay: event.datetype === "date",
        });
      }
    }
  } catch {
    return NextResponse.json({
      events: [],
      error: "Googleカレンダーの取得に失敗しました",
    });
  }

  return NextResponse.json({ events });
}
