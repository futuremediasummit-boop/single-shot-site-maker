import { createServerFn } from "@tanstack/react-start";

/** What the browser is allowed to see. */
export type PublicTicketType = { slug: string; name: string; blurb: string; priceKes: number | null; perks: string[]; soldOut: boolean; accreditationOnly: boolean };
export type PublicEvent = { id: string; name: string; dateLabel: string; venue: string; city: string; open: boolean; draft: boolean; ticketTypes: PublicTicketType[] };
export type PublicTicket = {
  code: string; name: string; status: "issued" | "pending_payment" | "cancelled"; checkedIn: boolean;
  typeName: string; event: { name: string; dateLabel: string; venue: string; city: string };
};

export const formatPrice = (p: number | null) => (p === null ? "TBA" : p === 0 ? "Free" : `KES ${p.toLocaleString("en-KE")}`);

export const getEvents = createServerFn({ method: "GET" }).handler(async (): Promise<PublicEvent[]> => {
  const { loadEvents } = await import("./ticketing.server");
  const { events, sold } = await loadEvents();
  return events.map((e) => ({
    id: e.id, name: e.name, dateLabel: e.date_label, venue: e.venue, city: e.city, open: e.open, draft: e.draft,
    ticketTypes: e.fms_ticket_types.map((t) => ({
      slug: t.slug, name: t.name, blurb: t.blurb, priceKes: t.price_kes, perks: t.perks,
      soldOut: t.capacity !== null && (sold.get(`${e.id}/${t.slug}`) ?? 0) >= t.capacity,
      accreditationOnly: t.accreditation_only,
    })),
  }));
});

type RegisterInput = { eventId: string; typeSlug: string; name: string; email: string; phone: string };

export const registerTicket = createServerFn({ method: "POST" })
  .validator((d: RegisterInput) => d)
  .handler(async ({ data }): Promise<{ ok: true; token: string } | { ok: false; error: string }> => {
    const { loadEvents, insert, newToken, newCode } = await import("./ticketing.server");
    const name = String(data.name ?? "").trim().slice(0, 120);
    const email = String(data.email ?? "").trim().toLowerCase().slice(0, 200);
    const phone = String(data.phone ?? "").trim().slice(0, 30);
    if (name.length < 2) return { ok: false, error: "Please enter your full name." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Please enter a valid email address." };

    const { events, sold } = await loadEvents();
    const ev = events.find((e) => e.id === data.eventId);
    if (!ev) return { ok: false, error: "Please choose an event." };
    if (!ev.open) return { ok: false, error: "Registration for this event is closed." };
    const type = ev.fms_ticket_types.find((t) => t.slug === data.typeSlug);
    if (!type) return { ok: false, error: "Please choose a ticket type." };
    if (type.accreditation_only) return { ok: false, error: "This ticket is issued through media accreditation." };
    if (type.capacity !== null && (sold.get(`${ev.id}/${type.slug}`) ?? 0) >= type.capacity) return { ok: false, error: "Sorry, this ticket type is sold out." };

    const token = newToken();
    await insert("fms_tickets", {
      token, code: newCode(), event_id: ev.id, type_slug: type.slug, name, email, phone,
      status: type.price_kes === 0 ? "issued" : "pending_payment",
    });
    return { ok: true, token };
  });

export const getTicket = createServerFn({ method: "GET" })
  .validator((d: { token: string }) => d)
  .handler(async ({ data }): Promise<PublicTicket | null> => {
    const { select } = await import("./ticketing.server");
    const token = String(data.token ?? "");
    if (token.length < 10 || token.length > 64) return null;
    const rows = await select<{
      code: string; name: string; status: PublicTicket["status"]; checked_in_at: string | null; type_slug: string;
      fms_events: { name: string; date_label: string; venue: string; city: string; fms_ticket_types: { slug: string; name: string }[] } | null;
    }[]>(`fms_tickets?token=eq.${encodeURIComponent(token)}&select=code,name,status,checked_in_at,type_slug,fms_events(name,date_label,venue,city,fms_ticket_types(slug,name))&limit=1`);
    const t = rows[0];
    if (!t || !t.fms_events) return null;
    const ev = t.fms_events;
    return {
      code: t.code, name: t.name, status: t.status, checkedIn: t.checked_in_at !== null,
      typeName: ev.fms_ticket_types.find((x) => x.slug === t.type_slug)?.name ?? t.type_slug,
      event: { name: ev.name, dateLabel: ev.date_label, venue: ev.venue, city: ev.city },
    };
  });
