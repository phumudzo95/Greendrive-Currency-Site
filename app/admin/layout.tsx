"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const isLogin = pathname === "/admin/login";
    const ok = typeof window !== "undefined" && localStorage.getItem("gdc_admin") === "1";
    if (isLogin) { setAuthed(true); return; }
    if (!ok) { router.replace("/admin/login"); return; }
    setAuthed(true);
  }, [pathname, router]);

  if (authed === null) return null;
  if (pathname === "/admin/login") return <>{children}</>;

  function logout() {
    localStorage.removeItem("gdc_admin");
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="h-14 flex items-center px-5 border-b border-gray-200">
          <span className="text-[14px] font-extrabold tracking-tight text-gd-black">
            GREEN<span className="text-gd-primary">DRIVE</span>
          </span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          <NavItem href="/admin" exact label="Dashboard" icon="grid" />
          <NavItem href="/admin/competition" label="Competition" icon="star" />
        </nav>
        <div className="p-3 border-t border-gray-200 space-y-1">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-gray-500 hover:bg-gray-50">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            View Site
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-gray-500 hover:bg-red-50 hover:text-red-600">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6">
          <span className="text-[14px] font-semibold text-gray-700">Admin Dashboard</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, label, icon, exact }: { href: string; label: string; icon: string; exact?: boolean }) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors ${active ? "bg-gd-primary/10 text-gd-primary" : "text-gray-600 hover:bg-gray-50"}`}
    >
      <Icon name={icon} />
      {label}
    </Link>
  );
}

function Icon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  };
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={icons[name]} />
    </svg>
  );
}
