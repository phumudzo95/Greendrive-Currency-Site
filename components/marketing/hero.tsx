import Link from "next/link";

const TRUST_POINTS = [
  { label: "No credit checks" },
  { label: "Real-time affordability" },
  { label: "Instant handover" },
  { label: "Fuel-saving vehicles" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-5 pt-14 pb-12 sm:px-8 sm:pt-20 sm:pb-16 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="mb-7 inline-flex flex-col gap-1.5 sm:gap-2">
              <span className="text-[15px] font-semibold text-gd-mute line-through decoration-2 sm:text-[17px]">
                Banks say no.
              </span>
              <span className="text-[22px] font-extrabold tracking-tight text-gd-accent sm:text-[26px]">
                We say yes.
              </span>
            </div>

            <h1 className="text-[34px] font-extrabold leading-[1.08] tracking-tight text-gd-black sm:text-[44px] lg:text-[52px]">
              Good drivers deserve smarter financial moves.
            </h1>

            <p className="mt-5 text-[17px] font-semibold text-gd-primary sm:text-[19px]">
              Drive today. Own tomorrow.
            </p>

            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-gd-mute sm:text-[16px]">
              Prove affordability, not your credit score. Pay four months upfront, get your vehicle, and drive while you build toward ownership.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/apply"
                className="inline-flex h-13 items-center justify-center rounded-xl bg-gd-primary px-7 text-[15px] font-bold text-white shadow-sm transition-colors hover:bg-gd-dark sm:h-14"
              >
                Apply Now
              </Link>
              <Link
                href="/#how-it-works"
                className="inline-flex h-13 items-center justify-center rounded-xl border-1.5 border-gd-line px-7 text-[15px] font-bold text-gd-black transition-colors hover:border-gd-primary hover:text-gd-primary sm:h-14"
              >
                Learn More
              </Link>
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 sm:mt-12 sm:grid-cols-4 sm:gap-x-4">
              {TRUST_POINTS.map((point) => (
                <div key={point.label} className="flex items-start gap-2">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="#0D7A34" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <dt className="text-[12.5px] font-semibold leading-snug text-gd-black/80">{point.label}</dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-gd-dark via-gd-primary to-gd-dark">
              <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                <svg viewBox="0 0 64 64" className="h-20 w-20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 38h44l-4-16a5 5 0 0 0-5-4H19a5 5 0 0 0-5 4l-4 16z" />
                  <circle cx="19" cy="44" r="4" fill="white" stroke="none" />
                  <circle cx="45" cy="44" r="4" fill="white" stroke="none" />
                  <path d="M10 38v-2M54 38v-2" />
                </svg>
                <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-white/70">
                  Your vehicle, your future
                </p>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-gd-line bg-white px-5 py-4 shadow-lg sm:block">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gd-mute">Monthly saving</p>
              <p className="text-[22px] font-extrabold text-gd-primary">R5,100+</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
