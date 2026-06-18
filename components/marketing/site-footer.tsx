import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/about", label: "About Mikatshema" },
  { href: "/business", label: "Business Fleet Solutions" },
  { href: "/careers", label: "Careers" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-gd-line bg-gd-black">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="text-[15px] font-extrabold leading-none tracking-tight text-white">
              GREEN<span className="text-gd-accent">DRIVE</span>
            </span>
            <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-white/50">
              Powering people. Driving businesses. Building futures.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] font-medium text-white/60 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-6 text-[12px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>Mikatshema Group (Pty) Ltd t/a GreenDrive Currency</p>
          <p>&copy; {new Date().getFullYear()} GreenDrive Currency. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
