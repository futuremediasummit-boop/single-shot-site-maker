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
  startsAt?: string; // ISO date for the countdown
  venue: string;
  city: string;
  registrationOpen: boolean;
  summary?: string;
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

export const upcomingSummit: Summit | null = null;
export const editions: Summit[] = [];
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
