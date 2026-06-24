"use client";

import { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

const PROVINCES = [
  "Gauteng","Western Cape","KwaZulu-Natal","Eastern Cape",
  "Free State","Limpopo","Mpumalanga","North West","Northern Cape",
];

const MAX_VIDEO_MB = 2;
const MAX_VIDEO_BYTES = MAX_VIDEO_MB * 1024 * 1024;
const MAX_PROOF_MB = 5;
const MAX_PROOF_BYTES = MAX_PROOF_MB * 1024 * 1024;

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function CompetitionPage() {
  const [status, setStatus] = useState<"idle"|"uploading"|"success"|"error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState(0);
  const [videoSize, setVideoSize] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const proofRef = useRef<HTMLInputElement>(null);

  function handleVideoChange() {
    const file = fileRef.current?.files?.[0];
    setVideoSize(file ? file.size : null);
    setErrorMsg("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");
    const form = e.currentTarget;
    const data = new FormData(form);

    const fullName = (data.get("full_name") as string).trim();
    const idNumber = (data.get("id_number") as string).trim();
    const cellphone = (data.get("cellphone") as string).trim();
    const city = (data.get("city") as string).trim();
    const province = data.get("province") as string;
    const instagram = (data.get("instagram_handle") as string).trim();
    const tiktok = (data.get("tiktok_handle") as string).trim();
    const email = (data.get("email") as string).trim();
    const file = fileRef.current?.files?.[0];
    const proofFile = proofRef.current?.files?.[0];
    const over18 = data.get("over18");
    const terms = data.get("terms");

    if (!fullName || !idNumber || !cellphone || !city || !province) {
      setErrorMsg("Please complete all required fields."); return;
    }
    if (!/^\d{13}$/.test(idNumber)) {
      setErrorMsg("ID number must be exactly 13 digits."); return;
    }
    if (!/^(\+27|0)[6-8][0-9]{8}$/.test(cellphone.replace(/\s/g,""))) {
      setErrorMsg("Please enter a valid South African cellphone number."); return;
    }
    if (!file) { setErrorMsg("Please upload your 40-second video."); return; }
    const allowedVideo = ["video/mp4","video/quicktime","video/webm"];
    if (!allowedVideo.includes(file.type)) {
      setErrorMsg("Accepted video formats: MP4, MOV, WEBM."); return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setErrorMsg(`Video must be under ${MAX_VIDEO_MB}MB. Please compress your video first using the link below.`); return;
    }
    if (proofFile && proofFile.size > MAX_PROOF_BYTES) {
      setErrorMsg(`Proof of payment must be under ${MAX_PROOF_MB}MB.`); return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Please enter a valid email address."); return;
    }
    if (!over18) { setErrorMsg("You must confirm you are 18 years or older."); return; }
    if (!terms) { setErrorMsg("You must accept the terms and conditions."); return; }

    setStatus("uploading");
    setProgress(10);

    try {
      const supabase = sb();

      const { data: existing } = await supabase
        .from("competition_entries")
        .select("id")
        .eq("id_number", idNumber)
        .eq("competition_slug", "likompo-2026")
        .maybeSingle();
      if (existing) {
        setStatus("error");
        setErrorMsg("An entry with this ID number already exists.");
        return;
      }

      setProgress(25);
      const ext = file.name.split(".").pop();
      const filename = `likompo/${Date.now()}_${idNumber}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("competition-videos")
        .upload(filename, file, { contentType: file.type, upsert: false });
      if (uploadError) throw new Error("Video upload failed: " + uploadError.message);
      setProgress(55);

      const { data: urlData } = supabase.storage.from("competition-videos").getPublicUrl(filename);

      let proofUrl: string | null = null;
      if (proofFile) {
        const proofExt = proofFile.name.split(".").pop();
        const proofFilename = `likompo/proof/${Date.now()}_${idNumber}.${proofExt}`;
        const { error: proofErr } = await supabase.storage
          .from("competition-videos")
          .upload(proofFilename, proofFile, { contentType: proofFile.type, upsert: false });
        if (proofErr) throw new Error("Proof of payment upload failed: " + proofErr.message);
        const { data: proofUrlData } = supabase.storage.from("competition-videos").getPublicUrl(proofFilename);
        proofUrl = proofUrlData.publicUrl;
      }
      setProgress(80);

      const { error: dbError } = await supabase.from("competition_entries").insert({
        full_name: fullName,
        id_number: idNumber,
        cellphone: cellphone.replace(/\s/g,""),
        city,
        province,
        instagram_handle: instagram || null,
        tiktok_handle: tiktok || null,
        video_url: urlData.publicUrl,
        proof_of_payment_url: proofUrl,
        email,
        competition_slug: "likompo-2026",
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

  const videoTooLarge = videoSize !== null && videoSize > MAX_VIDEO_BYTES;

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-gd-cream">
        <section className="bg-gd-black text-white py-16 px-5 text-center">
          <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-gd-accent mb-3">
            Presented by Janesh the Vocalist · GreenDrive Currency · Londo VIP Protection
          </p>
          <h1 className="text-[32px] sm:text-[44px] font-extrabold tracking-tight leading-tight mb-3">
            LIKOMPO STAR SEARCH<br />COMPETITION 2026
          </h1>
          <p className="text-[18px] font-semibold text-gd-accent mb-2">Legacy Starts Here</p>
          <p className="text-[15px] text-white/60 max-w-lg mx-auto">
            Submit your 40-second live vocal video and be discovered. South African citizens 18+ only.
          </p>
        </section>

        <section className="max-w-2xl mx-auto px-5 py-10">
          <div className="bg-white border border-gd-line rounded-xl p-6 mb-8">
            <h2 className="text-[15px] font-bold text-gd-black mb-4">Entry Requirements</h2>
            <ul className="space-y-2">
              {[
                "South African citizen only",
                "18 years or older",
                "One 40-second video clip — live vocals only",
                "No lip-syncing",
                "Your face must be visible in the video",
                "Audio must be clear",
              ].map(r => (
                <li key={r} className="flex items-start gap-2 text-[13.5px] text-gd-mute">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-gd-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {status === "success" ? (
            <div className="bg-white border border-gd-line rounded-xl p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="h-7 w-7 text-gd-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <h2 className="text-[20px] font-bold text-gd-black mb-2">Entry Submitted!</h2>
              <p className="text-[14px] text-gd-mute">Your entry has been received. We will be in touch if you are shortlisted. Good luck!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-gd-line rounded-xl p-6 space-y-5">
              <h2 className="text-[17px] font-bold text-gd-black">Enter the Competition</h2>

              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-lg px-4 py-3">{errorMsg}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name (as per ID) *">
                  <input name="full_name" className={inp} placeholder="e.g. Nomsa Dlamini" required />
                </Field>
                <Field label="ID Number *">
                  <input name="id_number" className={inp} placeholder="13-digit SA ID number" maxLength={13} required />
                </Field>
                <Field label="Cellphone Number *">
                  <input name="cellphone" className={inp} placeholder="e.g. 082 123 4567" required />
                </Field>
                <Field label="City / Town *">
                  <input name="city" className={inp} placeholder="e.g. Polokwane" required />
                </Field>
                <Field label="Province *">
                  <select name="province" className={inp} defaultValue="" required>
                    <option value="" disabled>Select province</option>
                    {PROVINCES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Instagram Handle">
                  <input name="instagram_handle" className={inp} placeholder="@yourusername" />
                </Field>
                <Field label="TikTok Handle">
                  <input name="tiktok_handle" className={inp} placeholder="@yourusername" />
                </Field>
                <Field label="Email Address *">
                  <input name="email" className={inp} type="email" placeholder="e.g. nomsa@gmail.com" required />
                </Field>
              </div>

              {/* Video upload */}
              <div className="space-y-2">
                <Field label={`Upload Your 40-Second Video * (MP4, MOV or WEBM — max ${MAX_VIDEO_MB}MB)`}>
                  <input
                    ref={fileRef} name="video" type="file"
                    accept="video/mp4,video/quicktime,video/webm"
                    onChange={handleVideoChange}
                    className="block w-full text-[13.5px] text-gd-mute file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[13px] file:font-semibold file:bg-gd-primary file:text-white hover:file:bg-gd-dark cursor-pointer"
                    required
                  />
                </Field>

                {/* Live size feedback */}
                {videoSize !== null && (
                  <div className={`flex items-center gap-2 text-[12.5px] rounded-lg px-3 py-2 ${videoTooLarge ? "bg-red-50 border border-red-200 text-red-700" : "bg-green-50 border border-green-200 text-green-700"}`}>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {videoTooLarge ? <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></> : <path d="M20 6L9 17l-5-5"/>}
                    </svg>
                    {videoTooLarge
                      ? `File is ${(videoSize / 1024 / 1024).toFixed(1)}MB — too large. Maximum is ${MAX_VIDEO_MB}MB.`
                      : `File size: ${(videoSize / 1024 / 1024).toFixed(1)}MB ✓`}
                  </div>
                )}

                {/* Compress link — always visible */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-3">
                  <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                  <div>
                    <p className="text-[13px] font-semibold text-amber-800 mb-0.5">Video too large?</p>
                    <p className="text-[12.5px] text-amber-700 mb-2">Compress it for free at FreeConvert — no account needed.</p>
                    <a href="https://www.freeconvert.com/video-compressor" target="_blank" rel="noopener noreferrer"
                      className="inline-block text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors">
                      Open FreeConvert
                    </a>
                  </div>
                </div>
              </div>

              {/* Proof of payment */}
              <Field label={`Proof of Payment (optional — JPG, PNG or PDF, max ${MAX_PROOF_MB}MB)`}>
                <input
                  ref={proofRef} name="proof_of_payment" type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="block w-full text-[13.5px] text-gd-mute file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[13px] file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                />
                <p className="text-[12px] text-gd-mute mt-1">Upload your proof of payment if one is required for this entry.</p>
              </Field>

              {status === "uploading" && (
                <div>
                  <div className="h-2 bg-gd-line rounded-full overflow-hidden">
                    <div className="h-full bg-gd-primary transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-[12.5px] text-gd-mute mt-1.5">Uploading… {progress}%</p>
                </div>
              )}

              <div className="space-y-3 pt-1">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input name="over18" type="checkbox" className="mt-0.5 h-4 w-4 accent-gd-primary flex-shrink-0" />
                  <span className="text-[13.5px] text-gd-mute">I confirm that I am 18 years of age or older *</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input name="terms" type="checkbox" className="mt-0.5 h-4 w-4 accent-gd-primary flex-shrink-0" />
                  <span className="text-[13.5px] text-gd-mute">I accept the terms and conditions and confirm my video contains live vocals only, my face is visible, and audio is clear *</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={status === "uploading" || videoTooLarge}
                className="w-full h-12 rounded-xl bg-gd-primary text-white font-bold text-[15px] hover:bg-gd-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === "uploading" ? "Submitting…" : "Submit My Entry"}
              </button>
            </form>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

const inp = "h-11 w-full rounded-lg border border-gd-line bg-white px-3.5 text-[14px] text-gd-black focus:outline-none focus:border-gd-primary focus:ring-2 focus:ring-gd-primary/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12.5px] font-semibold text-gd-black">{label}</label>
      {children}
    </div>
  );
}
