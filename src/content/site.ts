/**
 * Official FMS content registry.
 * Every list starts EMPTY on purpose: nothing about the organisation is invented.
 * When the organisation supplies verified information, add it here (later this moves
 * to the admin dashboard). Pages render a designed "coming soon" state while empty.
 */

export type Summit = {
  year: number;
  edition: string; // e.g. "1st Edition"
  theme: string;
  dateLabel: string; // human readable, e.g. "12–14 May 2027"
  startsAt?: string; // ISO date-time for the countdown and calendar
  endsAt?: string; // ISO date-time; if missing, a one-day event is assumed
  /** Tick on exactly one edition: the next summit the homepage should promote. */
  upcoming?: boolean;
  venue: string;
  city: string;
  registrationOpen: boolean;
  summary?: string;
  /** Sample text only: shows a "Draft" badge until the organisers confirm the real details. */
  draft?: boolean;
  highlights?: string[];
  stats?: { label: string; value: string }[];
};

export type TicketType = {
  slug: string;
  name: string;
  blurb: string;
  /** Display price, e.g. "KES 5,000". Leave "TBA" until confirmed. */
  price: string;
  perks: string[];
  draft?: boolean;
};

export type Speaker = {
  slug: string;
  name: string;
  title: string;
  organisation: string;
  role: "Keynote" | "Panellist" | "Moderator" | "Speaker";
  photo?: string;
  bio: string;
  years: number[];
};

export type Partner = {
  name: string;
  category: string;
  kind: "partner" | "sponsor";
  logo?: string;
  url?: string;
};

export type Article = {
  slug: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  body: string[];
  image?: string;
};

export type Leader = { name: string; title: string; bio: string; photo?: string };
export type Stat = { label: string; value: number; suffix?: string };
export type PressRelease = { title: string; date: string; url?: string };

export const site = {
  name: "Future Media Summit",
  short: "FMS",
  tagline: "Shaping Conversations. Transforming Media. Inspiring the Future.",
  /** Official contact details — leave null until verified. */
  contact: {
    email: "futuremediasummit@gmail.com" as string | null,
    phone: null as string | null,
    address: null as string | null,
  },
  social: [] as { label: string; url: string }[],
};

/** DRAFT editions: placeholder wording so the archive can be designed. Replace with official details. */
export const editions: Summit[] = [
  {
    year: 2025,
    edition: "2nd Edition",
    theme: "Draft theme: Stories That Move",
    dateLabel: "Date to be confirmed",
    venue: "Venue to be confirmed",
    city: "City to be confirmed",
    registrationOpen: false,
    draft: true,
    summary: "This is draft text for the 2025 edition. Replace it with the official summary: what the summit covered, who took part and what came out of it.",
    highlights: ["Draft highlight: opening keynote", "Draft highlight: panel on media and AI", "Draft highlight: creators' showcase", "Draft highlight: networking evening"],
    stats: [{ label: "Delegates", value: "TBC" }, { label: "Speakers", value: "TBC" }, { label: "Sessions", value: "TBC" }],
  },
  {
    year: 2024,
    edition: "1st Edition",
    theme: "Draft theme: The Future of Media",
    dateLabel: "Date to be confirmed",
    venue: "Venue to be confirmed",
    city: "City to be confirmed",
    registrationOpen: false,
    draft: true,
    summary: "This is draft text for the 2024 edition. Replace it with the official summary of the very first summit.",
    highlights: ["Draft highlight: launch day", "Draft highlight: newsroom roundtable", "Draft highlight: youth in media workshop"],
    stats: [{ label: "Delegates", value: "TBC" }, { label: "Speakers", value: "TBC" }, { label: "Sessions", value: "TBC" }],
  },
];
/** The summit the homepage promotes: the edition marked `upcoming`, or null when none is announced. */
export let upcomingSummit: Summit | null = editions.find((e) => e.upcoming) ?? null;
export let pastEditions: Summit[] = editions.filter((e) => !e.upcoming);
export function refreshDerived() {
  upcomingSummit = editions.find((e) => e.upcoming) ?? null;
  pastEditions = editions.filter((e) => !e.upcoming);
}
export const stats: Stat[] = [];
export const speakers: Speaker[] = [];
export const partners: Partner[] = [];
export const articles: Article[] = [];
export const leadership: Leader[] = [];
export const pressReleases: PressRelease[] = [];

export const partnershipCategories = [
  "Strategic Partners",
  "Media Partners",
  "Technology Partners",
  "Institutional Partners",
  "Academic Partners",
  "Development Partners",
];

export const sponsorshipTiers = [
  "Headline Sponsor",
  "Platinum Sponsor",
  "Gold Sponsor",
  "Silver Sponsor",
  "Session Sponsor",
  "Exhibition Sponsor",
];

export const focusAreas = [
  "Journalism",
  "Broadcasting",
  "Television & Radio",
  "Digital Media",
  "Artificial Intelligence",
  "Media Entrepreneurship",
  "Film & Creative Industries",
  "Content Creation",
  "Media Policy",
  "Media Sustainability",
  "Technology & Innovation",
  "Youth & Emerging Leaders",
];

export const ticketCategories = [
  "Standard Delegate",
  "VIP Delegate",
  "Student",
  "Media / Press",
  "Exhibitor",
  "Group Package",
];

/** DRAFT ticket types: names and perks are samples, prices stay "TBA" until confirmed. */
export const ticketTypes: TicketType[] = [
  { slug: "standard", name: "Standard Delegate", blurb: "Full access to talks, workshops and the expo floor.", price: "TBA", perks: ["All sessions", "Expo access", "Digital QR ticket"], draft: true },
  { slug: "vip", name: "VIP Delegate", blurb: "Front-row seats and the after-hours networking.", price: "TBA", perks: ["Everything in Standard", "Priority seating", "VIP lounge", "Speaker meet-and-greet"], draft: true },
  { slug: "student", name: "Student", blurb: "A friendlier price for students with a valid ID.", price: "TBA", perks: ["All sessions", "Student ID check at the door"], draft: true },
  { slug: "media", name: "Media / Press", blurb: "For accredited journalists and content creators.", price: "Free (accreditation)", perks: ["Press area", "Interview access", "Accreditation required"], draft: true },
  { slug: "exhibitor", name: "Exhibitor", blurb: "Show your brand on the expo floor.", price: "TBA", perks: ["Exhibition booth", "Listing in the programme", "2 staff passes"], draft: true },
  { slug: "group", name: "Group Package", blurb: "Bring your team or class and save.", price: "TBA", perks: ["5+ tickets", "One invoice", "Seats together"], draft: true },
];
