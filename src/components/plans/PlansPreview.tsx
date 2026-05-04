"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listPlans } from "@/lib/api";
import type { PlanRead } from "@/types";

function Arrow({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

export default function PlansPreview() {
  const [plans, setPlans] = useState<PlanRead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPlans()
      .then(setPlans)
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  // Sort: daily first, then monthly by display_order
  const sorted = [...plans]
    .filter((p) => p.is_active)
    .sort((a, b) => {
      // Daily before monthly
      if (a.plan_type !== b.plan_type) return a.plan_type === "daily" ? -1 : 1;
      return a.display_order - b.display_order;
    });

  // Show up to 3 cards on homepage preview
  const preview = sorted.slice(0, 3);

  if (!loading && preview.length === 0) return null;

  return (
    <section className="bg-[#0a0b0c] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center md:mb-16">
          <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-[#b2f746]">
            · Pricing &amp; Plans ·
          </p>
          <h2 className="font-display text-3xl font-black tracking-tight text-white md:text-5xl">
            Two ways to <span className="italic text-[#b2f746]">play</span>.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/60">
            Lock in a recurring weekly slot or pay only when you play. Switch anytime, no lock-in.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-3xl border border-white/[0.06] bg-white/[0.03]"
              />
            ))}
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-5 ${preview.length === 1 ? "max-w-md mx-auto" : preview.length === 2 ? "md:grid-cols-2 max-w-3xl mx-auto" : "md:grid-cols-3"}`}>
            {preview.map((p) => {
              const featured = p.featured;
              const typeLabel = p.plan_type === "daily" ? "Daily" : "Monthly";
              return (
                <Link
                  key={p.id}
                  href="/plans"
                  className={`group relative flex flex-col rounded-3xl p-7 transition-all hover:-translate-y-1 ${
                    featured
                      ? "bg-[#b2f746] text-[#121f00] shadow-[0_24px_60px_-24px_rgba(178,247,70,0.45)]"
                      : "border border-white/[0.06] bg-white/[0.03] hover:border-[#b2f746]/30"
                  }`}
                >
                  {featured && (
                    <span className="absolute -top-3 right-7 rounded-full bg-[#121f00] px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#b2f746]">
                      Most popular
                    </span>
                  )}
                  <p
                    className={`font-mono text-[10px] font-bold uppercase tracking-[0.2em] ${
                      featured ? "text-[#121f00]/60" : "text-white/50"
                    }`}
                  >
                    {typeLabel}
                  </p>
                  <h3
                    className={`mt-2 font-display text-2xl font-black ${
                      featured ? "text-[#121f00]" : "text-white"
                    }`}
                  >
                    {p.name}
                  </h3>
                  {p.tagline && (
                    <p
                      className={`mt-1 text-sm ${
                        featured ? "text-[#121f00]/70" : "text-white/60"
                      }`}
                    >
                      {p.tagline}
                    </p>
                  )}
                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span
                      className={`font-display text-4xl font-black tracking-tight ${
                        featured ? "text-[#121f00]" : "text-white"
                      }`}
                    >
                      ₹{Number(p.price).toLocaleString("en-IN")}
                    </span>
                    <span
                      className={`text-sm ${
                        featured ? "text-[#121f00]/60" : "text-white/50"
                      }`}
                    >
                      {p.price_unit}
                    </span>
                  </div>

                  {p.plan_type === "monthly" && (
                    <ul
                      className={`mt-5 flex flex-col gap-2 text-sm ${
                        featured ? "text-[#121f00]/80" : "text-white/70"
                      }`}
                    >
                      {p.hours_per_month != null && (
                        <li>
                          <span className="font-bold">{p.hours_per_month}h</span> recurring turf time/month
                        </li>
                      )}
                      {p.discount_pct != null && (
                        <li>
                          <span className="font-bold">{p.discount_pct}%</span> off extra bookings
                        </li>
                      )}
                      {p.advance_window_days != null && (
                        <li>
                          Book up to <span className="font-bold">{p.advance_window_days} days</span> ahead
                        </li>
                      )}
                    </ul>
                  )}

                  <span
                    className={`mt-7 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                      featured ? "text-[#121f00]" : "text-[#b2f746]"
                    }`}
                  >
                    {p.plan_type === "daily" ? "See details" : `Choose ${p.name}`}
                    <Arrow size={12} />
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/plans"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#b2f746] underline-offset-4 hover:underline"
          >
            Compare all plans
            <Arrow size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
