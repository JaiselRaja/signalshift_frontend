"use client";

import { useState } from "react";

type FAQ = { q: string; a: string };

export default function PageFAQ({ items }: { items: FAQ[] }) {
  const [open, setOpen] = useState(0);
  return (
    <section className="px-6 py-16 md:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-[#b2f746]">
            · Common Questions ·
          </p>
          <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-white md:text-4xl">
            FAQ
          </h2>
        </div>
        <div className="flex flex-col gap-3">
          {items.map((f, i) => {
            const isOpen = open === i;
            return (
              <button
                key={f.q}
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                className={`text-left rounded-3xl border p-5 transition-all md:p-6 ${
                  isOpen
                    ? "border-[#b2f746]/30 bg-[#b2f746]/[0.04]"
                    : "border-white/[0.06] bg-white/[0.03] hover:border-white/[0.12]"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3
                    className={`font-display text-base font-bold ${
                      isOpen ? "text-[#b2f746]" : "text-white"
                    }`}
                  >
                    {f.q}
                  </h3>
                  <span
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-transform ${
                      isOpen
                        ? "rotate-45 bg-[#b2f746] text-[#121f00]"
                        : "border border-white/10 text-white/60"
                    }`}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                </div>
                {isOpen && (
                  <p className="mt-4 text-sm leading-relaxed text-white/70 animate-fade-in">
                    {f.a}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
