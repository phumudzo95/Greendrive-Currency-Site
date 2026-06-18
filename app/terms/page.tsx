import { SimplePage } from "@/components/marketing/simple-page";

export default function TermsPage() {
  return (
    <SimplePage eyebrow="Legal" title="Terms of Service">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13.5px] text-amber-900">
        Draft placeholder. This page must be reviewed and finalized by a
        qualified attorney before launch, and should reflect the actual
        vehicle ownership agreement terms GreenDrive Currency offers.
      </div>
      <p>
        These terms govern your use of the GreenDrive Currency website and
        application process, operated by Mikatshema Group (Pty) Ltd.
      </p>
      <p>
        Submitting an application does not guarantee approval. Approval is
        subject to an affordability assessment, document verification, and
        acceptance of a separate vehicle ownership agreement, which sets out
        the binding terms of your payment schedule and path to ownership.
      </p>
      <p>
        GreenDrive Currency reserves the right to decline any application or
        amend these terms, with notice provided through the website.
      </p>
    </SimplePage>
  );
}
