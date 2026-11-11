import { createFileRoute } from "@tanstack/react-router";
import { AwaitingContent, PageHero, Section, meta } from "@/components/site/Blocks";
export const Route = createFileRoute("/checkout")({
  head: () => meta("Checkout", "Complete your Future Media Summit ticket purchase."),
  component: () => (<><PageHero eyebrow="Checkout" title="Secure checkout" /><Section><AwaitingContent title="Nothing to check out yet" body="Payments by M-Pesa and card will be available when ticket sales open." action={{ to: "/tickets", label: "Back to tickets" }} /></Section></>),
});
