"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Do I need a good credit score to qualify?",
    a: "No. GreenDrive Currency assesses real-time affordability instead of relying on credit history. We look at your income, expenses, and ability to pay, not just your credit score.",
  },
  {
    q: "Why do I need to pay four months upfront?",
    a: "The four-month upfront payment proves your affordability and secures your vehicle allocation. It's the foundation of how we say yes when banks say no.",
  },
  {
    q: "How long does approval take?",
    a: "Most applicants receive pre-approval within an hour of submitting a complete application.",
  },
  {
    q: "Which platforms qualify?",
    a: "Bolt, Uber, taxi, delivery and courier drivers all qualify, along with security companies, construction firms, and other South African businesses needing fleet vehicles.",
  },
  {
    q: "Do I own the vehicle immediately?",
    a: "You drive the vehicle while you pay, building equity over time until you reach full ownership under your agreement.",
  },
];

export function Faqs() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faqs" className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <p className="text-center text-[13px] font-bold uppercase tracking-[0.16em] text-gd-primary">FAQs</p>
        <h2 className="mt-3 text-center text-[28px] font-extrabold tracking-tight text-gd-black sm:text-[34px]">
          Questions, answered.
        </h2>

        <div className="mt-10 divide-y divide-gd-line border-y border-gd-line">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={faq.q}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gd-primary"
                >
                  <span className="text-[15px] font-semibold text-gd-black sm:text-[16px]">{faq.q}</span>
                  <svg
                    viewBox="0 0 24 24"
                    className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
                    fill="none"
                    stroke="#0D7A34"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
                {isOpen && (
                  <p className="pb-5 text-[14.5px] leading-relaxed text-gd-mute">{faq.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
