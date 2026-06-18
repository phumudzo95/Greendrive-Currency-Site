import Link from "next/link";

export function FinalCta() {
  return (
    <section className="bg-gd-primary py-14 sm:py-18">
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <h2 className="text-[26px] font-extrabold tracking-tight text-white sm:text-[32px]">
          Ready to take control of your future?
        </h2>
        <p className="mt-3 text-[15px] text-white/85 sm:text-[16px]">
          Join the drivers and businesses choosing ownership over rent.
        </p>
        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/apply"
            className="inline-flex h-13 items-center justify-center rounded-xl bg-white px-7 text-[15px] font-bold text-gd-primary transition-opacity hover:opacity-90 sm:h-14"
          >
            Apply Now
          </Link>
          <Link
            href="https://wa.me/27696568639"
            className="inline-flex h-13 items-center justify-center gap-2 rounded-xl border-1.5 border-white/40 px-7 text-[15px] font-bold text-white transition-colors hover:border-white sm:h-14"
          >
            Chat on WhatsApp
          </Link>
        </div>
      </div>
    </section>
  );
}
