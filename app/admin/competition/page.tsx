"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

type Entry = {
  id: string;
  full_name: string;
  id_number: string;
  cellphone: string;
  city: string;
  province: string;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  video_url: string;
  status: string;
  vocal_ability_score: number | null;
  stage_presence_score: number | null;
  originality_score: number | null;
  song_connection_score: number | null;
  total_score: number | null;
  judge_notes: string | null;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  shortlisted: "bg-blue-100 text-blue-800",
  finalist: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function AdminCompetitionPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<Entry | null>(null);
  const [saving, setSaving] = useState(false);
  const [counts, setCounts] = useState({ total:0, pending:0, shortlisted:0, finalist:0, rejected:0 });

  const fetchEntries = useCallback(async () => {
    const supabase = getAdminClient();
    const { data } = await supabase
      .from("competition_entries")
      .select("*")
      .order("created_at", { ascending: false });
    const all = data ?? [];
    setEntries(all);
    setCounts({
      total: all.length,
      pending: all.filter(e => e.status === "pending").length,
      shortlisted: all.filter(e => e.status === "shortlisted").length,
      finalist: all.filter(e => e.status === "finalist").length,
      rejected: all.filter(e => e.status === "rejected").length,
    });
    setLoading(false);
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const filtered = entries.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.full_name.toLowerCase().includes(q) || e.cellphone.includes(q) || e.city.toLowerCase().includes(q) || e.province.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  async function saveEntry() {
    if (!selected) return;
    setSaving(true);
    const supabase = getAdminClient();
    const scores = [selected.vocal_ability_score, selected.stage_presence_score, selected.originality_score, selected.song_connection_score];
    const validScores = scores.filter(s => s !== null && s !== undefined) as number[];
    const total = validScores.length === 4 ? validScores.reduce((a,b) => a+b, 0) : null;
    await supabase.from("competition_entries").update({
      status: selected.status,
      vocal_ability_score: selected.vocal_ability_score,
      stage_presence_score: selected.stage_presence_score,
      originality_score: selected.originality_score,
      song_connection_score: selected.song_connection_score,
      total_score: total,
      judge_notes: selected.judge_notes,
    }).eq("id", selected.id);
    setSaving(false);
    await fetchEntries();
    setSelected(prev => prev ? { ...prev, total_score: total } : null);
  }

  async function deleteEntry(id: string) {
    if (!confirm("Delete this entry permanently?")) return;
    const supabase = getAdminClient();
    await supabase.from("competition_entries").delete().eq("id", id);
    setSelected(null);
    fetchEntries();
  }

  function exportCSV() {
    const headers = ["Full Name","ID Number","Cellphone","City","Province","Instagram","TikTok","Status","Vocal","Stage","Originality","Song","Total","Notes","Submitted"];
    const rows = filtered.map(e => [
      e.full_name, e.id_number, e.cellphone, e.city, e.province,
      e.instagram_handle??"", e.tiktok_handle??"", e.status,
      e.vocal_ability_score??"", e.stage_presence_score??"", e.originality_score??"", e.song_connection_score??"",
      e.total_score??"", e.judge_notes??"",
      new Date(e.created_at).toLocaleDateString("en-ZA"),
    ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `likompo_entries_${Date.now()}.csv`;
    a.click();
  }

  function scoreField(label: string, field: keyof Entry) {
    return (
      <div>
        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{label} (0–10)</label>
        <input
          type="number" min={0} max={10} step={0.1}
          value={selected?.[field] as number ?? ""}
          onChange={e => setSelected(prev => prev ? { ...prev, [field]: e.target.value === "" ? null : parseFloat(e.target.value) } : null)}
          className="mt-1 block w-full border border-gray-200 rounded-lg px-3 h-9 text-[13.5px] focus:outline-none focus:border-green-600"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-bold text-gray-900">Likompo Star Search 2026</h1>
          <p className="text-[12px] text-gray-500">Competition Admin</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="h-9 px-4 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50">Export CSV</button>
          <a href="/" className="h-9 px-4 rounded-lg bg-green-700 text-white text-[13px] font-semibold flex items-center hover:bg-green-800">← Site</a>
        </div>
      </header>

      {/* Summary cards */}
      <div className="px-6 py-6 grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: "Total", val: counts.total, color: "text-gray-800" },
          { label: "Pending", val: counts.pending, color: "text-amber-700" },
          { label: "Shortlisted", val: counts.shortlisted, color: "text-blue-700" },
          { label: "Finalists", val: counts.finalist, color: "text-green-700" },
          { label: "Rejected", val: counts.rejected, color: "text-red-700" },
        ].map(c => (
          <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className={`text-[26px] font-extrabold ${c.color}`}>{c.val}</div>
            <div className="text-[11.5px] text-gray-500 mt-0.5">{c.label} Entries</div>
          </div>
        ))}
      </div>

      <div className="px-6 pb-6 flex gap-6 flex-col xl:flex-row">
        {/* Entry list */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search name, cellphone, city, province…"
                className="flex-1 h-9 border border-gray-200 rounded-lg px-3 text-[13.5px] focus:outline-none focus:border-green-600"
              />
              <select
                value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="h-9 border border-gray-200 rounded-lg px-3 text-[13.5px] focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="finalist">Finalist</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            {loading ? (
              <div className="py-16 text-center text-gray-400 text-[14px]">Loading entries…</div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-[14px]">No entries found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {["Name","Cellphone","City","Province","Status","Score","Submitted",""].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 font-semibold text-gray-500 text-[11px] uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(e => (
                      <tr key={e.id} className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${selected?.id === e.id ? "bg-green-50" : ""}`} onClick={() => setSelected(e)}>
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{e.full_name}</td>
                        <td className="px-4 py-3 text-gray-600">{e.cellphone}</td>
                        <td className="px-4 py-3 text-gray-600">{e.city}</td>
                        <td className="px-4 py-3 text-gray-600">{e.province}</td>
                        <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${STATUS_COLORS[e.status] ?? "bg-gray-100 text-gray-600"}`}>{e.status}</span></td>
                        <td className="px-4 py-3 text-gray-600">{e.total_score ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{new Date(e.created_at).toLocaleDateString("en-ZA")}</td>
                        <td className="px-4 py-3"><button className="text-[12px] font-semibold text-green-700 hover:underline">Open</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-full xl:w-96 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 sticky top-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-[16px] text-gray-900">{selected.full_name}</h3>
                  <p className="text-[12px] text-gray-500">{selected.city}, {selected.province}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-[18px] leading-none">×</button>
              </div>

              <div className="text-[12.5px] text-gray-600 space-y-1">
                <p><span className="font-semibold">ID:</span> {selected.id_number}</p>
                <p><span className="font-semibold">Cell:</span> {selected.cellphone}</p>
                {selected.instagram_handle && <p><span className="font-semibold">Instagram:</span> {selected.instagram_handle}</p>}
                {selected.tiktok_handle && <p><span className="font-semibold">TikTok:</span> {selected.tiktok_handle}</p>}
              </div>

              {selected.video_url && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Video</p>
                  <video src={selected.video_url} controls className="w-full rounded-lg bg-black aspect-video" />
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Status</label>
                <select
                  value={selected.status}
                  onChange={e => setSelected(prev => prev ? { ...prev, status: e.target.value } : null)}
                  className="mt-1 block w-full border border-gray-200 rounded-lg px-3 h-9 text-[13.5px] focus:outline-none focus:border-green-600"
                >
                  <option value="pending">Pending</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="finalist">Finalist</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Judging Scores</p>
                <div className="grid grid-cols-2 gap-3">
                  {scoreField("Vocal Ability", "vocal_ability_score")}
                  {scoreField("Stage Presence", "stage_presence_score")}
                  {scoreField("Originality", "originality_score")}
                  {scoreField("Song Connection", "song_connection_score")}
                </div>
                {selected.total_score !== null && (
                  <div className="mt-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-[13px] font-bold text-green-800">
                    Total Score: {selected.total_score}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Judge Notes</label>
                <textarea
                  rows={3}
                  value={selected.judge_notes ?? ""}
                  onChange={e => setSelected(prev => prev ? { ...prev, judge_notes: e.target.value } : null)}
                  className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:border-green-600 resize-none"
                  placeholder="Add notes about this contestant…"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={saveEntry}
                  disabled={saving}
                  className="flex-1 h-9 rounded-lg bg-green-700 text-white text-[13px] font-bold hover:bg-green-800 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                <button
                  onClick={() => deleteEntry(selected.id)}
                  className="h-9 px-3 rounded-lg border border-red-200 text-red-600 text-[13px] font-semibold hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
