const STEPS = [
  {
    n: "01",
    title: "Apply",
    desc: "Submit your application online or on WhatsApp. Takes a few minutes.",
  },
  {
    n: "02",
    title: "Get pre-approved",
    desc: "We assess affordability in real time. Pre-approval within an hour.",
  },
  {
    n: "03",
    title: "Pay 4 months upfront",
    desc: "This proves affordability and secures your vehicle allocation.",
  },
  {
    n: "04",
    title: "Drive, pay, and own",
    desc: "Collect your vehicle and drive while you build toward ownership.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-gd-cream py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-12 max-w-xl sm:mb-16">
          <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-gd-primary">How it works</p>
          <h2 className="mt-3 text-[28px] font-extrabold tracking-tight text-gd-black sm:text-[34px]">
            From application to ownership, four steps.
          </h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {STEPS.map((step, i) => (
            <div key={step.n} className="relative">
              <div className="flex items-center gap-3">
                <span className="text-[28px] font-extrabold text-gd-primary/20">{step.n}</span>
                {i < STEPS.length - 1 && (
                  <span className="hidden h-px flex-1 bg-gd-line lg:block" aria-hidden />
                )}
              </div>
              <h3 className="mt-3 text-[17px] font-bold text-gd-black">{step.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-gd-mute">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
