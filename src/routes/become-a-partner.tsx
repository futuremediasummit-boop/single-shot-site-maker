import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, meta } from "@/components/site/Blocks";
import { EnquiryForm } from "@/components/site/Forms";
import { partnershipCategories, sponsorshipTiers } from "@/content/site";
export const Route = createFileRoute("/become-a-partner")({
  head: () => meta("Become a Partner", "Apply to partner with or sponsor the Future Media Summit."),
  component: () => (
    <>
      <PageHero eyebrow="Partner with us" title="Let’s build the future of media together." intro="Tell us about your organisation and the kind of partnership you have in mind." />
      <Section>
        <EnquiryForm kind="partner" submitLabel="Submit application" fields={[
          { name: "organisation", label: "Organisation", required: true }, { name: "contact", label: "Contact person", required: true },
          { name: "email", label: "Email", type: "email", required: true }, { name: "phone", label: "Phone", type: "tel" },
          { name: "type", label: "Interest", type: "select", options: [...partnershipCategories, ...sponsorshipTiers], required: true }, { name: "website", label: "Website" },
          { name: "message", label: "Partnership goals", type: "textarea", required: true },
        ]} />
      </Section>
    </>
  ),
});
