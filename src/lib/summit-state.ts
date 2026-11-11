import type { Summit } from "@/content/site";

/** none = nothing announced; announced = date set, tickets closed; open = tickets on sale; live = happening now; ended = over. */
export type SummitState = "none" | "announced" | "open" | "live" | "ended";

const DAY = 24 * 60 * 60 * 1000;

export function summitState(s: Summit | null, now: number = Date.now()): SummitState {
  if (!s) return "none";
  const start = s.startsAt ? Date.parse(s.startsAt) : NaN;
  if (Number.isNaN(start)) return s.registrationOpen ? "open" : "announced";
  const end = s.endsAt ? Date.parse(s.endsAt) : start + DAY; // no end date: assume a one-day event
  if (now > end) return "ended";
  if (now >= start) return "live";
  return s.registrationOpen ? "open" : "announced";
}

/** Downloads an .ics calendar file for the summit (needs startsAt). */
export function downloadIcs(s: Summit) {
  if (!s.startsAt) return;
  const fmt = (d: string) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (t: string) => t.replace(/[\\,;]/g, (m) => `\\${m}`);
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Future Media Summit//EN", "BEGIN:VEVENT",
    `UID:fms-${s.year}@futuremediasummit`, `DTSTAMP:${fmt(new Date().toISOString())}`,
    `DTSTART:${fmt(s.startsAt)}`, `DTEND:${fmt(s.endsAt ?? s.startsAt)}`,
    `SUMMARY:${esc(`Future Media Summit ${s.year}`)}`, `LOCATION:${esc(`${s.venue}, ${s.city}`)}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url; a.download = "future-media-summit.ics"; a.click();
  URL.revokeObjectURL(url);
}

/** schema.org Event data so Google can show the summit in event results. Only uses facts we actually have. */
export function eventJsonLd(s: Summit, origin: string) {
  if (!s.startsAt) return null;
  return JSON.stringify({
    "@context": "https://schema.org", "@type": "Event",
    name: `Future Media Summit ${s.year}: ${s.theme}`,
    startDate: s.startsAt, ...(s.endsAt ? { endDate: s.endsAt } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: s.venue, address: s.city },
    description: s.summary ?? "Future Media Summit brings together journalists, broadcasters, creators, technologists and policymakers shaping the future of media.",
    organizer: { "@type": "Organization", name: "Future Media Summit", url: origin },
    url: `${origin}/summits/${s.year}`,
  });
}
