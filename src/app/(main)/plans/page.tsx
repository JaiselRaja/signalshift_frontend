"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { listPlans } from "@/lib/api";
import type { PlanRead } from "@/types";
import Eyebrow from "@/components/v1/Eyebrow";
import PageStats from "@/components/v1/PageStats";
import PageFAQ from "@/components/v1/PageFAQ";
import PlanTabs from "@/components/plans/PlanTabs";
import ConfirmPlanModal from "@/components/plans/ConfirmPlanModal";
import ComparisonTable from "@/components/plans/ComparisonTable";
import Testimonials from "@/components/plans/Testimonials";
import { PLAN_FAQS, PLAN_STATS } from "@/components/plans/data";

type Tab = "monthly" | "daily";

function Check({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Arrow({ size = 14 }: { size?: number }) {
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

export default function PlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<PlanRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("monthly");
  const [confirm, setConfirm] = useState<PlanRead | null>(null);

  useEffect(() => {
    listPlans()
      .then(setPlans)
      .catch(() => setError("Failed to load plans."))
      .finally(() => setLoading(false));
  }, []);

  const monthly = useMemo(
    () =>
      plans
        .filter((p) => p.plan_type === "monthly")
        .sort((a, b) => a.display_order - b.display_order),
    [plans],
  );
  const daily = useMemo(
    () => plans.find((p) => p.plan_type === "daily") ?? null,
    [plans],
  );

  function handleConfirm() {
    if (!confirm) return;
    if (confirm.plan_type === "monthly") {
      router.push(`/subscribe/${confirm.code}`);
    } else {
      router.push("/turfs");
    }
    setConfirm(null);
  }

  return (
    <div>
      {/* Hero */}
      <section className="px-6 pt-12 pb-10 md:pt-16">
        <div className="mx-auto max-w-5xl text-center">
          <Eyebrow>Pricing &amp; Plans</Eyebrow>
          <h1 className="mt-4 font-display text-4xl font-black leading-[0.95] tracking-tight text-white md:text-6xl">
            Two ways to play.
            <br />
            <span className="italic text-[#b2f746]">Pick</span> your pace.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-white/60 md:text-lg">
            Lock in a recurring weekly slot or pay only when you play. Switch anytime, no lock-in.
          </p>
          <div className="mt-9 flex justify-center">
            <PlanTabs active={tab} onChange={setTab} size="lg" />
          </div>
        </div>
      </section>

      {/* Plan cards */}
      <section className="px-6 pb-12 md:pb-16">
        <div className="mx-auto max-w-5xl">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="h-96 animate-pulse rounded-3xl border border-white/[0.06] bg-white/[0.03]"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-300">
              {error}
            </div>
          ) : tab === "monthly" ? (
            monthly.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center text-white/60">
                No monthly plans configured yet.
              </div>
            ) : (
              <div
                className={`grid grid-cols-1 gap-6 ${monthly.length === 1 ? "max-w-md mx-auto" : "md:grid-cols-2"}`}
              >
                {monthly.map((p) => {
                  const featured = p.featured;
                  return (
                    <div
                      key={p.id}
                      className={`relative flex flex-col rounded-3xl p-7 transition-all hover:-translate-y-1 md:p-8 ${
                        featured
                          ? "bg-[#b2f746] text-[#121f00] shadow-[0_24px_60px_-24px_rgba(178,247,70,0.45)]"
                          : "border border-white/[0.06] bg-white/[0.03]"
                      }`}
                    >
                      {featured && (
                        <span className="absolute -top-3 right-8 rounded-full bg-[#121f00] px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#b2f746]">
                          Most popular
                        </span>
                      )}
                      <div className="mb-6">
                        <h3
                          className={`font-display text-2xl font-black ${
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
                      </div>
                      <div className="mb-7 flex items-baseline gap-1.5">
                        <span
                          className={`font-display text-5xl font-black tracking-tight ${
                            featured ? "text-[#121f00]" : "text-white"
                          }`}
                        >
                          ₹{Number(p.price).toLocaleString("en-IN")}
                        </span>
                        <span
                          className={`text-base ${
                            featured ? "text-[#121f00]/60" : "text-white/50"
                          }`}
                        >
                          {p.price_unit}
                        </span>
                      </div>

                      {/* Key stat row — only render cells we have data for */}
                      {(p.hours_per_month != null ||
                        p.discount_pct != null ||
                        p.advance_window_days != null) && (
                        <div
                          className={`mb-7 grid grid-cols-3 gap-px overflow-hidden rounded-2xl ${
                            featured ? "bg-[#121f00]/10" : "bg-white/[0.06]"
                          }`}
                        >
                          {[
                            { v: p.hours_per_month != null ? `${p.hours_per_month}h` : "—", l: "per month" },
                            { v: p.discount_pct != null ? `${p.discount_pct}%` : "—", l: "off extras" },
                            { v: p.advance_window_days != null ? `${p.advance_window_days}d` : "—", l: "advance" },
                          ].map((s) => (
                            <div
                              key={s.l}
                              className={`flex flex-col items-center p-3 ${
                                featured ? "bg-[#b2f746]" : "bg-[#0a0b0c]"
                              }`}
                            >
                              <span
                                className={`font-display text-xl font-black ${
                                  featured ? "text-[#121f00]" : "text-white"
                                }`}
                              >
                                {s.v}
                              </span>
                              <span
                                className={`text-[10px] uppercase tracking-wider ${
                                  featured ? "text-[#121f00]/60" : "text-white/40"
                                }`}
                              >
                                {s.l}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <ul className="mb-8 flex flex-1 flex-col gap-3">
                        {p.perks.map((perk) => (
                          <li key={perk} className="flex items-start gap-3 text-sm">
                            <span
                              className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                                featured
                                  ? "bg-[#121f00] text-[#b2f746]"
                                  : "bg-[#b2f746]/15 text-[#b2f746]"
                              }`}
                            >
                              <Check size={12} />
                            </span>
                            <span className={featured ? "text-[#121f00]/80" : "text-white/70"}>
                              {perk}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <button
                        type="button"
                        onClick={() => setConfirm(p)}
                        className={`w-full rounded-full px-6 py-4 text-sm font-bold transition-transform hover:scale-[1.02] ${
                          featured
                            ? "bg-[#121f00] text-[#b2f746] shadow-lg"
                            : "bg-[#b2f746] text-[#121f00] shadow-lg shadow-[#b2f746]/10"
                        }`}
                      >
                        Choose {p.name}
                      </button>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            // Daily tab view
            !daily ? (
              <div className="mx-auto max-w-2xl rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center text-white/60">
                No daily pass configured yet.
              </div>
            ) : (
              <div className="mx-auto max-w-2xl">
                <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-7 md:p-10">
                  <div className="mb-7 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-2xl font-black text-white md:text-3xl">
                        {daily.name}
                      </h3>
                      {daily.tagline && (
                        <p className="mt-1 text-sm text-white/60">{daily.tagline}</p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-[#b2f746]/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#b2f746]">
                      Pay per slot
                    </span>
                  </div>
                  <div className="mb-7 flex items-baseline gap-2">
                    <span className="font-display text-5xl font-black tracking-tight text-white md:text-6xl">
                      ₹{Number(daily.price).toLocaleString("en-IN")}
                    </span>
                    <span className="text-base text-white/50">{daily.price_unit}</span>
                  </div>
                  <p className="mb-7 text-sm text-white/50">
                    Average price · varies by time slot.
                  </p>
                  <ul className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {daily.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-3 text-sm">
                        <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#b2f746]/15 text-[#b2f746]">
                          <Check size={12} />
                        </span>
                        <span className="text-white/70">{perk}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => setConfirm(daily)}
                    className="w-full rounded-full bg-[#b2f746] px-6 py-4 text-sm font-bold text-[#121f00] shadow-lg shadow-[#b2f746]/10 transition-transform hover:scale-[1.02]"
                  >
                    Browse available slots
                  </button>
                  <p className="mt-4 text-center text-xs text-white/40">
                    No commitment · Cancel up to 6 hours before your slot
                  </p>
                </div>

                {monthly.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setTab("monthly")}
                    className="mt-6 flex w-full items-center justify-between gap-4 rounded-3xl border border-dashed border-[#b2f746]/30 bg-[#b2f746]/[0.04] p-5 text-left transition-colors hover:bg-[#b2f746]/[0.08] md:p-6"
                  >
                    <div>
                      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#b2f746]">
                        · Play more than {monthly[0].hours_per_month ?? 4} hrs/month? ·
                      </p>
                      <p className="mt-1.5 font-display text-base font-bold text-white">
                        Save 25%+ with a Monthly plan →
                      </p>
                    </div>
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#b2f746] text-[#121f00]">
                      <Arrow size={16} />
                    </span>
                  </button>
                )}
              </div>
            )
          )}
        </div>
      </section>

      {/* Stat strip */}
      <div className="px-6 pb-12 md:pb-16">
        <div className="mx-auto max-w-7xl">
          <PageStats stats={PLAN_STATS} />
        </div>
      </div>

      <ComparisonTable plans={plans} />
      <Testimonials />
      <PageFAQ items={PLAN_FAQS} />

      {/* Final CTA — green panel */}
      <section className="px-6 pb-16 md:pb-20">
        <div className="mx-auto max-w-4xl rounded-3xl bg-[#004900] p-8 text-center md:p-14">
          <Eyebrow>Still deciding?</Eyebrow>
          <h2 className="mt-3 font-display text-2xl font-black tracking-tight text-white md:text-4xl">
            Try a Daily Pass first.
            <br />
            Upgrade when you&apos;re ready.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-white/70">
            Switch from Daily to Monthly anytime — we&apos;ll prorate your remaining credit toward your first month.
          </p>
          <Link
            href="/turfs"
            onClick={() => setTab("daily")}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#b2f746] px-6 py-3 text-sm font-bold text-[#121f00] shadow-lg shadow-[#b2f746]/20 transition-transform hover:scale-[1.03] md:px-8 md:py-4"
          >
            Start with a Daily Pass <Arrow size={14} />
          </Link>
        </div>
      </section>

      <ConfirmPlanModal
        plan={confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
