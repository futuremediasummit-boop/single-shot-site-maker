import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, meta } from "@/components/site/Blocks";
import { EnquiryForm } from "@/components/site/Forms";
import { site } from "@/content/site";
export const Route = createFileRoute("/contact")({
  head: () => meta("Contact Us", "Get in touch with the Future Media Summit office."),
  component: () => (
    <>
      <PageHero eyebrow="Contact" title="Say hello 👋" />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div className="space-y-6">
            {(["email", "phone", "address"] as const).map((k) => (<div key={k} className="rounded-3xl bg-mint/40 p-5"><p className="eyebrow capitalize text-blue">{k}</p><p className="mt-2 break-words font-display font-semibold">{site.contact[k] ?? "To be announced"}</p></div>))}
          </div>
          <EnquiryForm kind="contact" submitLabel="Send message" fields={[
            { name: "name", label: "Full name", required: true }, { name: "email", label: "Email", type: "email", required: true },
            { name: "subject", label: "Enquiry type", type: "select", options: ["General", "Tickets", "Partnership & sponsorship", "Media & press", "Speaking"], required: true }, { name: "organisation", label: "Organisation" },
            { name: "message", label: "Message", type: "textarea", required: true },
          ]} />
        </div>
      </Section>
    </>
  ),
});
