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
  const { withStore } = await import("./ticketing.server");
  return withStore((s) =>
    s.events.map((e) => ({
      id: e.id, name: e.name, dateLabel: e.dateLabel, venue: e.venue, city: e.city, open: e.open, draft: !!e.draft,
      ticketTypes: e.ticketTypes.map((t) => {
        const sold = s.tickets.filter((x) => x.eventId === e.id && x.typeSlug === t.slug && x.status !== "cancelled").length;
        return { slug: t.slug, name: t.name, blurb: t.blurb, priceKes: t.priceKes, perks: t.perks, soldOut: t.capacity !== null && sold >= t.capacity, accreditationOnly: !!t.accreditationOnly };
      }),
    })),
  );
});

type RegisterInput = { eventId: string; typeSlug: string; name: string; email: string; phone: string };

export const registerTicket = createServerFn({ method: "POST" })
  .validator((d: RegisterInput) => d)
  .handler(async ({ data }): Promise<{ ok: true; token: string } | { ok: false; error: string }> => {
    const { withStore, newToken, newCode } = await import("./ticketing.server");
    const name = String(data.name ?? "").trim().slice(0, 120);
    const email = String(data.email ?? "").trim().toLowerCase().slice(0, 200);
    const phone = String(data.phone ?? "").trim().slice(0, 30);
    if (name.length < 2) return { ok: false, error: "Please enter your full name." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Please enter a valid email address." };
    return withStore((s) => {
      const ev = s.events.find((e) => e.id === data.eventId);
      if (!ev) return { ok: false as const, error: "Please choose an event." };
      if (!ev.open) return { ok: false as const, error: "Registration for this event is closed." };
      const type = ev.ticketTypes.find((t) => t.slug === data.typeSlug);
      if (!type) return { ok: false as const, error: "Please choose a ticket type." };
      if (type.accreditationOnly) return { ok: false as const, error: "This ticket is issued through media accreditation." };
      const sold = s.tickets.filter((x) => x.eventId === ev.id && x.typeSlug === type.slug && x.status !== "cancelled").length;
      if (type.capacity !== null && sold >= type.capacity) return { ok: false as const, error: "Sorry, this ticket type is sold out." };
      const token = newToken();
      s.tickets.push({
        token, code: newCode(), eventId: ev.id, typeSlug: type.slug, name, email, phone,
        status: type.priceKes === 0 ? "issued" : "pending_payment", checkedInAt: null, createdAt: Date.now(),
      });
      return { ok: true as const, token };
    });
  });

export const getTicket = createServerFn({ method: "GET" })
  .validator((d: { token: string }) => d)
  .handler(async ({ data }): Promise<PublicTicket | null> => {
    const { withStore } = await import("./ticketing.server");
    const token = String(data.token ?? "");
    if (token.length < 10 || token.length > 64) return null;
    return withStore((s) => {
      const t = s.tickets.find((x) => x.token === token);
      const ev = t && s.events.find((e) => e.id === t.eventId);
      if (!t || !ev) return null;
      return {
        code: t.code, name: t.name, status: t.status, checkedIn: t.checkedInAt !== null,
        typeName: ev.ticketTypes.find((x) => x.slug === t.typeSlug)?.name ?? t.typeSlug,
        event: { name: ev.name, dateLabel: ev.dateLabel, venue: ev.venue, city: ev.city },
      };
    });
  });
