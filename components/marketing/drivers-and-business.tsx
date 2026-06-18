const DRIVER_BENEFITS = [
  "Keep more of your earnings with fuel-efficient vehicles",
  "No more weekly rentals eating into your profit",
  "Low monthly payments structured for drivers",
  "Build equity while you drive",
  "Own the car. It's your asset, your future.",
];

const BUSINESS_SEGMENTS = [
  "Security companies",
  "Courier & delivery services",
  "Construction companies",
  "Retail & wholesalers",
  "Fleet owners",
  "SMEs",
];

const COMPARISON_ROWS = [
  { label: "Weekly rental", renting: "R1,400", owning: "R0" },
  { label: "Fuel cost", renting: "R6,000", owning: "R3,000" },
  { label: "Total monthly cost", renting: "R11,600", owning: "R6,500" },
];

export function DriversAndBusiness() {
  return (
    <section id="drivers" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Drivers panel */}
          <div className="rounded-2xl bg-gd-black p-8 sm:p-10">
            <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-gd-accent">For drivers</p>
            <h3 className="mt-3 text-[24px] font-extrabold leading-tight text-white sm:text-[28px]">
              Work hard. Keep more. Build your future.
            </h3>
            <ul className="mt-7 space-y-3.5">
              {DRIVER_BENEFITS.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span className="text-[14.5px] leading-snug text-white/85">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white/50">Monthly cost</th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white/50">Renting</th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gd-accent">Owning</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.label} className="border-t border-white/10">
                      <td className="px-4 py-2.5 text-[13px] text-white/70">{row.label}</td>
                      <td className="px-4 py-2.5 text-[13px] font-medium text-white/70">{row.renting}</td>
                      <td className="px-4 py-2.5 text-[13px] font-bold text-gd-accent">{row.owning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between bg-gd-accent/10 px-4 py-3">
                <span className="text-[13px] font-semibold text-white/80">Your monthly saving</span>
                <span className="text-[18px] font-extrabold text-gd-accent">R5,100+</span>
              </div>
            </div>
          </div>

          {/* Business panel */}
          <div className="rounded-2xl border border-gd-line bg-gd-cream p-8 sm:p-10">
            <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-gd-primary">For business</p>
            <h3 className="mt-3 text-[24px] font-extrabold leading-tight text-gd-black sm:text-[28px]">
              Fleet solutions that move South Africa.
            </h3>
            <p className="mt-3 text-[14.5px] leading-relaxed text-gd-mute">
              Fleet solutions that drive growth, reduce costs, and increase efficiency for the businesses keeping South Africa moving.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-2.5">
              {BUSINESS_SEGMENTS.map((segment) => (
                <div key={segment} className="rounded-lg border border-gd-line bg-white px-3.5 py-3 text-[13px] font-semibold text-gd-black">
                  {segment}
                </div>
              ))}
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { value: "24h", label: "Vehicle delivery" },
                { value: "40%", label: "Save on fuel" },
                { value: "0", label: "Bank delays" },
                { value: "100%", label: "Tax deductible" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg bg-gd-primary/5 p-3.5 text-center">
                  <p className="text-[20px] font-extrabold text-gd-primary">{stat.value}</p>
                  <p className="mt-0.5 text-[11px] font-medium leading-tight text-gd-mute">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
