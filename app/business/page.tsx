import Link from "next/link";
import { SimplePage } from "@/components/marketing/simple-page";

const SEGMENTS = [
  "Security companies",
  "Courier & delivery services",
  "Construction companies",
  "Retail & wholesalers",
  "Maintenance & service providers",
  "Agriculture & farming",
];

export default function BusinessPage() {
  return (
    <SimplePage eyebrow="For business" title="Fleet solutions that move South Africa">
      <p>
        Fleet solutions that drive growth, reduce costs, and increase
        efficiency for the businesses keeping South Africa moving. No bank
        delays, vehicles delivered within 24 hours, and flexible payment
        options built around your business.
      </p>

      <div className="grid grid-cols-2 gap-2.5 pt-2 sm:grid-cols-3">
        {SEGMENTS.map((s) => (
          <div key={s} className="rounded-lg border border-gd-line bg-white px-3.5 py-3 text-[13px] font-semibold text-gd-black">
            {s}
          </div>
        ))}
      </div>

      <div className="pt-4">
        <Link
          href="/apply"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-gd-primary px-7 text-[14.5px] font-bold text-white transition-colors hover:bg-gd-dark"
        >
          Apply for a fleet
        </Link>
      </div>
    </SimplePage>
  );
}
