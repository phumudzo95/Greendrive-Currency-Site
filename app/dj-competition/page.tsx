"use client";

import { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

const LIMPOPO_DISTRICTS = [
  "Polokwane","Mokopane","Bela-Bela","Musina","Thohoyandou",
  "Tzaneen","Phalaborwa","Giyani","Louis Trichardt","Makhado",
  "Thabazimbi","Lephalale","Burgersfort","Marble Hall","Other",
];

const MAX_VIDEO_MB = 2;
const MAX_VIDEO_BYTES = MAX_VIDEO_MB * 1024 * 1024;

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function DJCompetitionPage() {
  const [status, setStatus] = useState<"idle"|"uploading"|"success"|"error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState(0);
  const [videoSize, setVideoSize] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoTooLarge = videoSize !== null && videoSize > MAX_VIDEO_BYTES;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");
    const form = e.currentTarget;
    const fd = new FormData(form);

    const fullName = (fd.get("full_name") as string).trim();
    const idNumber = (fd.get("id_number") as string).trim();
    const cellphone = (fd.get("cellphone") as string).trim();
    const city = fd.get("city") as string;
    const file = fileRef.current?.files?.[0];

    if (!fullName || !idNumber || !cellphone || !city) { setErrorMsg("Please complete all required fields."); return; }
    if (!/^\d{13}$/.test(idNumber)) { setErrorMsg("ID number must be exactly 13 digits."); return; }
    if (!/^(\+27|0)[6-8][0-9]{8}$/.test(cellphone.replace(/\s/g,""))) { setErrorMsg("Please enter a valid South African cellphone number."); return; }
    if (!file) { setErrorMsg("Please upload your 40-second video."); return; }
    if (!["video/mp4","video/quicktime","video/webm"].includes(file.type)) { setErrorMsg("Accepted formats: MP4, MOV, WEBM."); return; }
    if (file.size > MAX_VIDEO_BYTES) { setErrorMsg(`Your video is ${(file.size/1024/1024).toFixed(1)}MB. Please compress it to under ${MAX_VIDEO_MB}MB using FreeConvert.`); return; }
    if (!fd.get("is_female")) { setErrorMsg("This competition is open to women only."); return; }
    if (!fd.get("age_confirm")) { setErrorMsg("You must confirm you are between 21 and 35 years old."); return; }
    if (!fd.get("terms")) { setErrorMsg("You must accept the terms and conditions."); return; }

    setStatus("uploading"); setProgress(15);
    try {
      const supabase = sb();
      const { data: existing } = await supabase.from("competition_entries").select("id").eq("id_number", idNumber).eq("competition_slug","future-queens-2026").maybeSingle();
      if (existing) { setStatus("error"); setErrorMsg("An entry with this ID number already exists."); return; }

      setProgress(35);
      const ext = file.name.split(".").pop();
      const filename = `future-queens/${Date.now()}_${idNumber}.${ext}`;
      const { error: upErr } = await supabase.storage.from("competition-videos").upload(filename, file, { contentType: file.type, upsert: false });
      if (upErr) throw new Error("Upload failed: " + upErr.message);
      setProgress(75);

      const { data: urlData } = supabase.storage.from("competition-videos").getPublicUrl(filename);
      const { error: dbErr } = await supabase.from("competition_entries").insert({
        full_name: fullName, id_number: idNumber,
        cellphone: cellphone.replace(/\s/g,""), city, province: "Limpopo",
        instagram_handle: (fd.get("instagram_handle") as string).trim() || null,
        tiktok_handle: (fd.get("tiktok_handle") as string).trim() || null,
        video_url: urlData.publicUrl, competition_slug: "future-queens-2026",
      });
      if (dbErr) throw new Error("Failed to save: " + dbErr.message);
      setProgress(100); setStatus("success"); form.reset(); setVideoSize(null);
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1" style={{ background: "#0d0d0d" }}>

        {/* ── HERO ── */}
        <section style={{ background: "linear-gradient(180deg, #0d0d0d 0%, #14001f 60%, #0d0d0d 100%)" }}>
          {/* Top accent line */}
          <div style={{ height: "3px", background: "linear-gradient(90deg, transparent, #c084fc, #818cf8, transparent)" }} />

          <div className="max-w-3xl mx-auto px-6 pt-16 pb-14 text-center">
            <p className="text-[11px] font-semibold tracking-[0.25em] uppercase mb-8" style={{ color: "#6b7280" }}>
              FreezeTheMoment Productions &nbsp;&middot;&nbsp; Mikatshema Group
            </p>

            <div className="mb-6">
              <h1 className="text-[13px] font-semibold tracking-[0.3em] uppercase mb-4" style={{ color: "#c084fc" }}>
                Future Queens of the Decks
              </h1>
              <div className="text-[48px] sm:text-[64px] font-black leading-none tracking-tighter text-white mb-2" style={{ letterSpacing: "-0.04em" }}>
                30 WOMEN.
              </div>
              <div className="text-[48px] sm:text-[64px] font-black leading-none tracking-tighter mb-6" style={{ letterSpacing: "-0.04em", WebkitTextStroke: "1px #c084fc", color: "transparent" }}>
                FREE TRAINING.
              </div>
              <p className="text-[17px] text-white/60 leading-relaxed max-w-xl mx-auto">
                FreezeTheMoment Productions and Mikatshema Group are looking for 30 women from Limpopo
                who have a hunger for music and a dream of owning the decks.
                No experience. No entry fee. Just passion.
              </p>
            </div>

            {/* Prize strip — no emojis, editorial style */}
            <div className="mt-10 border-t border-white/10 pt-8">
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-5" style={{ color: "#6b7280" }}>Top prize package</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px" style={{ background: "#ffffff10" }}>
                {[
                  { label: "JY Air Car", sub: "Brand new vehicle" },
                  { label: "iPhone 17", sub: "Latest model" },
                  { label: "R50,000", sub: "Cash prize" },
                  { label: "Wardrobe", sub: "Full makeover" },
                ].map(p => (
                  <div key={p.label} className="px-4 py-5 text-center" style={{ background: "#0d0d0d" }}>
                    <div className="text-[16px] font-black text-white">{p.label}</div>
                    <div className="text-[11px] mt-1" style={{ color: "#6b7280" }}>{p.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTENT ── */}
        <div className="max-w-2xl mx-auto px-5 py-12 space-y-6">

          {/* What to record */}
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #1f1f1f" }}>
            <div className="px-6 py-4" style={{ background: "#141414" }}>
              <h2 className="text-[13px] font-bold tracking-[0.15em] uppercase" style={{ color: "#c084fc" }}>What to record</h2>
            </div>
            <div style={{ background: "#111" }}>
              {[
                { n: "01", t: "Record a 40-second video on your phone — selfie camera works fine." },
                { n: "02", t: "Say your name and where you're from in Limpopo." },
                { n: "03", t: "Tell us why you deserve this training. Be real. Be direct. Show hunger." },
                { n: "04", t: "Face must be visible. Audio must be clear." },
              ].map((s, i, arr) => (
                <div key={s.n} className="flex items-start gap-5 px-6 py-5" style={{ borderBottom: i < arr.length - 1 ? "1px solid #1a1a1a" : "none" }}>
                  <span className="text-[11px] font-bold flex-shrink-0 mt-0.5" style={{ color: "#4b5563" }}>{s.n}</span>
                  <p className="text-[14px] leading-relaxed" style={{ color: "#9ca3af" }}>{s.t}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Who can apply */}
          <div className="rounded-2xl px-6 py-5 space-y-3" style={{ background: "#111", border: "1px solid #1f1f1f" }}>
            <h2 className="text-[13px] font-bold tracking-[0.15em] uppercase mb-4" style={{ color: "#c084fc" }}>Who can apply</h2>
            {[
              "Women aged 21 to 35",
              "From Limpopo",
              "South African citizen",
              "No DJ experience required",
            ].map(r => (
              <div key={r} className="flex items-center gap-3">
                <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "#c084fc" }} />
                <span className="text-[14px]" style={{ color: "#9ca3af" }}>{r}</span>
              </div>
            ))}
          </div>

          {/* Form */}
          {status === "success" ? (
            <div className="rounded-2xl px-8 py-14 text-center" style={{ background: "#111", border: "1px solid #1f1f1f" }}>
              <div className="w-12 h-12 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "rgba(192,132,252,0.12)", border: "1px solid rgba(192,132,252,0.3)" }}>
                <svg className="w-5 h-5" style={{ color: "#c084fc" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <h2 className="text-[22px] font-black text-white mb-3" style={{ letterSpacing: "-0.02em" }}>Entry received.</h2>
              <p className="text-[14px] leading-relaxed max-w-sm mx-auto" style={{ color: "#6b7280" }}>
                The 30 most passionate women will be selected for full professional DJ training with Rabs Vhafuwi and the FreezeTheMoment team. We will be in touch.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl p-6 space-y-5" style={{ background: "#111", border: "1px solid #1f1f1f" }}>
              <h2 className="text-[18px] font-black text-white" style={{ letterSpacing: "-0.02em" }}>Apply Now</h2>

              {errorMsg && (
                <div className="text-[13px] rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name *">
                  <input name="full_name" className={fi} placeholder="e.g. Nomsa Dlamini" required />
                </Field>
                <Field label="ID Number *">
                  <input name="id_number" className={fi} placeholder="13-digit SA ID number" maxLength={13} required />
                </Field>
                <Field label="Cellphone Number *">
                  <input name="cellphone" className={fi} placeholder="e.g. 082 123 4567" required />
                </Field>
                <Field label="Town / District in Limpopo *">
                  <select name="city" className={fi} defaultValue="" required>
                    <option value="" disabled style={{ color: "#6b7280" }}>Select your area</option>
                    {LIMPOPO_DISTRICTS.map(d => <option key={d} value={d} style={{ background: "#1a1a1a", color: "#fff" }}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Instagram Handle">
                  <input name="instagram_handle" className={fi} placeholder="@yourusername" />
                </Field>
                <Field label="TikTok Handle">
                  <input name="tiktok_handle" className={fi} placeholder="@yourusername" />
                </Field>
              </div>

              {/* Video upload */}
              <div className="space-y-3">
                <Field label={`Upload Your 40-Second Video — MP4, MOV or WEBM, max ${MAX_VIDEO_MB}MB *`}>
                  <label className="flex items-center gap-3 cursor-pointer rounded-xl px-4 py-3 transition-colors" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
                    <div className="h-8 px-4 rounded-lg flex items-center text-[12.5px] font-semibold flex-shrink-0" style={{ background: "#6d28d9", color: "#fff" }}>
                      Choose file
                    </div>
                    <span className="text-[13px] truncate" style={{ color: videoSize !== null ? "#e5e7eb" : "#4b5563" }}>
                      {fileRef.current?.files?.[0]?.name ?? "No file chosen"}
                    </span>
                    <input
                      ref={fileRef} name="video" type="file"
                      accept="video/mp4,video/quicktime,video/webm"
                      onChange={() => setVideoSize(fileRef.current?.files?.[0]?.size ?? null)}
                      className="sr-only" required
                    />
                  </label>
                </Field>

                {/* Live size feedback */}
                {videoSize !== null && (
                  <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-[12.5px]"
                    style={videoTooLarge
                      ? { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }
                      : { background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", color: "#86efac" }}>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {videoTooLarge
                        ? <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
                        : <path d="M20 6L9 17l-5-5"/>}
                    </svg>
                    {videoTooLarge
                      ? `${(videoSize/1024/1024).toFixed(1)}MB — over the 2MB limit. Compress it before uploading.`
                      : `${(videoSize/1024/1024).toFixed(1)}MB — good to go`}
                  </div>
                )}

                {/* Compress tip — always shown, FreeConvert only */}
                <div className="flex items-start gap-3 rounded-xl px-4 py-4" style={{ background: "#0f0f0f", border: "1px solid #222" }}>
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#854d0e" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                  <div>
                    <p className="text-[13px] font-semibold mb-1" style={{ color: "#fbbf24" }}>Video too large?</p>
                    <p className="text-[12.5px] mb-2" style={{ color: "#6b7280" }}>
                      Compress it for free at FreeConvert — no account needed.
                    </p>
                    <a href="https://www.freeconvert.com/video-compressor" target="_blank" rel="noopener noreferrer"
                      className="inline-block text-[12.5px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", color: "#fbbf24" }}>
                      Open FreeConvert
                    </a>
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 pt-1">
                {[
                  { name: "is_female", text: "I confirm I identify as a woman" },
                  { name: "age_confirm", text: "I confirm I am between 21 and 35 years old" },
                  { name: "terms", text: "I accept the terms and conditions. My face is visible in the video and audio is clear." },
                ].map(cb => (
                  <label key={cb.name} className="flex items-start gap-3 cursor-pointer">
                    <input name={cb.name} type="checkbox" className="mt-0.5 h-4 w-4 flex-shrink-0 rounded" style={{ accentColor: "#7c3aed" }} />
                    <span className="text-[13.5px] leading-snug" style={{ color: "#6b7280" }}>{cb.text} *</span>
                  </label>
                ))}
              </div>

              {/* Progress bar */}
              {status === "uploading" && (
                <div>
                  <div className="h-1 rounded-full overflow-hidden mb-2" style={{ background: "#1f1f1f" }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #6d28d9, #c084fc)" }} />
                  </div>
                  <p className="text-[12px]" style={{ color: "#4b5563" }}>Uploading {progress}%...</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "uploading" || videoTooLarge}
                className="w-full h-12 rounded-xl text-white font-bold text-[15px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)", letterSpacing: "0.02em" }}
              >
                {status === "uploading" ? "Submitting..." : "Submit My Entry"}
              </button>
            </form>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

// Input style — dark but readable, border visible, text white
const fi = [
  "h-11 w-full rounded-xl px-4 text-[14px] text-white",
  "focus:outline-none focus:ring-2 transition-colors",
  "placeholder:text-[#3d3d3d]",
].join(" ");

// Inline style applied separately because Tailwind can't handle dynamic dark bg reliably
const FI_STYLE = { background: "#1a1a1a", border: "1px solid #2a2a2a" } as React.CSSProperties;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: "#4b5563" }}>{label}</label>
      <div style={FI_STYLE} className="rounded-xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}
