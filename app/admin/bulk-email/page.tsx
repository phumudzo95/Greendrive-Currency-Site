"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import Link from "next/link";

type Entry = {
  id: string;
  full_name: string;
  email: string | null;
  cellphone: string;
  status: string;
  competition_slug: string | null;
};

const COMPETITIONS = [
  { slug: "all",                label: "All Competitions" },
  { slug: "likompo-2026",       label: "Likompo Star Search 2026" },
  { slug: "future-queens-2026", label: "Future Queens of the Decks" },
];

const STATUSES = ["all","pending","shortlisted","finalist","rejected"];

const TEMPLATES: Record<string, { subject: string; body: string }> = {
  shortlisted: {
    subject: "You have been shortlisted",
    body: `Hi {name},\n\nCongratulations — you have been shortlisted for the competition.\n\nWe will be in touch shortly with further details on the next steps.\n\nThank you for your entry.\n\nThe Team`,
  },
  finalist: {
    subject: "You are a finalist",
    body: `Hi {name},\n\nWe are excited to let you know that you have been selected as a finalist.\n\nPlease stand by for more information on what happens next.\n\nThank you for your incredible entry.\n\nThe Team`,
  },
  rejected: {
    subject: "Update on your entry",
    body: `Hi {name},\n\nThank you for submitting your entry. After careful review, we regret to inform you that your entry was not selected at this stage.\n\nWe encourage you to keep working on your craft and look out for future opportunities.\n\nThank you for your participation.\n\nThe Team`,
  },
  custom: {
    subject: "",
    body: "",
  },
};

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function BulkEmailPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterComp, setFilterComp] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [template, setTemplate] = useState("shortlisted");
  const [subject, setSubject] = useState(TEMPLATES.shortlisted.subject);
  const [body, setBody] = useState(TEMPLATES.shortlisted.body);
  const [fromName, setFromName] = useState("The Team");
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<{ name: string; email: string; ok: boolean; err?: string }[]>([]);
  const [step, setStep] = useState<"compose"|"confirm"|"done">("compose");

  const load = useCallback(async () => {
    const { data } = await sb()
      .from("competition_entries")
      .select("id,full_name,email,cellphone,status,competition_slug")
      .order("created_at", { ascending: false });
    setEntries(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = entries.filter(e => {
    const cs = filterComp === "all" || e.competition_slug === filterComp;
    const ss = filterStatus === "all" || e.status === filterStatus;
    return cs && ss;
  });

  const withEmail = filtered.filter(e => e.email);
  const noEmail = filtered.filter(e => !e.email);

  function toggleAll() {
    if (selected.size === withEmail.length && withEmail.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(withEmail.map(e => e.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function applyTemplate(key: string) {
    setTemplate(key);
    if (key !== "custom") {
      setSubject(TEMPLATES[key].subject);
      setBody(TEMPLATES[key].body);
    }
  }

  function preview(entry: Entry) {
    return {
      subject: subject.replace(/{name}/g, entry.full_name.split(" ")[0]),
      body: body.replace(/{name}/g, entry.full_name.split(" ")[0]),
    };
  }

  async function sendEmails() {
    const toSend = entries.filter(e => selected.has(e.id) && e.email);
    if (!toSend.length) return;
    setSending(true);
    setResults([]);

    const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY!);
    const log: typeof results = [];

    for (const entry of toSend) {
      const p = preview(entry);
      try {
        const { error } = await resend.emails.send({
          from: `${fromName} <onboarding@resend.dev>`,
          to: [entry.email!],
          subject: p.subject,
          text: p.body,
        });
        log.push({ name: entry.full_name, email: entry.email!, ok: !error, err: error?.message });
      } catch (e: unknown) {
        log.push({ name: entry.full_name, email: entry.email!, ok: false, err: e instanceof Error ? e.message : "Unknown error" });
      }
      // Small delay to avoid rate limit
      await new Promise(r => setTimeout(r, 120));
    }

    setResults(log);
    setSending(false);
    setStep("done");
  }

  const selectedEntries = entries.filter(e => selected.has(e.id));
  const sent = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold text-gray-900">Bulk Email</h1>
          <p className="text-[13px] text-gray-500">Select contestants and send them a message</p>
        </div>
        <Link href="/admin/competition/" className="h-9 px-4 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50">
          ← Back to Entries
        </Link>
      </div>

      {step === "done" ? (
        /* ── RESULTS ── */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
              <div className="text-[36px] font-extrabold text-green-600">{sent}</div>
              <div className="text-[13px] text-gray-500 mt-1">Sent successfully</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
              <div className="text-[36px] font-extrabold text-red-500">{failed}</div>
              <div className="text-[13px] text-gray-500 mt-1">Failed</div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 text-[13px] font-bold text-gray-700">Results</div>
            <div className="divide-y divide-gray-100">
              {results.map((r, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.ok ? "bg-green-500" : "bg-red-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-semibold text-gray-900">{r.name}</p>
                    <p className="text-[12px] text-gray-400 truncate">{r.email}</p>
                  </div>
                  {!r.ok && <p className="text-[12px] text-red-500 text-right max-w-[200px]">{r.err}</p>}
                  {r.ok && <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => { setStep("compose"); setResults([]); setSelected(new Set()); }}
            className="w-full h-11 rounded-xl bg-gray-900 text-white text-[14px] font-bold hover:bg-gray-800">
            Send Another Message
          </button>
        </div>

      ) : step === "confirm" ? (
        /* ── CONFIRM ── */
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="text-[14px] font-bold text-amber-800 mb-1">Ready to send</p>
            <p className="text-[13.5px] text-amber-700">
              This will send <strong>{selectedEntries.filter(e=>e.email).length} emails</strong>. Each email is personalised with the contestant&apos;s first name. This cannot be undone.
            </p>
          </div>

          {/* Preview */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Preview (first recipient)</p>
            </div>
            {(() => {
              const first = selectedEntries.find(e => e.email);
              if (!first) return null;
              const p = preview(first);
              return (
                <div className="px-5 py-4 space-y-3">
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">To</p>
                    <p className="text-[13.5px] text-gray-900">{first.full_name} &lt;{first.email}&gt;</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Subject</p>
                    <p className="text-[13.5px] font-semibold text-gray-900">{p.subject}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Message</p>
                    <pre className="text-[13px] text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{p.body}</pre>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep("compose")} className="flex-1 h-11 rounded-xl border border-gray-200 text-[14px] font-semibold text-gray-700 hover:bg-gray-50">
              Go Back
            </button>
            <button onClick={sendEmails} disabled={sending}
              className="flex-1 h-11 rounded-xl bg-gray-900 text-white text-[14px] font-bold hover:bg-gray-800 disabled:opacity-60">
              {sending ? "Sending…" : `Send to ${selectedEntries.filter(e=>e.email).length} contestants`}
            </button>
          </div>

          {sending && (
            <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                <p className="text-[13.5px] text-gray-700">Sending emails one by one to avoid spam filters… please wait.</p>
              </div>
            </div>
          )}
        </div>

      ) : (
        /* ── COMPOSE ── */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left — select recipients */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-100 space-y-3">
                <p className="text-[13px] font-bold text-gray-700">Filter & Select Recipients</p>
                <div className="flex gap-2 flex-wrap">
                  {COMPETITIONS.map(c => (
                    <button key={c.slug} onClick={() => { setFilterComp(c.slug); setSelected(new Set()); }}
                      className={`h-8 px-3 rounded-lg text-[12.5px] font-semibold transition-colors ${filterComp===c.slug?"bg-gray-900 text-white":"border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                      {c.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => { setFilterStatus(s); setSelected(new Set()); }}
                      className={`h-8 px-3 rounded-lg text-[12.5px] font-semibold capitalize transition-colors ${filterStatus===s?"bg-gd-primary text-white":"border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                      {s==="all"?"All Statuses":s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select all bar */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
                <input type="checkbox" className="h-4 w-4 accent-gray-900"
                  checked={selected.size === withEmail.length && withEmail.length > 0}
                  onChange={toggleAll} />
                <span className="text-[13px] text-gray-600">
                  {selected.size > 0 ? `${selected.size} selected` : `Select all ${withEmail.length} with email`}
                </span>
                {noEmail.length > 0 && (
                  <span className="ml-auto text-[12px] text-gray-400">{noEmail.length} missing email</span>
                )}
              </div>

              {/* Entry list */}
              {loading ? (
                <div className="py-12 text-center text-gray-400 text-[13px]">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-[13px]">No entries match these filters.</div>
              ) : (
                <div className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">
                  {filtered.map(e => {
                    const hasEmail = !!e.email;
                    return (
                      <label key={e.id} className={`flex items-center gap-3 px-4 py-3 transition-colors ${hasEmail?"cursor-pointer hover:bg-gray-50":"opacity-40 cursor-not-allowed"}`}>
                        <input type="checkbox" className="h-4 w-4 accent-gray-900 flex-shrink-0"
                          checked={selected.has(e.id)} disabled={!hasEmail}
                          onChange={() => hasEmail && toggleOne(e.id)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13.5px] font-semibold text-gray-900 truncate">{e.full_name}</p>
                          <p className="text-[12px] text-gray-400 truncate">{hasEmail ? e.email : "No email — cannot select"}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex-shrink-0 ${
                          e.status==="finalist"?"bg-green-100 text-green-800":
                          e.status==="shortlisted"?"bg-blue-100 text-blue-800":
                          e.status==="rejected"?"bg-red-100 text-red-800":
                          "bg-amber-100 text-amber-800"}`}>
                          {e.status}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right — compose */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
              <p className="text-[13px] font-bold text-gray-700">Compose Message</p>

              {/* Templates */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block mb-2">Quick Templates</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(TEMPLATES).map(k => (
                    <button key={k} onClick={() => applyTemplate(k)}
                      className={`h-9 rounded-lg text-[12.5px] font-semibold capitalize transition-colors ${template===k?"bg-gray-900 text-white":"border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              {/* From name */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block mb-2">From Name</label>
                <input value={fromName} onChange={e=>setFromName(e.target.value)}
                  className="w-full h-10 border border-gray-200 rounded-lg px-3 text-[13.5px] focus:outline-none focus:border-gray-400"
                  placeholder="e.g. Likompo Star Search" />
              </div>

              {/* Subject */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block mb-2">Subject Line</label>
                <input value={subject} onChange={e=>{setSubject(e.target.value);setTemplate("custom");}}
                  className="w-full h-10 border border-gray-200 rounded-lg px-3 text-[13.5px] focus:outline-none focus:border-gray-400"
                  placeholder="e.g. Update on your entry" />
              </div>

              {/* Body */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block mb-2">
                  Message Body
                  <span className="ml-2 normal-case font-normal text-gray-400">— use {"{name}"} for first name</span>
                </label>
                <textarea rows={10} value={body}
                  onChange={e=>{setBody(e.target.value);setTemplate("custom");}}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] focus:outline-none focus:border-gray-400 resize-none font-mono"
                  placeholder="Type your message here…" />
              </div>

              <button
                disabled={selected.size === 0 || !subject.trim() || !body.trim()}
                onClick={() => setStep("confirm")}
                className="w-full h-11 rounded-xl bg-gray-900 text-white text-[14px] font-bold hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                {selected.size === 0 ? "Select recipients first" : `Review & Send to ${selected.size}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
