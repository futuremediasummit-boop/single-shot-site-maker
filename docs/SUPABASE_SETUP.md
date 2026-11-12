# Moving the admin fully onto Supabase

Everything the admin does now lives in your Supabase project: logins, drafts, publishing, form
submissions, registrations and check-in. **No GitHub, no `site.ts` editing, no redeploys for content.**

## One-time setup (about 10 minutes)

1. **Run the SQL.** Supabase → SQL Editor → paste `docs/supabase-setup.sql` → Run.
   (If you already have the `fms_events`, `fms_ticket_types` and `fms_tickets` tables, Part B does nothing.)
2. **Create your admin login.** Follow "PART C" at the bottom of that SQL file.
3. **Add the secrets** in Lovable (Project → Secrets), copied from Supabase → Project Settings → API:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (the `service_role` key, never shared, never put in the repo)
   - `SUPABASE_ANON_KEY` (the `anon` public key)
   - `CHECKIN_PIN` (any PIN you choose for door staff using `/verify`)
4. **Publish** the site in Lovable, open `/admin`, and sign in.

## How publishing works now

- You type in the admin: it **auto-saves your draft to Supabase** (the "Saved" label at the top).
  Drafts are shared across devices and across admins.
- **Publish** copies the draft to the live copy in Supabase. The public site reads that copy, so changes
  appear within about 15 seconds. No code, no rebuild.
- Only items switched to **Published** are put in the live copy. Draft items never leave the admin.

## Who can do what

| | Editor | Admin |
|---|---|---|
| Write, edit, publish content and site settings | yes | yes |
| Check-in list, registrations | no | yes |
| Form inbox (contact, partner, accreditation, newsletter) | no | yes |
| Add or remove team members, reset passwords | no | yes |

Permissions are checked on the server on every request, not just hidden in the menu.

## Housekeeping

- Delete the old zip files and `step1-ticketing.patch` from the repo root. They are not part of the site.
- `src/content/site.ts` is now only the starting content and brand text. You never need to edit it for updates.
