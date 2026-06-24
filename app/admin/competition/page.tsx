"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import * as XLSX from "xlsx";

type Entry = {
  id: string; full_name: string; id_number: string; cellphone: string;
  city: string; province: string; instagram_handle: string | null;
  tiktok_handle: string | null; video_url: string; status: string;
  vocal_ability_score: number | null; stage_presence_score: number | null;
  originality_score: number | null; song_connection_score: number | null;
  total_score: number | null; judge_notes: string | null; created_at: string;
  competition_slug: string | null; proof_of_payment_url: string | null;
  email: string | null;
};

type View = "grid" | "review" | "leaderboard";

const COMPETITIONS = [
  { slug: "likompo-2026",       label: "Likompo Star Search 2026",    color: "#0d7a34" },
  { slug: "future-queens-2026", label: "Future Queens of the Decks",  color: "#7c3aed" },
];

const STATUS_CONFIG = {
  pending:     { label: "Pending",     bg: "bg-amber-100",  text: "text-amber-800",  btn: "bg-amber-500 hover:bg-amber-600" },
  shortlisted: { label: "Shortlisted", bg: "bg-blue-100",   text: "text-blue-800",   btn: "bg-blue-600 hover:bg-blue-700" },
  finalist:    { label: "Finalist",    bg: "bg-green-100",  text: "text-green-800",  btn: "bg-gd-primary hover:bg-gd-dark" },
  rejected:    { label: "Rejected",    bg: "bg-red-100",    text: "text-red-800",    btn: "bg-red-500 hover:bg-red-600" },
};

function sb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
function calcTotal(e: Entry) {
  const s = [e.vocal_ability_score, e.stage_presence_score, e.originality_score, e.song_connection_score];
  const v = s.filter((x): x is number => x !== null && !isNaN(x));
  return v.length === 4 ? Math.round(v.reduce((a,b) => a+b,0)*10)/10 : null;
}
function Badge({ status }: { status: string }) {
  const c = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  if (!c) return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600">{status}</span>;
  return <span className={`px-2.5 py-0.5 rounded-full text-[11.5px] font-bold ${c.bg} ${c.text}`}>{c.label}</span>;
}
function ScoreRing({ score, max=40 }: { score: number|null; max?: number }) {
  if (score===null) return <span className="text-[13px] text-gray-400">Unscored</span>;
  const pct=(score/max)*100;
  const color=pct>=75?"#0d7a34":pct>=50?"#2563eb":pct>=30?"#f59e0b":"#ef4444";
  return (
    <div className="flex items-center gap-2">
      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3"/>
        <circle cx="18" cy="18" r="15" fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${pct*0.942} 94.2`} strokeLinecap="round"/>
      </svg>
      <div><div className="text-[18px] font-extrabold leading-none" style={{color}}>{score}</div><div className="text-[10px] text-gray-400">/ {max}</div></div>
    </div>
  );
}
function Slider({ label, value, onChange }: { label: string; value: number|null; onChange: (v:number)=>void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[13.5px] font-semibold text-gray-700">{label}</span>
        <span className="text-[22px] font-extrabold text-gd-primary w-10 text-right">{value ?? "—"}</span>
      </div>
      <div className="relative h-3 rounded-full bg-gray-100">
        <div className="absolute inset-y-0 left-0 rounded-full bg-gd-primary transition-all" style={{width:`${(value??0)*10}%`}}/>
        <input type="range" min={1} max={10} step={0.5} value={value??0}
          onChange={e=>onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"/>
      </div>
      <div className="flex justify-between text-[10px] text-gray-400"><span>1</span><span>5</span><span>10</span></div>
    </div>
  );
}

export default function AdminCompetitionPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("grid");
  const [slug, setSlug] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reviewIdx, setReviewIdx] = useState(0);
  const [draft, setDraft] = useState<Entry|null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const { data } = await sb().from("competition_entries").select("*").order("created_at",{ascending:false});
    setEntries(data ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = entries.filter(e => {
    const q = search.toLowerCase();
    const ms = !q || [e.full_name,e.cellphone,e.city,e.province].some(v=>v.toLowerCase().includes(q));
    const ss = statusFilter==="all" || e.status===statusFilter;
    const cs = slug==="all" || e.competition_slug===slug;
    return ms && ss && cs;
  });

  const leaderboard = [...entries]
    .filter(e => e.total_score!==null && (slug==="all"||e.competition_slug===slug))
    .sort((a,b)=>(b.total_score??0)-(a.total_score??0))
    .slice(0,10);

  function openReview(idx: number) {
    setReviewIdx(idx); setDraft({...filtered[idx]}); setView("review"); setSaved(false);
  }
  function navigate(dir: number) {
    const n=reviewIdx+dir;
    if(n<0||n>=filtered.length) return;
    setReviewIdx(n); setDraft({...filtered[n]}); setSaved(false);
  }
  function updateScore(field: keyof Entry, val: number) {
    setDraft(prev => {
      if(!prev) return prev;
      const u={...prev,[field]:val};
      u.total_score=calcTotal(u);
      return u;
    });
  }
  async function saveReview() {
    if(!draft) return;
    setSaving(true);
    const total=calcTotal(draft);
    await sb().from("competition_entries").update({
      status:draft.status, vocal_ability_score:draft.vocal_ability_score,
      stage_presence_score:draft.stage_presence_score, originality_score:draft.originality_score,
      song_connection_score:draft.song_connection_score, total_score:total, judge_notes:draft.judge_notes,
    }).eq("id",draft.id);
    setSaving(false); setSaved(true); await load();
  }
  async function deleteEntry(id: string) {
    if(!confirm("Delete permanently?")) return;
    await sb().from("competition_entries").delete().eq("id",id);
    setView("grid"); load();
  }

  function toRows(data: Entry[]) {
    return data.map(e=>({
      "Competition": COMPETITIONS.find(c=>c.slug===e.competition_slug)?.label ?? e.competition_slug ?? "",
      "Full Name":e.full_name,"ID Number":e.id_number,"Cellphone":e.cellphone,
      "City":e.city,"Province":e.province,"Instagram":e.instagram_handle??"","TikTok":e.tiktok_handle??"",
      "Status":e.status,"Vocal":e.vocal_ability_score??"","Stage":e.stage_presence_score??"",
      "Originality":e.originality_score??"","Song Connection":e.song_connection_score??"",
      "Total Score":e.total_score??"","Notes":e.judge_notes??"",
      "Email":e.email??"",
      "Proof of Payment":e.proof_of_payment_url??"",
      "Submitted":new Date(e.created_at).toLocaleDateString("en-ZA"),
    }));
  }
  function exportCSV(data: Entry[]) {
    const rows=toRows(data);
    const h=Object.keys(rows[0]??{});
    const blob=new Blob([[h,...rows.map(r=>h.map(k=>`"${String((r as Record<string,unknown>)[k]??'').replace(/"/g,'""')}"`).join(","))].join("\n")],{type:"text/csv"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`entries_${Date.now()}.csv`;a.click();
  }
  function exportExcel(data: Entry[]) {
    const ws=XLSX.utils.json_to_sheet(toRows(data));
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,"Entries");
    XLSX.writeFile(wb,`entries_${Date.now()}.xlsx`);
  }

  const compColor = slug==="future-queens-2026" ? "#7c3aed" : "#0d7a34";

  // ── GRID ──
  if (view==="grid") return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-extrabold text-gray-900">Competition Entries</h1>
          <p className="text-[13px] text-gray-500">{filtered.length} entries shown</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={()=>setView("leaderboard")} className="h-9 px-4 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50">🏆 Top 10</button>
          <Link href="/admin/bulk-email/" className="h-9 px-4 rounded-lg bg-gray-900 text-white text-[13px] font-semibold hover:bg-gray-800 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            Bulk Email
          </Link>
          <button onClick={()=>exportCSV(filtered)} className="h-9 px-4 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50">CSV</button>
          <button onClick={()=>exportExcel(filtered)} className="h-9 px-4 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50">Excel</button>
          <Link href="/admin/" className="h-9 px-4 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50">← Dashboard</Link>
        </div>
      </div>

      {/* Competition tabs */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={()=>setSlug("all")} className={`h-9 px-4 rounded-xl text-[13px] font-semibold transition-colors ${slug==="all"?"bg-gray-900 text-white":"border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>All Competitions</button>
        {COMPETITIONS.map(c=>(
          <button key={c.slug} onClick={()=>setSlug(c.slug)}
            className={`h-9 px-4 rounded-xl text-[13px] font-semibold transition-colors ${slug===c.slug?"text-white":"border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            style={slug===c.slug?{background:c.color}:{}}>{c.label}</button>
        ))}
      </div>

      {/* Search + status */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search name, cellphone, city…"
          className="flex-1 h-10 border border-gray-200 rounded-xl px-4 text-[14px] focus:outline-none focus:border-gd-primary"/>
        <div className="flex gap-2 flex-wrap">
          {["all","pending","shortlisted","finalist","rejected"].map(s=>(
            <button key={s} onClick={()=>setStatusFilter(s)}
              className={`h-10 px-4 rounded-xl text-[13px] font-semibold capitalize transition-colors ${statusFilter===s?"bg-gd-primary text-white":"border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {s==="all"?"All":s}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="py-24 text-center text-gray-400 text-[15px]">Loading…</div>
      ) : filtered.length===0 ? (
        <div className="py-24 text-center text-gray-400 text-[15px]">No entries found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((e,idx)=>{
            const compCfg=COMPETITIONS.find(c=>c.slug===e.competition_slug);
            return (
              <button key={e.id} onClick={()=>openReview(idx)} className="text-left">
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-gray-300 transition-all group">
                  <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
                    <video src={e.video_url} className="w-full h-full object-cover opacity-80" preload="metadata"/>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <svg className="w-6 h-6 text-white ml-1" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    </div>
                    <div className="absolute top-3 left-3">
                      {compCfg && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{background:compCfg.color}}>{compCfg.slug==="future-queens-2026"?"🎧 Future Queens":"🎤 Likompo"}</span>}
                    </div>
                    <div className="absolute top-3 right-3"><Badge status={e.status}/></div>
                    {e.proof_of_payment_url && (
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">📄 Proof</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-[15px] text-gray-900 leading-tight">{e.full_name}</h3>
                        <p className="text-[12.5px] text-gray-500">{e.city}, {e.province}</p>
                      </div>
                      <ScoreRing score={e.total_score}/>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                      <span className="text-[12px] text-gray-400">{new Date(e.created_at).toLocaleDateString("en-ZA")}</span>
                      <span className="ml-auto text-[12.5px] font-semibold text-gd-primary group-hover:underline">Review →</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── REVIEW ──
  if (view==="review" && draft) return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <button onClick={()=>setView("grid")} className="flex items-center gap-2 text-[13.5px] font-semibold text-gray-600 hover:text-gray-900">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          Back to entries
        </button>
        <div className="flex items-center gap-2 text-[13px] text-gray-500">
          <button onClick={()=>navigate(-1)} disabled={reviewIdx===0} className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span className="font-semibold text-gray-700">{reviewIdx+1} / {filtered.length}</span>
          <button onClick={()=>navigate(1)} disabled={reviewIdx>=filtered.length-1} className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 space-y-4">
          <div className="bg-black rounded-2xl overflow-hidden">
            <video src={draft.video_url} controls className="w-full aspect-video"/>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {(() => { const c=COMPETITIONS.find(x=>x.slug===draft.competition_slug); return c?<span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold text-white" style={{background:c.color}}>{c.label}</span>:null; })()}
                </div>
                <h2 className="text-[22px] font-extrabold text-gray-900">{draft.full_name}</h2>
                <p className="text-[14px] text-gray-500">{draft.city}, {draft.province}</p>
              </div>
              <ScoreRing score={draft.total_score}/>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[13px] text-gray-600">
              <div><span className="font-semibold text-gray-800">ID Number</span><br/>{draft.id_number}</div>
              <div><span className="font-semibold text-gray-800">Cellphone</span><br/>{draft.cellphone}</div>
              {draft.email&&<div className="col-span-2"><span className="font-semibold text-gray-800">Email</span><br/>{draft.email}</div>}
              {draft.instagram_handle&&<div><span className="font-semibold text-gray-800">Instagram</span><br/>{draft.instagram_handle}</div>}
              {draft.tiktok_handle&&<div><span className="font-semibold text-gray-800">TikTok</span><br/>{draft.tiktok_handle}</div>}
              <div><span className="font-semibold text-gray-800">Submitted</span><br/>{new Date(draft.created_at).toLocaleDateString("en-ZA")}</div>
            </div>
          </div>

          {/* Proof of payment */}
          {draft.proof_of_payment_url && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-3">📄 Proof of Payment</h3>
              {draft.proof_of_payment_url.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                <img src={draft.proof_of_payment_url} alt="Proof of payment" className="rounded-xl max-w-full border border-gray-200"/>
              ) : (
                <a href={draft.proof_of_payment_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-blue-600 text-white text-[13.5px] font-semibold hover:bg-blue-700">
                  Open Proof of Payment ↗
                </a>
              )}
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider block mb-3">Judge Notes</label>
            <textarea rows={4} value={draft.judge_notes??""} onChange={e=>setDraft(p=>p?{...p,judge_notes:e.target.value}:p)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-gd-primary resize-none"
              placeholder="Add notes about this contestant…"/>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider block mb-3">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(STATUS_CONFIG).map(([key,cfg])=>(
                <button key={key} onClick={()=>setDraft(p=>p?{...p,status:key}:p)}
                  className={`h-11 rounded-xl text-[13.5px] font-bold transition-all ${draft.status===key?`${cfg.btn} text-white shadow-sm`:"border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-6">
            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider block">Judging Scores</label>
            <Slider label="🎤 Vocal Ability" value={draft.vocal_ability_score} onChange={v=>updateScore("vocal_ability_score",v)}/>
            <Slider label="🌟 Stage Presence" value={draft.stage_presence_score} onChange={v=>updateScore("stage_presence_score",v)}/>
            <Slider label="✨ Originality" value={draft.originality_score} onChange={v=>updateScore("originality_score",v)}/>
            <Slider label="🎵 Song Connection" value={draft.song_connection_score} onChange={v=>updateScore("song_connection_score",v)}/>
            <div className={`rounded-xl p-4 text-center ${draft.total_score!==null?"bg-gd-primary/5 border border-gd-primary/20":"bg-gray-50 border border-gray-200"}`}>
              <div className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Score</div>
              <div className={`text-[38px] font-extrabold leading-none ${draft.total_score!==null?"text-gd-primary":"text-gray-300"}`}>{draft.total_score??"—"}</div>
              <div className="text-[12px] text-gray-400 mt-1">out of 40</div>
            </div>
          </div>

          <div className="space-y-2">
            <button onClick={saveReview} disabled={saving} className="w-full h-12 rounded-xl bg-gd-primary text-white text-[15px] font-bold hover:bg-gd-dark disabled:opacity-60 transition-colors">
              {saving?"Saving…":saved?"✓ Saved":"Save Changes"}
            </button>
            <button onClick={()=>deleteEntry(draft.id)} className="w-full h-10 rounded-xl border border-red-200 text-red-600 text-[13.5px] font-semibold hover:bg-red-50 transition-colors">
              Delete Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── LEADERBOARD ──
  if (view==="leaderboard") return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold text-gray-900">🏆 Top 10 Leaderboard</h1>
          <p className="text-[13px] text-gray-500">{slug==="all"?"All competitions":COMPETITIONS.find(c=>c.slug===slug)?.label}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>exportCSV(leaderboard)} className="h-9 px-4 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50">CSV</button>
          <button onClick={()=>exportExcel(leaderboard)} className="h-9 px-4 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50">Excel</button>
          <button onClick={()=>setView("grid")} className="h-9 px-4 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50">← Back</button>
        </div>
      </div>
      {leaderboard.length===0?(
        <div className="bg-white border border-gray-200 rounded-2xl py-24 text-center">
          <p className="text-[16px] font-semibold text-gray-400">No scored entries yet.</p>
        </div>
      ):(
        <div className="space-y-3">
          {leaderboard.map((e,i)=>{
            const medals: Record<number,string>={0:"🥇",1:"🥈",2:"🥉"};
            const pct=((e.total_score??0)/40)*100;
            const compCfg=COMPETITIONS.find(c=>c.slug===e.competition_slug);
            return (
              <div key={e.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 hover:shadow-sm transition-shadow">
                <div className="text-[28px] w-12 text-center flex-shrink-0">
                  {medals[i]??<span className="text-[16px] font-bold text-gray-400">#{i+1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h3 className="font-bold text-[16px] text-gray-900">{e.full_name}</h3>
                    <Badge status={e.status}/>
                    {compCfg&&<span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{background:compCfg.color}}>{compCfg.slug==="future-queens-2026"?"🎧":"🎤"}</span>}
                  </div>
                  <p className="text-[13px] text-gray-500 mb-2">{e.city}, {e.province}</p>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{width:`${pct}%`,background:compColor}}/>
                  </div>
                  <div className="flex gap-4 mt-1.5 text-[11px] text-gray-400">
                    <span>Vocal: {e.vocal_ability_score??"—"}</span>
                    <span>Stage: {e.stage_presence_score??"—"}</span>
                    <span>Orig: {e.originality_score??"—"}</span>
                    <span>Song: {e.song_connection_score??"—"}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[30px] font-extrabold leading-none text-gd-primary">{e.total_score}</div>
                  <div className="text-[11px] text-gray-400">/ 40</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
  return null;
}
