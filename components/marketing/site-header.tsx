import Link from "next/link";

const NAV_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#drivers", label: "For drivers" },
  { href: "/#business", label: "For business" },
  { href: "/#faqs", label: "FAQs" },
  { href: "/competition", label: "Likompo 2026" },
  { href: "/dj-competition", label: "Future Queens 🎧" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-gd-line bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gd-primary">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17h14l-1.5-6.5a2 2 0 0 0-2-1.5H8.5a2 2 0 0 0-2 1.5L5 17z" />
              <circle cx="8.5" cy="17" r="1.5" fill="white" stroke="none" />
              <circle cx="15.5" cy="17" r="1.5" fill="white" stroke="none" />
            </svg>
          </span>
          <span className="text-[15px] font-extrabold leading-none tracking-tight text-gd-black">
            GREEN<span className="text-gd-primary">DRIVE</span>
            <span className="block text-[9px] font-semibold tracking-[0.2em] text-gd-mute">CURRENCY</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[14px] font-medium text-gd-black/70 transition-colors hover:text-gd-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="https://wa.me/27696568639"
            className="hidden text-[13.5px] font-semibold text-gd-black/70 hover:text-gd-primary sm:block"
          >
            069 656 8639
          </Link>
          <Link
            href="/apply"
            className="inline-flex h-10 items-center rounded-lg bg-gd-primary px-5 text-[13.5px] font-bold text-white transition-colors hover:bg-gd-dark"
          >
            Apply Now
          </Link>
        </div>
      </div>
    </header>
  );
}
