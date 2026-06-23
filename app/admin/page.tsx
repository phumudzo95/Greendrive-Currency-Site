"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

type Counts = { total: number; pending: number; shortlisted: number; finalist: number; rejected: number };

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<Counts>({ total:0, pending:0, shortlisted:0, finalist:0, rejected:0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.from("competition_entries").select("status").then(({ data }) => {
      const all = data ?? [];
      setCounts({
        total: all.length,
        pending: all.filter(e => e.status === "pending").length,
        shortlisted: all.filter(e => e.status === "shortlisted").length,
        finalist: all.filter(e => e.status === "finalist").length,
        rejected: all.filter(e => e.status === "rejected").length,
      });
      setLoading(false);
    });
  }, []);

  const cards = [
    { label: "Total Entries", val: counts.total, color: "text-gray-800", bg: "bg-gray-50" },
    { label: "Pending", val: counts.pending, color: "text-amber-700", bg: "bg-amber-50" },
    { label: "Shortlisted", val: counts.shortlisted, color: "text-blue-700", bg: "bg-blue-50" },
    { label: "Finalists", val: counts.finalist, color: "text-green-700", bg: "bg-green-50" },
    { label: "Rejected", val: counts.rejected, color: "text-red-700", bg: "bg-red-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[22px] font-extrabold text-gray-900 mb-0.5">Dashboard</h1>
        <p className="text-[13.5px] text-gray-500">GreenDrive Currency admin overview</p>
      </div>

      {/* Competition section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-gray-800">Likompo Star Search 2026 — Competition Entries</h2>
          <Link href="/admin/competition" className="h-8 px-4 rounded-lg bg-gd-primary text-white text-[12.5px] font-semibold flex items-center hover:bg-gd-dark transition-colors">
            Manage Entries →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {cards.map(c => (
            <div key={c.label} className={`${c.bg} border border-gray-200 rounded-xl p-4`}>
              <div className={`text-[28px] font-extrabold ${c.color} leading-none`}>
                {loading ? "—" : c.val}
              </div>
              <div className="text-[12px] text-gray-500 mt-1.5">{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-[15px] font-bold text-gray-800 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: "/admin/competition", label: "Manage Competition Entries", desc: "Score, shortlist, export" },
            { href: "/competition", label: "Competition Entry Form", desc: "Public page — opens in new tab", external: true },
            { href: "/finalists", label: "Finalists Page", desc: "Public finalists page", external: true },
          ].map(l => (
            <Link
              key={l.href}
              href={l.href}
              target={l.external ? "_blank" : undefined}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gd-primary/50 hover:shadow-sm transition-all"
            >
              <div className="text-[14px] font-semibold text-gray-900 mb-1">{l.label}</div>
              <div className="text-[12.5px] text-gray-500">{l.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
