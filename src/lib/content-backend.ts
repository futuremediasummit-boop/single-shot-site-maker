import type { CollectionKey, Item } from "@/lib/admin-store";
import { getPublishedContent } from "@/lib/admin-api";

/**
 * CONTENT BACKEND: Supabase.
 * The public site reads the live copy ("main" row of fms_content) through a server function, so
 * visitors never touch the database directly. The admin saves its draft and publishes through the
 * admin server functions in admin-api.ts. See docs/SUPABASE_SETUP.md.
 */

export type SiteSettings = {
  tagline: string;
  email: string;
  phone: string;
  address: string;
  social: { label: string; url: string }[];
  /** Homepage numbers, e.g. { label: "Delegates", value: "500", suffix: "+" } */
  stats: { label: string; value: string; suffix: string }[];
};

export type DraftContent = {
  data: Partial<Record<CollectionKey, Item[]>>;
  settings: SiteSettings;
};

export type PublishedContent = {
  v: 1;
  updatedAt: number;
  data: Partial<Record<CollectionKey, Item[]>>;
  settings?: SiteSettings;
};

export interface ContentBackend {
  /** Latest published content, or null when nothing has been published yet. Used by the public site. */
  loadPublished(): Promise<PublishedContent | null>;
}

export const contentBackend: ContentBackend = {
  async loadPublished() {
    try { return (await getPublishedContent()) as PublishedContent | null; }
    catch { return null; }
  },
};
