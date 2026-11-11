// Server-only. Never import this from a component: use the server functions in ./ticketing.ts.
// Storage: Supabase Postgres via PostgREST (plain fetch, so it runs on Cloudflare Workers).
// Needs two server secrets: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Never expose them to the browser.
import { randomBytes } from "node:crypto";
import { ticketTypes as siteTicketTypes, upcomingSummit } from "@/content/site";

export type TicketTypeRow = {
  slug: string; name: string; blurb: string; price_kes: number | null; perks: string[];
  capacity: number | null; accreditation_only: boolean; sort: number;
};
export type EventRow = {
  id: string; name: string; date_label: string; venue: string; city: string; open: boolean; draft: boolean;
  fms_ticket_types: TicketTypeRow[];
};

function cfg() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) throw new Error("Ticketing storage not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  return { url: url.replace(/\/$/, ""), key };
}

async function call(path: string, init: RequestInit & { prefer?: string } = {}): Promise<Response> {
  const { url, key } = cfg();
  const { prefer, ...rest } = init;
  const res = await fetch(`${url}/rest/v1/${path}`, {
    ...rest,
    headers: {
      apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}), ...(rest.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status} on ${path.split("?")[0]}: ${await res.text()}`);
  return res;
}

export async function select<T>(path: string): Promise<T> {
  return (await call(path)).json() as Promise<T>;
}
export async function insert(table: string, rows: unknown, prefer = "return=minimal"): Promise<void> {
  await call(table, { method: "POST", body: JSON.stringify(rows), prefer });
}

let seeded = false;
/** Creates the first event from src/content/site.ts if the table is empty. Safe to race (ignore-duplicates). */
export async function ensureSeed(): Promise<void> {
  if (seeded) return;
  const existing = await select<{ id: string }[]>("fms_events?select=id&limit=1");
  if (existing.length === 0) {
    const s = upcomingSummit;
    const id = "future-media-summit";
    await insert("fms_events?on_conflict=id", [{
      id, name: s ? `Future Media Summit ${s.year}` : "Future Media Summit",
      date_label: s?.dateLabel ?? "Date to be confirmed", starts_at: s?.startsAt ?? null,
      venue: s?.venue ?? "Venue to be confirmed", city: s?.city ?? "City to be confirmed",
      open: true, draft: true,
    }], "resolution=ignore-duplicates,return=minimal");
    await insert("fms_ticket_types?on_conflict=event_id,slug", siteTicketTypes.map((t, i) => ({
      event_id: id, slug: t.slug, name: t.name, blurb: t.blurb, perks: t.perks,
      price_kes: 0, capacity: null, accreditation_only: t.slug === "media", sort: i,
    })), "resolution=ignore-duplicates,return=minimal");
  }
  seeded = true;
}

export async function loadEvents(): Promise<{ events: EventRow[]; sold: Map<string, number> }> {
  await ensureSeed();
  const [events, counts] = await Promise.all([
    select<EventRow[]>("fms_events?select=*,fms_ticket_types(*)&order=created_at.asc"),
    select<{ event_id: string; type_slug: string; sold: number }[]>("fms_ticket_counts?select=*"),
  ]);
  const sold = new Map(counts.map((c) => [`${c.event_id}/${c.type_slug}`, c.sold]));
  for (const e of events) e.fms_ticket_types.sort((a, b) => a.sort - b.sort);
  return { events, sold };
}

export function newToken() { return randomBytes(16).toString("base64url"); }
export function newCode() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no look-alike characters
  const b = randomBytes(8);
  return "TK-" + Array.from(b, (x) => alphabet[x % alphabet.length]).join("");
}

export async function rpc<T>(fn: string, args: unknown): Promise<T> {
  return (await call(`rpc/${fn}`, { method: "POST", body: JSON.stringify(args) })).json() as Promise<T>;
}
