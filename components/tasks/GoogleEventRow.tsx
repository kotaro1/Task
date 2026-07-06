import { GoogleCalendarEvent } from "@/lib/types";
import { formatTimeJp } from "@/lib/dates";

export function GoogleEventRow({ event }: { event: GoogleCalendarEvent }) {
  return (
    <div className="truncate rounded-lg border border-blue-200 bg-blue-50 px-1.5 py-1 text-[11px] text-blue-800">
      {!event.allDay && (
        <span className="mr-1 font-medium">{formatTimeJp(event.start)}</span>
      )}
      {event.title}
    </div>
  );
}
