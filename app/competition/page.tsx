"use client";

import { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

const PROVINCES = [
  "Gauteng","Western Cape","KwaZulu-Natal","Eastern Cape",
  "Free State","Limpopo","Mpumalanga","North West","Northern Cape",
];

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function CompetitionPage() {
  const [status, setStatus] = useState<"idle"|"uploading"|"success"|"error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

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
    const file = fileRef.current?.files?.[0];
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
    const allowed = ["video/mp4","video/quicktime","video/webm"];
    if (!allowed.includes(file.type)) {
      setErrorMsg("Accepted video formats: MP4, MOV, WEBM."); return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setErrorMsg("Video must be under 100MB."); return;
    }
    if (!over18) { setErrorMsg("You must confirm you are 18 years or older."); return; }
    if (!terms) { setErrorMsg("You must accept the terms and conditions."); return; }

    setStatus("uploading");
    setProgress(10);

    try {
      const supabase = getSupabase();
      // Check for duplicate ID number
      const { data: existing } = await supabase
        .from("competition_entries")
        .select("id")
        .eq("id_number", idNumber)
        .maybeSingle();
      if (existing) {
        setStatus("error");
        setErrorMsg("An entry with this ID number already exists.");
        return;
      }

      setProgress(30);
      const ext = file.name.split(".").pop();
      const filename = `${Date.now()}_${idNumber}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("competition-videos")
        .upload(filename, file, { contentType: file.type, upsert: false });

      if (uploadError) throw new Error("Video upload failed: " + uploadError.message);
      setProgress(70);

      const { data: urlData } = supabase.storage
        .from("competition-videos")
        .getPublicUrl(filename);

      const { error: dbError } = await supabase.from("competition_entries").insert({
        full_name: fullName,
        id_number: idNumber,
        cellphone: cellphone.replace(/\s/g,""),
        city,
        province,
        instagram_handle: instagram || null,
        tiktok_handle: tiktok || null,
        video_url: urlData.publicUrl,
      });

      if (dbError) throw new Error("Failed to save entry: " + dbError.message);
      setProgress(100);
      setStatus("success");
      form.reset();
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-gd-cream">
        {/* Hero */}
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

        {/* Requirements */}
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

          {/* Form */}
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
              </div>

              <Field label="Upload Your 40-Second Video * (MP4, MOV or WEBM — max 100MB)">
                <input ref={fileRef} name="video" type="file" accept="video/mp4,video/quicktime,video/webm" className="block w-full text-[13.5px] text-gd-mute file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[13px] file:font-semibold file:bg-gd-primary file:text-white hover:file:bg-gd-dark cursor-pointer" required />
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
                disabled={status === "uploading"}
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
