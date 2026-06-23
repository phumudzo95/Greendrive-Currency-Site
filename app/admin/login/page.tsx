"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const correct = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    if (!correct) { setError("Admin password not configured."); return; }
    if (pw === correct) {
      localStorage.setItem("gdc_admin", "1");
      router.replace("/admin/");
    } else {
      setError("Incorrect password.");
      setPw("");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-8">
        <div className="flex items-center gap-2 mb-8">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gd-primary">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17h14l-1.5-6.5a2 2 0 0 0-2-1.5H8.5a2 2 0 0 0-2 1.5L5 17z"/>
              <circle cx="8.5" cy="17" r="1.5" fill="white" stroke="none"/>
              <circle cx="15.5" cy="17" r="1.5" fill="white" stroke="none"/>
            </svg>
          </span>
          <span className="text-[15px] font-extrabold tracking-tight text-gd-black">
            GREEN<span className="text-gd-primary">DRIVE</span>
          </span>
        </div>

        <h1 className="text-[20px] font-bold text-gray-900 mb-1">Admin Login</h1>
        <p className="text-[13px] text-gray-500 mb-6">Enter your admin password to continue.</p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-lg px-4 py-3">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12.5px] font-semibold text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              className="w-full h-11 border border-gray-200 rounded-lg px-3.5 text-[14px] focus:outline-none focus:border-gd-primary focus:ring-2 focus:ring-gd-primary/20"
              placeholder="Enter admin password"
              autoFocus
              required
            />
          </div>
          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-gd-primary text-white font-bold text-[14.5px] hover:bg-gd-dark transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
