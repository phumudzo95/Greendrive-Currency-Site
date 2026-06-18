import { type ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export function SimplePage({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
          <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-gd-primary">{eyebrow}</p>
          <h1 className="mt-3 text-[30px] font-extrabold tracking-tight text-gd-black sm:text-[36px]">
            {title}
          </h1>
          <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-gd-mute">
            {children}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
