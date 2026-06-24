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
    const data = new FormData(form);

    const fullName = (data.get("full_name") as string).trim();
    const idNumber = (data.get("id_number") as string).trim();
    const cellphone = (data.get("cellphone") as string).trim();
    const city = (data.get("city") as string).trim();
    const file = fileRef.current?.files?.[0];
    const isFemale = data.get("is_female");
    const ageConfirm = data.get("age_confirm");
    const terms = data.get("terms");

    if (!fullName || !idNumber || !cellphone || !city) {
      setErrorMsg("Please complete all required fields."); return;
    }
    if (!/^\d{13}$/.test(idNumber)) {
      setErrorMsg("ID number must be exactly 13 digits."); return;
    }
    if (!/^(\+27|0)[6-8][0-9]{8}$/.test(cellphone.replace(/\s/g,""))) {
      setErrorMsg("Please enter a valid South African cellphone number."); return;
    }
    if (!file) { setErrorMsg("Please upload your 40-second video."); return; }
    if (!["video/mp4","video/quicktime","video/webm"].includes(file.type)) {
      setErrorMsg("Accepted formats: MP4, MOV, WEBM."); return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setErrorMsg(`Video must be under ${MAX_VIDEO_MB}MB. Please compress it first.`); return;
    }
    if (!isFemale) { setErrorMsg("This competition is open to women only."); return; }
    if (!ageConfirm) { setErrorMsg("You must confirm you are between 21 and 35 years old."); return; }
    if (!terms) { setErrorMsg("You must accept the terms and conditions."); return; }

    setStatus("uploading");
    setProgress(15);

    try {
      const supabase = sb();

      const { data: existing } = await supabase
        .from("competition_entries")
        .select("id")
        .eq("id_number", idNumber)
        .eq("competition_slug", "future-queens-2026")
        .maybeSingle();
      if (existing) {
        setStatus("error");
        setErrorMsg("An entry with this ID number already exists for this competition.");
        return;
      }

      setProgress(35);
      const ext = file.name.split(".").pop();
      const filename = `future-queens/${Date.now()}_${idNumber}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("competition-videos")
        .upload(filename, file, { contentType: file.type, upsert: false });
      if (uploadError) throw new Error("Video upload failed: " + uploadError.message);
      setProgress(75);

      const { data: urlData } = supabase.storage.from("competition-videos").getPublicUrl(filename);

      const { error: dbError } = await supabase.from("competition_entries").insert({
        full_name: fullName,
        id_number: idNumber,
        cellphone: cellphone.replace(/\s/g,""),
        city,
        province: "Limpopo",
        instagram_handle: (data.get("instagram_handle") as string).trim() || null,
        tiktok_handle: (data.get("tiktok_handle") as string).trim() || null,
        video_url: urlData.publicUrl,
        competition_slug: "future-queens-2026",
      });
      if (dbError) throw new Error("Failed to save entry: " + dbError.message);

      setProgress(100);
      setStatus("success");
      form.reset();
      setVideoSize(null);
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1" style={{ background: "#0a0a0a" }}>
        {/* Hero */}
        <section className="py-16 px-5 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)" }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #9333ea 0%, transparent 70%)" }} />
          <div className="relative">
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#a855f7" }}>
              FreezeTheMoment Productions · Mikatshema Group
            </p>
            <h1 className="text-[30px] sm:text-[42px] font-extrabold tracking-tight leading-tight mb-3 text-white">
              FUTURE QUEENS<br />OF THE DECKS
            </h1>
            <p className="text-[16px] font-semibold mb-4" style={{ color: "#a855f7" }}>30 Women. Free DJ Training. One Life-Changing Prize.</p>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {["JY AIR Car", "iPhone 17", "Wardrobe Makeover", "R50,000 Cash"].map(p => (
                <span key={p} className="px-3 py-1.5 rounded-full text-[12px] font-bold text-white border" style={{ borderColor: "#7c3aed", background: "rgba(124,58,237,0.15)" }}>
                  🏆 {p}
                </span>
              ))}
            </div>
            <p className="text-[14px] text-white/50 max-w-lg mx-auto">
              Limpopo women aged 21–35. No experience needed. Just passion for music.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-2xl mx-auto px-5 py-8">
          <div className="rounded-xl p-6 mb-6" style={{ background: "#111", border: "1px solid #333" }}>
            <h2 className="text-[15px] font-bold text-white mb-4">How to Enter</h2>
            <div className="space-y-3">
              {[
                { num: "1", text: "Record a 40-second video of yourself on your phone" },
                { num: "2", text: "Introduce yourself — your name" },
                { num: "3", text: "Tell us where you're from in Limpopo" },
                { num: "4", text: "Tell us WHY you deserve this free DJ training — sell yourself!" },
              ].map(s => (
                <div key={s.num} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0" style={{ background: "#7c3aed", color: "white" }}>{s.num}</span>
                  <p className="text-[13.5px] text-white/70 pt-0.5">{s.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="rounded-xl p-6 mb-6" style={{ background: "#111", border: "1px solid #333" }}>
            <h2 className="text-[15px] font-bold text-white mb-4">Requirements</h2>
            <ul className="space-y-2">
              {[
                "Women only — aged 21 to 35",
                "Must be from Limpopo",
                "South African citizen",
                "No DJ experience required — just passion",
                "40-second video — face must be visible, audio must be clear",
              ].map(r => (
                <li key={r} className="flex items-start gap-2 text-[13.5px] text-white/60">
                  <svg className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "#a855f7" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Form */}
          {status === "success" ? (
            <div className="rounded-xl p-10 text-center" style={{ background: "#111", border: "1px solid #333" }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(124,58,237,0.2)" }}>
                <svg className="h-7 w-7" style={{ color: "#a855f7" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <h2 className="text-[20px] font-bold text-white mb-2">Entry Submitted! 🎉</h2>
              <p className="text-[14px] text-white/50">Your video has been received. The 30 most passionate women will be selected. Good luck — the decks are waiting for you!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-xl p-6 space-y-5" style={{ background: "#111", border: "1px solid #333" }}>
              <h2 className="text-[17px] font-bold text-white">Apply Now</h2>

              {errorMsg && (
                <div className="bg-red-900/40 border border-red-500/50 text-red-300 text-[13px] rounded-lg px-4 py-3">{errorMsg}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name *">
                  <input name="full_name" className={djInp} placeholder="e.g. Nomsa Dlamini" required />
                </Field>
                <Field label="ID Number *">
                  <input name="id_number" className={djInp} placeholder="13-digit SA ID number" maxLength={13} required />
                </Field>
                <Field label="Cellphone Number *">
                  <input name="cellphone" className={djInp} placeholder="e.g. 082 123 4567" required />
                </Field>
                <Field label="Town / District in Limpopo *">
                  <select name="city" className={djInp} defaultValue="" required>
                    <option value="" disabled>Select your area</option>
                    {LIMPOPO_DISTRICTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Instagram Handle">
                  <input name="instagram_handle" className={djInp} placeholder="@yourusername" />
                </Field>
                <Field label="TikTok Handle">
                  <input name="tiktok_handle" className={djInp} placeholder="@yourusername" />
                </Field>
              </div>

              {/* Video */}
              <div className="space-y-2">
                <Field label={`Upload Your 40-Second Video * (MP4, MOV or WEBM — max ${MAX_VIDEO_MB}MB)`}>
                  <input
                    ref={fileRef} name="video" type="file"
                    accept="video/mp4,video/quicktime,video/webm"
                    onChange={() => setVideoSize(fileRef.current?.files?.[0]?.size ?? null)}
                    className="block w-full text-[13.5px] text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[13px] file:font-semibold cursor-pointer"
                    style={{ "--file-bg": "#7c3aed" } as React.CSSProperties}
                    required
                  />
                </Field>

                {videoSize !== null && (
                  <div className={`flex items-center gap-2 text-[12.5px] rounded-lg px-3 py-2 ${videoTooLarge ? "bg-red-900/30 border border-red-500/40 text-red-300" : "bg-green-900/30 border border-green-500/40 text-green-300"}`}>
                    {videoTooLarge
                      ? `File is ${(videoSize/1024/1024).toFixed(1)}MB — too large. Max is ${MAX_VIDEO_MB}MB.`
                      : `File size: ${(videoSize/1024/1024).toFixed(1)}MB ✓`}
                  </div>
                )}

                <div className="rounded-lg px-4 py-3" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}>
                  <p className="text-[13px] font-semibold text-amber-400 mb-1">Video too large? Compress it free:</p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { label: "FreeConvert", url: "https://www.freeconvert.com/video-compressor" },
                      { label: "VEED.io", url: "https://www.veed.io/tools/video-compressor" },
                      { label: "Clideo", url: "https://clideo.com/compress-video" },
                    ].map(l => (
                      <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer"
                        className="text-[12.5px] font-semibold text-amber-400 underline hover:text-amber-300">
                        {l.label} ↗
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input name="is_female" type="checkbox" className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ accentColor: "#7c3aed" }} />
                  <span className="text-[13.5px] text-white/60">I confirm that I identify as a woman *</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input name="age_confirm" type="checkbox" className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ accentColor: "#7c3aed" }} />
                  <span className="text-[13.5px] text-white/60">I confirm that I am between 21 and 35 years old *</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input name="terms" type="checkbox" className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ accentColor: "#7c3aed" }} />
                  <span className="text-[13.5px] text-white/60">I accept the terms and conditions. My video shows my face clearly and audio is clear *</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={status === "uploading" || videoTooLarge}
                className="w-full h-12 rounded-xl text-white font-bold text-[15px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: status === "uploading" || videoTooLarge ? "#4b2d8a" : "#7c3aed" }}
              >
                {status === "uploading" ? `Uploading… ${progress}%` : "Submit My Entry 🎧"}
              </button>

              {status === "uploading" && (
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#333" }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "#7c3aed" }} />
                </div>
              )}
            </form>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

const djInp = "h-11 w-full rounded-lg px-3.5 text-[14px] text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12.5px] font-semibold text-white/70">{label}</label>
      {children}
    </div>
  );
}
