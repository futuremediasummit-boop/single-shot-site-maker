import { createFileRoute, Link } from "@tanstack/react-router";
import { AwaitingContent, PageHero, Section, meta } from "@/components/site/Blocks";
import { Button } from "@/components/ui/button";
import { ticketCategories, upcomingSummit } from "@/content/site";
export const Route = createFileRoute("/tickets")({
  head: () => meta("Tickets", "Register and buy tickets for the Future Media Summit."),
  component: () => {
    const open = upcomingSummit?.registrationOpen;
    return (
      <>
        <PageHero eyebrow="Tickets" title="Come join us!" intro={open ? "Choose your ticket and receive a digital QR ticket by email." : "Tickets aren’t on sale just yet — sign up for our newsletter and we’ll tell you first."} />
        <Section eyebrow="Ticket categories" title="Planned categories">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{ticketCategories.map((t) => (<div key={t} className="flex items-center justify-between rounded-lg border bg-card p-6"><span className="font-display font-semibold">{t}</span><span className="text-sm text-muted-foreground">{open ? "" : "Pricing TBA"}</span></div>))}</div>
          <div className="mt-10">{open ? <Button asChild size="xl"><Link to="/register">Register now</Link></Button> : <AwaitingContent title="Registration opens soon" body="Pricing, M-Pesa and card payment will be available when ticket sales open." action={{ to: "/contact", label: "Group or institutional enquiries" }} />}</div>
        </Section>
      </>
    );
  },
});
