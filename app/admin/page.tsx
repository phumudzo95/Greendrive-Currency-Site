"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

type Entry = {
  id: string;
  full_name: string;
  city: string;
  province: string;
  status: string;
  total_score: number | null;
  created_at: string;
};

type Counts = { total: number; pending: number; shortlisted: number; finalist: number; rejected: number };

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  pending:     { bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400"  },
  shortlisted: { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500"   },
  finalist:    { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-gd-primary" },
  rejected:    { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-400"    },
};

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<Counts>({ total: 0, pending: 0, shortlisted: 0, finalist: 0, rejected: 0 });
  const [recent, setRecent] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: err } = await sb()
        .from("competition_entries")
        .select("id,full_name,city,province,status,total_score,created_at")
        .order("created_at", { ascending: false });

      if (err) throw err;
      const all = data ?? [];

      setCounts({
        total: all.length,
        pending: all.filter(e => e.status === "pending").length,
        shortlisted: all.filter(e => e.status === "shortlisted").length,
        finalist: all.filter(e => e.status === "finalist").length,
        rejected: all.filter(e => e.status === "rejected").length,
      });
      setRecent(all.slice(0, 8));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load. Check Supabase env vars in Vercel.");
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const statCards = [
    { label: "Total Entries",  val: counts.total,       accent: "border-l-gray-400",   num: "text-gray-900"  },
    { label: "Pending Review", val: counts.pending,     accent: "border-l-amber-400",  num: "text-amber-700" },
    { label: "Shortlisted",    val: counts.shortlisted, accent: "border-l-blue-500",   num: "text-blue-700"  },
    { label: "Finalists",      val: counts.finalist,    accent: "border-l-gd-primary", num: "text-gd-primary"},
    { label: "Rejected",       val: counts.rejected,    accent: "border-l-red-400",    num: "text-red-600"   },
  ];

  return (
    <div className="space-y-8 max-w-5xl">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-[13.5px] text-gray-500 mt-0.5">Likompo Star Search 2026 · GreenDrive Currency</p>
        </div>
        <button onClick={load}
          className="h-9 px-4 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-2">
          <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <p className="text-[13.5px] font-semibold text-red-700 mb-0.5">Connection error</p>
          <p className="text-[12.5px] text-red-600">{error}</p>
          <p className="text-[12px] text-red-500 mt-2">
            Make sure <code className="bg-red-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
            <code className="bg-red-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and{" "}
            <code className="bg-red-100 px-1 rounded">NEXT_PUBLIC_ADMIN_PASSWORD</code> are set in Vercel → Settings → Environment Variables, then redeploy.
          </p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map(c => (
          <div key={c.label} className={`bg-white border border-gray-200 border-l-4 ${c.accent} rounded-xl px-4 py-5`}>
            <div className={`text-[32px] font-extrabold leading-none ${c.num}`}>
              {loading ? <span className="text-gray-300">—</span> : c.val}
            </div>
            <div className="text-[12px] text-gray-500 mt-2 font-medium">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Action cards */}
      <div>
        <h2 className="text-[14px] font-bold text-gray-700 mb-3 uppercase tracking-wide">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/admin/competition"
            className="group bg-gd-primary text-white rounded-2xl p-5 hover:bg-gd-dark transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="text-[15px] font-bold mb-1">Manage Entries</div>
            <div className="text-[12.5px] text-white/70">Score, shortlist and export contestants</div>
            <div className="mt-4 text-[13px] font-semibold text-white/90 group-hover:text-white">
              Open competition panel →
            </div>
          </Link>

          <Link href="/dj-competition" target="_blank"
            className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-purple-400/40 hover:shadow-sm transition-all">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{background:"rgba(124,58,237,0.1)"}}>🎧</div>
            <div className="text-[15px] font-bold text-gray-900 mb-1">Future Queens Entry</div>
            <div className="text-[12.5px] text-gray-500">DJ training competition form</div>
            <div className="mt-4 text-[13px] font-semibold text-purple-600">View live page ↗</div>
          </Link>
          <Link href="/competition" target="_blank"
            className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-gd-primary/40 hover:shadow-sm transition-all">
            <div className="w-10 h-10 rounded-xl bg-gd-primary/10 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-gd-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div className="text-[15px] font-bold text-gray-900 mb-1">Entry Form</div>
            <div className="text-[12.5px] text-gray-500">Public competition entry page</div>
            <div className="mt-4 text-[13px] font-semibold text-gd-primary">View live page ↗</div>
          </Link>

          <Link href="/finalists" target="_blank"
            className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-gd-primary/40 hover:shadow-sm transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
              </svg>
            </div>
            <div className="text-[15px] font-bold text-gray-900 mb-1">Finalists Page</div>
            <div className="text-[12.5px] text-gray-500">Public page showing finalists</div>
            <div className="mt-4 text-[13px] font-semibold text-gd-primary">View live page ↗</div>
          </Link>
        </div>
      </div>

      {/* Recent entries */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-bold text-gray-700 uppercase tracking-wide">Recent Entries</h2>
          <Link href="/admin/competition" className="text-[13px] font-semibold text-gd-primary hover:underline">
            View all →
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="py-14 text-center">
              <div className="inline-block w-6 h-6 border-2 border-gd-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-[13px] text-gray-400 mt-3">Loading entries…</p>
            </div>
          ) : recent.length === 0 && !error ? (
            <div className="py-14 text-center">
              <p className="text-[15px] font-semibold text-gray-400">No entries yet</p>
              <p className="text-[13px] text-gray-400 mt-1">
                Share the <Link href="/dj-competition" target="_blank"
            className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-purple-400/40 hover:shadow-sm transition-all">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{background:"rgba(124,58,237,0.1)"}}>🎧</div>
            <div className="text-[15px] font-bold text-gray-900 mb-1">Future Queens Entry</div>
            <div className="text-[12.5px] text-gray-500">DJ training competition form</div>
            <div className="mt-4 text-[13px] font-semibold text-purple-600">View live page ↗</div>
          </Link>
          <Link href="/competition" target="_blank" className="text-gd-primary underline">entry form</Link> to start receiving submissions.
              </p>
            </div>
          ) : (
            <div>
              {recent.map((e, i) => {
                const s = STATUS_STYLE[e.status] ?? STATUS_STYLE.pending;
                return (
                  <Link key={e.id} href="/admin/competition"
                    className={`flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors ${i !== recent.length - 1 ? "border-b border-gray-100" : ""}`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-gray-900 truncate">{e.full_name}</p>
                      <p className="text-[12px] text-gray-400">{e.city}, {e.province}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {e.total_score !== null && (
                        <span className="text-[13px] font-bold text-gd-primary">{e.total_score}/40</span>
                      )}
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${s.bg} ${s.text}`}>
                        {e.status}
                      </span>
                      <span className="text-[11.5px] text-gray-400 hidden sm:block">
                        {new Date(e.created_at).toLocaleDateString("en-ZA")}
                      </span>
                    </div>
                  </Link>
                );
              })}
              {counts.total > 8 && (
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
                  <Link href="/admin/competition" className="text-[13px] font-semibold text-gd-primary hover:underline">
                    + {counts.total - 8} more entries — View all in competition panel →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Setup checklist — only shows when there's a connection error */}
      {error && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-[15px] font-bold text-gray-900 mb-4">Setup Checklist</h3>
          <ol className="space-y-3 text-[13.5px] text-gray-600">
            {[
              "Go to vercel.com → your project → Settings → Environment Variables",
              "Add NEXT_PUBLIC_SUPABASE_URL (from Supabase → Settings → API)",
              "Add NEXT_PUBLIC_SUPABASE_ANON_KEY (from Supabase → Settings → API → anon/public key)",
              "Add NEXT_PUBLIC_ADMIN_PASSWORD (choose a strong password e.g. Likompo2026!)",
              "Click Save, then go to Deployments → Redeploy",
              "Run the SQL from the setup guide in Supabase SQL Editor",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-gd-primary/10 text-gd-primary text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

    </div>
  );
}
