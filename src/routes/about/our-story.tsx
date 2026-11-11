import { createFileRoute } from "@tanstack/react-router";
import { AwaitingContent, PageHero, Section, meta } from "@/components/site/Blocks";
export const Route = createFileRoute("/about/our-story")({
  head: () => meta("Our Story", "The story of how Future Media Summit began and where it is heading."),
  component: () => (<><PageHero eyebrow="Our story" title="How it began." /><Section><AwaitingContent title="Our story is being written" body="The official history of Future Media Summit will be published here by the summit office." /></Section></>),
});
