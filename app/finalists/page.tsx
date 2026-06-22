"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

type Finalist = {
  id: string;
  full_name: string;
  city: string;
  province: string;
  video_url: string;
};

export default function FinalistsPage() {
  const [finalists, setFinalists] = useState<Finalist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase
      .from("competition_entries")
      .select("id,full_name,city,province,video_url")
      .eq("status", "finalist")
      .order("created_at", { ascending: false })
      .then(({ data }) => { setFinalists(data ?? []); setLoading(false); });
  }, []);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-gd-cream">
        <section className="bg-gd-black text-white py-14 px-5 text-center">
          <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-gd-accent mb-2">Likompo Star Search 2026</p>
          <h1 className="text-[32px] sm:text-[40px] font-extrabold tracking-tight mb-3">Our Finalists</h1>
          <p className="text-[14px] text-white/60 max-w-md mx-auto">Public voting details will be announced soon.</p>
        </section>

        <section className="max-w-5xl mx-auto px-5 py-12">
          {loading ? (
            <p className="text-center text-gd-mute text-[14px] py-16">Loading finalists…</p>
          ) : finalists.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[17px] font-semibold text-gd-black mb-2">Finalists will be announced soon.</p>
              <p className="text-[14px] text-gd-mute">Check back here for updates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {finalists.map(f => (
                <div key={f.id} className="bg-white border border-gd-line rounded-xl overflow-hidden">
                  <video src={f.video_url} controls className="w-full aspect-video object-cover bg-black" />
                  <div className="p-4">
                    <p className="font-bold text-[15px] text-gd-black">{f.full_name}</p>
                    <p className="text-[13px] text-gd-mute">{f.city}, {f.province}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
