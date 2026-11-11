// Server-only. Never import this from a component: use the server functions in ./ticketing.ts.
// Storage: ONE JSON file (data/ticketing.json). No database needed. Set TICKETING_DATA_DIR to move it.
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { ticketTypes as siteTicketTypes, upcomingSummit } from "@/content/site";

export type TicketTypeRec = {
  slug: string; name: string; blurb: string;
  /** KES. 0 = free (ticket issued instantly). null = price to be announced. */
  priceKes: number | null;
  perks: string[];
  /** null = unlimited */
  capacity: number | null;
  /** True for press tickets: only issued through accreditation approval. */
  accreditationOnly?: boolean;
};
export type EventRec = {
  id: string; name: string; dateLabel: string; startsAt?: string; venue: string; city: string;
  open: boolean; draft?: boolean; ticketTypes: TicketTypeRec[];
};
export type TicketStatus = "issued" | "pending_payment" | "cancelled";
export type TicketRec = {
  token: string; code: string; eventId: string; typeSlug: string;
  name: string; email: string; phone: string;
  status: TicketStatus; checkedInAt: number | null; createdAt: number;
};
export type Store = { v: 1; events: EventRec[]; tickets: TicketRec[] };

const DIR = process.env["TICKETING_DATA_DIR"] || path.join(process.cwd(), "data");
const FILE = path.join(DIR, "ticketing.json");

function seed(): Store {
  const s = upcomingSummit;
  return {
    v: 1,
    tickets: [],
    events: [{
      id: "future-media-summit",
      name: s ? `Future Media Summit ${s.year}` : "Future Media Summit",
      dateLabel: s?.dateLabel ?? "Date to be confirmed",
      ...(s?.startsAt ? { startsAt: s.startsAt } : {}),
      venue: s?.venue ?? "Venue to be confirmed",
      city: s?.city ?? "City to be confirmed",
      open: true,
      draft: true,
      ticketTypes: siteTicketTypes.map((t) => ({
        slug: t.slug, name: t.name, blurb: t.blurb, perks: t.perks,
        priceKes: 0, capacity: null, accreditationOnly: t.slug === "media",
      })),
    }],
  };
}

let queue: Promise<unknown> = Promise.resolve();
/** Runs one read-modify-write at a time so two registrations never overwrite each other. */
export function withStore<T>(fn: (s: Store) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    let store: Store;
    try { store = JSON.parse(await fs.readFile(FILE, "utf8")) as Store; }
    catch { store = seed(); }
    const before = JSON.stringify(store);
    const out = await fn(store);
    const after = JSON.stringify(store);
    if (after !== before || !(await exists())) {
      await fs.mkdir(DIR, { recursive: true });
      const tmp = `${FILE}.${process.pid}.tmp`;
      await fs.writeFile(tmp, after);
      await fs.rename(tmp, FILE);
    }
    return out;
  });
  queue = run.catch(() => undefined);
  return run;
}
async function exists() { try { await fs.access(FILE); return true; } catch { return false; } }

export function newToken() { return randomBytes(16).toString("base64url"); }
export function newCode() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no look-alike characters
  const b = randomBytes(8);
  return "TK-" + Array.from(b, (x) => alphabet[x % alphabet.length]).join("");
}
