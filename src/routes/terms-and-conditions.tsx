import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, meta } from "@/components/site/Blocks";
export const Route = createFileRoute("/terms-and-conditions")({
  head: () => meta("Terms & Conditions", "Terms governing use of the Future Media Summit website and tickets."),
  component: () => (<><PageHero eyebrow="Legal" title="Terms & Conditions" /><Section><div className="max-w-3xl space-y-4 text-muted-foreground"><p className="rounded-md bg-mist/60 p-4 text-sm text-foreground">Draft placeholder — official terms, including ticket refund and transfer rules, will be published by the organisation.</p></div></Section></>),
});
