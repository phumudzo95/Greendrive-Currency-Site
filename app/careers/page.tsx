import { SimplePage } from "@/components/marketing/simple-page";

export default function CareersPage() {
  return (
    <SimplePage eyebrow="Careers" title="Build the future with us">
      <p>
        Mikatshema Group is growing across business development, finance, and
        technology. We&apos;re not currently advertising open roles, but
        we&apos;re always interested in hearing from people who want to power
        people, drive businesses, and build futures with us.
      </p>
      <p>
        Send your CV and a short note about what you&apos;d like to work on to{" "}
        <a href="mailto:careers@greendrivecurrency.co.za" className="font-semibold text-gd-primary">
          careers@greendrivecurrency.co.za
        </a>
        .
      </p>
    </SimplePage>
  );
}
