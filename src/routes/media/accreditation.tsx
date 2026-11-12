import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, meta } from "@/components/site/Blocks";
import { EnquiryForm } from "@/components/site/Forms";
export const Route = createFileRoute("/media/accreditation")({
  head: () => meta("Media Accreditation", "Apply for press accreditation to cover the Future Media Summit."),
  component: () => (
    <>
      <PageHero eyebrow="Media centre" title="Media accreditation" intro="Accredited journalists receive access to sessions, the press area and interview opportunities." />
      <Section tone="sky" className="!py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          {["Session access", "Press area", "Interview chances"].map((p) => (<div key={p} className="reveal rounded-3xl bg-card p-5 text-center font-display font-bold shadow-card">{p}</div>))}
        </div>
      </Section>
      <Section>
        <EnquiryForm kind="accreditation" submitLabel="Apply for accreditation" fields={[
          { name: "name", label: "Full name", required: true }, { name: "outlet", label: "Media outlet", required: true },
          { name: "email", label: "Email", type: "email", required: true }, { name: "phone", label: "Phone", type: "tel", required: true },
          { name: "role", label: "Role", type: "select", options: ["Reporter", "Editor", "Photographer", "Camera operator", "Producer", "Content creator"], required: true }, { name: "portfolio", label: "Portfolio / published work link" },
          { name: "coverage", label: "Planned coverage", type: "textarea" },
        ]} />
      </Section>
    </>
  ),
});
