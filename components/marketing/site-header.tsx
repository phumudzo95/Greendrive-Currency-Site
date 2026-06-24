"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#drivers",      label: "For drivers"  },
  { href: "/#business",     label: "For business" },
  { href: "/#faqs",         label: "FAQs"          },
  { href: "/competition",   label: "Likompo 2026"  },
  { href: "/dj-competition",label: "Future Queens" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gd-line bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">

          {/* Logo */}
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

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href}
                className="text-[14px] font-medium text-gd-black/70 transition-colors hover:text-gd-primary">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link href="https://wa.me/27696568639"
              className="hidden text-[13.5px] font-semibold text-gd-black/70 hover:text-gd-primary sm:block">
              069 656 8639
            </Link>
            <Link href="/apply"
              className="inline-flex h-10 items-center rounded-lg bg-gd-primary px-5 text-[13.5px] font-bold text-white transition-colors hover:bg-gd-dark">
              Apply Now
            </Link>

            {/* Hamburger — mobile only */}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gd-line lg:hidden"
              onClick={() => setOpen(o => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? (
                <svg className="h-5 w-5 text-gd-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gd-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          {/* Drawer */}
          <nav
            className="absolute right-0 top-16 bottom-0 w-[280px] bg-white shadow-xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex-1 overflow-y-auto py-4">
              {NAV_LINKS.map(link => (
                <Link key={link.href} href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center h-13 px-6 py-4 text-[15px] font-medium text-gd-black hover:text-gd-primary hover:bg-gd-cream transition-colors border-b border-gd-line/50">
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="p-5 border-t border-gd-line space-y-3">
              <Link href="https://wa.me/27696568639"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 h-11 rounded-xl border border-gd-line text-[14px] font-semibold text-gd-black hover:bg-gd-cream transition-colors">
                <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.855L.057 23.6a.5.5 0 0 0 .602.602l5.745-1.475A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.7-.504-5.25-1.385l-.378-.214-3.909 1.004 1.004-3.909-.214-.378A9.962 9.962 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                069 656 8639
              </Link>
              <Link href="/apply"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center h-11 rounded-xl bg-gd-primary text-white text-[14px] font-bold hover:bg-gd-dark transition-colors">
                Apply Now
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
