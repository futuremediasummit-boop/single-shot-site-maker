import { createFileRoute, Link } from "@tanstack/react-router";
import { AwaitingContent, PageHero, Section, meta } from "@/components/site/Blocks";
export const Route = createFileRoute("/register")({
  head: () => meta("Register", "Register as a delegate for the Future Media Summit."),
  component: () => (<><PageHero eyebrow="Registration" title="Delegate registration" /><Section><AwaitingContent title="Registration is not open yet" body="Delegate registration will open here when tickets go on sale." action={{ to: "/tickets", label: "View ticket categories" }} /></Section></>),
});
