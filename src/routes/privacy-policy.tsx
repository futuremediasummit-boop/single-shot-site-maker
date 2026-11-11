import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, meta } from "@/components/site/Blocks";
export const Route = createFileRoute("/privacy-policy")({
  head: () => meta("Privacy Policy", "How Future Media Summit handles personal data."),
  component: () => (<><PageHero eyebrow="Legal" title="Privacy Policy" /><Section><div className="max-w-3xl space-y-4 text-muted-foreground"><p className="rounded-md bg-mist/60 p-4 text-sm text-foreground">Draft placeholder — the official policy must be reviewed and approved by the organisation’s legal advisers, including compliance with Kenya’s Data Protection Act, 2019.</p><p>We collect only the information needed to process registrations, tickets, accreditation and enquiries, and never sell personal data.</p></div></Section></>),
});
