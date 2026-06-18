import { SimplePage } from "@/components/marketing/simple-page";

export default function PrivacyPage() {
  return (
    <SimplePage eyebrow="Legal" title="Privacy Policy">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13.5px] text-amber-900">
        Draft placeholder. This page must be reviewed and finalized by a
        qualified attorney before GreenDrive Currency collects any personal
        information from real applicants, in line with POPIA.
      </div>
      <p>
        GreenDrive Currency, a division of Mikatshema Group (Pty) Ltd,
        collects personal information you provide when you apply for vehicle
        ownership, including identity details, contact details, employment
        and income information, and supporting documents.
      </p>
      <p>
        This information is used to assess affordability, process your
        application, manage your vehicle agreement, and communicate with you
        about your account.
      </p>
      <p>
        We do not sell your personal information. Information is stored
        securely and retained only for as long as necessary to fulfil these
        purposes or as required by law.
      </p>
      <p>
        You have the right to request access to, correction of, or deletion
        of your personal information, subject to our legal and contractual
        obligations.
      </p>
    </SimplePage>
  );
}
