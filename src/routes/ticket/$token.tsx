import { createFileRoute } from "@tanstack/react-router";
import { AwaitingContent, PageHero, Section } from "@/components/site/Blocks";
export const Route = createFileRoute("/ticket/$token")({
  head: () => ({ meta: [{ title: "Your ticket | Future Media Summit" }, { name: "robots", content: "noindex" }] }),
  component: () => (<><PageHero eyebrow="Digital ticket" title="Ticket lookup" /><Section><AwaitingContent title="Ticket not found" body="This ticket link is invalid or has not been issued. Check the link in your confirmation email." action={{ to: "/contact", label: "Contact the summit office" }} /></Section></>),
});
