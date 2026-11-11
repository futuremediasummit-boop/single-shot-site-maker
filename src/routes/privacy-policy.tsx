import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, meta } from "@/components/site/Blocks";
export const Route = createFileRoute("/privacy-policy")({
  head: () => meta("Privacy Policy", "How Future Media Summit handles personal data."),
  component: () => (<><PageHero eyebrow="Legal" title="Privacy Policy" /><Section><div className="max-w-3xl space-y-4 text-muted-foreground"><p className="rounded-3xl border-2 border-gold bg-gold/20 p-5 text-sm font-medium text-foreground">Draft placeholder — the official policy must be reviewed and approved by the organisation’s legal advisers, including compliance with Kenya’s Data Protection Act, 2019.</p><p className="reveal rounded-3xl border bg-card p-6 shadow-card">We only collect what we need to handle registrations, tickets, accreditation and your messages, and we never sell personal data.</p></div></Section></>),
});
