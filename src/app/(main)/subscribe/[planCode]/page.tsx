"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  getSubscriptionAvailability,
  getToken,
  initiateSubscription,
  listPlans,
  listTurfs,
  submitSubscriptionUtr,
} from "@/lib/api";
import type {
  PlanRead,
  SubscriptionAvailabilitySlot,
  SubscriptionInitiateResponse,
  TurfRead,
} from "@/types";
import Eyebrow from "@/components/v1/Eyebrow";
import { PageLoader } from "@/components/ui/LoadingSpinner";

const SLOT_MINUTES = 60;

const DAYS = [
  { dow: 0, short: "MON", long: "Monday" },
  { dow: 1, short: "TUE", long: "Tuesday" },
  { dow: 2, short: "WED", long: "Wednesday" },
  { dow: 3, short: "THU", long: "Thursday" },
  { dow: 4, short: "FRI", long: "Friday" },
  { dow: 5, short: "SAT", long: "Saturday" },
  { dow: 6, short: "SUN", long: "Sunday" },
];

type PickedSlot = {
  day_of_week: number;
  start_time: string;
  end_time: string;
};

function formatTime(hhmmss: string): string {
  const [h, m] = hhmmss.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, "0")} ${period}`;
}

function slotsPerWeek(plan: PlanRead | null): number {
  // Must mirror backend's _slots_per_week exactly, including the floor:
  //   total_minutes // WEEKS_PER_MONTH // SLOT_DURATION_MINUTES
  if (!plan?.hours_per_month) return 1;
  const totalMinutes = plan.hours_per_month * 60;
  const weeklyMinutes = Math.floor(totalMinutes / 4);
  return Math.max(1, Math.floor(weeklyMinutes / SLOT_MINUTES));
}

function formatCurrency(amount: number | string): string {
  return `₹${Number(amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function slotKey(s: { day_of_week: number; start_time: string }): string {
  return `${s.day_of_week}|${s.start_time}`;
}

export default function SubscribePage() {
  const router = useRouter();
  const params = useParams<{ planCode: string }>();
  const planCode = params?.planCode ?? "";

  const [step, setStep] = useState<"loading" | "picking" | "qr" | "submitted">("loading");
  const [plan, setPlan] = useState<PlanRead | null>(null);
  const [turf, setTurf] = useState<TurfRead | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [dayOfWeek, setDayOfWeek] = useState<number | null>(null);
  const [availability, setAvailability] = useState<SubscriptionAvailabilitySlot[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [picked, setPicked] = useState<PickedSlot[]>([]);
  const [submittingPlan, setSubmittingPlan] = useState(false);

  const [initiateResp, setInitiateResp] = useState<SubscriptionInitiateResponse | null>(null);
  const [utr, setUtr] = useState("");
  const [submittingUtr, setSubmittingUtr] = useState(false);

  // Auth gate + initial load
  useEffect(() => {
    if (!getToken()) {
      router.replace(`/login?redirect=${encodeURIComponent(`/subscribe/${planCode}`)}`);
      return;
    }

    Promise.all([listPlans(), listTurfs()])
      .then(([plans, turfs]) => {
        const p = plans.find((x) => x.code === planCode && x.plan_type === "monthly");
        if (!p) {
          setError("Plan not found or not available for monthly subscription.");
          setStep("picking");
          return;
        }
        const activeTurf = turfs.find((t) => t.is_active) ?? turfs[0] ?? null;
        if (!activeTurf) {
          setError("No turf is available. Please contact support.");
          setStep("picking");
          return;
        }
        setPlan(p);
        setTurf(activeTurf);
        setStep("picking");
      })
      .catch(() => {
        setError("Failed to load plan information.");
        setStep("picking");
      });
  }, [planCode, router]);

  // Load availability when day_of_week changes
  useEffect(() => {
    if (dayOfWeek == null || !turf || !plan) return;
    setAvailabilityLoading(true);
    getSubscriptionAvailability(turf.id, dayOfWeek, SLOT_MINUTES, plan.id)
      .then(setAvailability)
      .catch(() => setAvailability([]))
      .finally(() => setAvailabilityLoading(false));
  }, [dayOfWeek, turf, plan]);

  const required = useMemo(() => slotsPerWeek(plan), [plan]);
  const remaining = required - picked.length;

  const pickedKeys = useMemo(() => new Set(picked.map(slotKey)), [picked]);
  const dayCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    picked.forEach((s) => {
      counts[s.day_of_week] = (counts[s.day_of_week] || 0) + 1;
    });
    return counts;
  }, [picked]);

  function toggleSlot(slot: SubscriptionAvailabilitySlot) {
    if (dayOfWeek == null) return;
    const key = `${dayOfWeek}|${slot.start_time}`;
    setError(null);
    setPicked((prev) => {
      if (prev.some((p) => slotKey(p) === key)) {
        return prev.filter((p) => slotKey(p) !== key);
      }
      // Don't allow exceeding required count
      if (prev.length >= required) {
        setError(
          `You've already picked ${required} slot${required === 1 ? "" : "s"}. ` +
            `Remove one to swap.`,
        );
        return prev;
      }
      return [...prev, {
        day_of_week: dayOfWeek,
        start_time: slot.start_time,
        end_time: slot.end_time,
      }];
    });
  }

  function removePicked(key: string) {
    setPicked((prev) => prev.filter((p) => slotKey(p) !== key));
    setError(null);
  }

  async function handleProceedToPayment() {
    if (!plan || !turf || picked.length !== required) return;
    setSubmittingPlan(true);
    setError(null);
    try {
      const resp = await initiateSubscription({
        plan_id: plan.id,
        turf_id: turf.id,
        slots: picked,
      });
      setInitiateResp(resp);
      setStep("qr");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the subscription.");
    } finally {
      setSubmittingPlan(false);
    }
  }

  async function handleSubmitUtr() {
    if (!initiateResp) return;
    const cleaned = utr.trim().replace(/\s+/g, "");
    if (cleaned.length < 8) {
      setError("Enter the full UPI reference (usually 12 digits).");
      return;
    }
    setSubmittingUtr(true);
    setError(null);
    try {
      await submitSubscriptionUtr(initiateResp.subscription.id, cleaned);
      setStep("submitted");
      setTimeout(() => router.push("/profile"), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't submit UTR.");
    } finally {
      setSubmittingUtr(false);
    }
  }

  if (step === "loading") return <PageLoader />;

  if (step === "submitted") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/15">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-bold text-white">Payment submitted</h2>
        <p className="text-sm text-white/60">
          We&rsquo;ve received your UPI reference. Your recurring slots will be confirmed once
          the admin verifies the transfer (usually within a few minutes). We&rsquo;ll then
          create the weekly bookings on your behalf.
        </p>
        <p className="text-xs text-white/40">Taking you to your profile…</p>
      </div>
    );
  }

  if (step === "qr" && initiateResp) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <button
          type="button"
          onClick={() => {
            setStep("picking");
            setInitiateResp(null);
            setUtr("");
            setError(null);
          }}
          className="mb-5 flex items-center gap-1.5 text-xs text-white/50 hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </button>

        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-6 text-center">
          <Eyebrow>Pay via UPI</Eyebrow>
          <h2 className="mt-3 font-display text-xl font-bold text-white">
            Lock in your {plan?.name} slots
          </h2>
          <p className="mb-5 mt-1 text-xs text-white/50">
            Scan in any UPI app or tap the button below on mobile.
          </p>

          <div className="mx-auto mb-4 inline-block rounded-2xl bg-white p-4 ring-1 ring-white/10">
            <QRCodeSVG value={initiateResp.upi_uri} size={220} level="M" includeMargin={false} />
          </div>

          <div className="mb-4 flex flex-col gap-1 text-sm">
            <div className="flex items-center justify-center gap-2 text-white/70">
              <span>Paying to</span>
              <span className="font-semibold text-white">{initiateResp.payee_name}</span>
            </div>
            <div className="font-mono text-xs text-white/50">{initiateResp.upi_vpa}</div>
            <div className="mt-2 font-display text-2xl font-bold text-[#b2f746]">
              {formatCurrency(initiateResp.amount)}
            </div>
          </div>

          <a
            href={initiateResp.upi_uri}
            className="mb-5 inline-block w-full rounded-full bg-[#b2f746] px-5 py-3 text-sm font-bold text-[#121f00] shadow-lg shadow-[#b2f746]/20 transition-all hover:scale-[1.01] active:scale-95 sm:hidden"
          >
            Open in UPI app
          </a>

          <div className="border-t border-white/10 pt-5">
            <h3 className="mb-1 text-sm font-semibold text-white">After paying</h3>
            <p className="mb-3 text-xs text-white/50">
              Your UPI app shows a 12-digit <span className="font-semibold">reference number</span> (sometimes called UTR). Paste it here to confirm.
            </p>
            <input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 412345678901"
              value={utr}
              onChange={(e) => {
                setUtr(e.target.value);
                setError(null);
              }}
              className="mb-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-center font-mono text-base tracking-wider text-white placeholder-white/40 outline-none focus:border-[#b2f746]/50 focus:ring-2 focus:ring-[#b2f746]/15"
            />
            {error && <p className="mb-2 text-xs text-rose-300">{error}</p>}
            <button
              type="button"
              onClick={handleSubmitUtr}
              disabled={submittingUtr || utr.trim().length < 8}
              className="w-full rounded-full bg-[#b2f746] px-5 py-3 text-sm font-bold text-[#121f00] shadow-lg shadow-[#b2f746]/20 transition-all hover:bg-white disabled:opacity-50"
            >
              {submittingUtr ? "Submitting…" : "Submit UPI reference"}
            </button>
          </div>

          <p className="mt-4 text-[11px] text-white/50">
            Your recurring slots are held while we verify the payment.
          </p>
        </div>
      </div>
    );
  }

  // step === "picking"
  if (!plan || !turf) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-sm text-rose-300">{error ?? "Plan not found."}</p>
        <Link
          href="/plans"
          className="mt-4 inline-block rounded-full bg-[#b2f746] px-5 py-2 text-xs font-bold text-[#121f00]"
        >
          Back to plans
        </Link>
      </div>
    );
  }

  const windowLabel = (() => {
    if (!plan.slot_window_start && !plan.slot_window_end) return null;
    const start = plan.slot_window_start ? formatTime(plan.slot_window_start) : "anytime";
    const end = plan.slot_window_end ? formatTime(plan.slot_window_end) : "close";
    return `${start} – ${end}`;
  })();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <Link
        href="/plans"
        className="mb-5 flex items-center gap-1.5 text-xs text-white/50 hover:text-white"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back to plans
      </Link>

      {/* Plan summary */}
      <div className="mb-8 rounded-3xl border border-[#b2f746]/20 bg-[#b2f746]/[0.04] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Eyebrow>{plan.name} Plan</Eyebrow>
            <h1 className="mt-3 font-display text-2xl font-black text-white md:text-3xl">
              Pick {required} weekly slot{required === 1 ? "" : "s"}
            </h1>
            <p className="mt-2 text-sm text-white/60">
              {plan.tagline ?? "Lock in recurring time on the turf."} You&apos;ll get{" "}
              <span className="font-semibold text-white">
                {required} × {SLOT_MINUTES}-min slot{required === 1 ? "" : "s"}
              </span>{" "}
              every week, locked at the same times.
            </p>
            {windowLabel && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#b2f746]/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#b2f746]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Slots {windowLabel}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-black text-[#b2f746] md:text-3xl">
              {formatCurrency(Number(plan.price))}
            </p>
            <p className="text-xs text-white/50">{plan.price_unit}</p>
          </div>
        </div>
      </div>

      {/* Picked counter */}
      <div className="mb-4 flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-[0.16em] text-white/50">
          {picked.length} of {required} picked
        </span>
        {picked.length > 0 && (
          <button
            type="button"
            onClick={() => setPicked([])}
            className="font-semibold uppercase tracking-wider text-rose-300 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Selected chips */}
      {picked.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {picked.map((s) => {
            const k = slotKey(s);
            return (
              <button
                key={k}
                type="button"
                onClick={() => removePicked(k)}
                className="inline-flex items-center gap-2 rounded-full bg-[#b2f746] px-4 py-1.5 text-xs font-bold text-[#121f00] transition-colors hover:bg-white"
              >
                {DAYS[s.day_of_week].short} · {formatTime(s.start_time)}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            );
          })}
        </div>
      )}

      {/* Day picker */}
      <div className="mb-6">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
          Step 1 · Day of week
        </p>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((d) => {
            const active = dayOfWeek === d.dow;
            const count = dayCounts[d.dow] || 0;
            return (
              <button
                key={d.dow}
                type="button"
                onClick={() => setDayOfWeek(d.dow)}
                className={`relative rounded-2xl border py-3 text-center transition-all ${
                  active
                    ? "border-[#b2f746] bg-[#b2f746] text-[#121f00] shadow-lg shadow-[#b2f746]/15"
                    : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:text-white"
                }`}
              >
                <div className={`text-[10px] font-bold uppercase tracking-wider ${active ? "text-[#121f00]/60" : "text-white/40"}`}>
                  {d.short}
                </div>
                {count > 0 && (
                  <span
                    className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      active
                        ? "bg-[#121f00] text-[#b2f746]"
                        : "bg-[#b2f746] text-[#121f00]"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time picker */}
      <div className="mb-32">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
          Step 2 · Start times
          <span className="ml-2 normal-case tracking-normal text-white/40">
            (tap to add or remove · multi-select)
          </span>
        </p>
        {dayOfWeek == null ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/50">
            Pick a day above to see available times.
          </div>
        ) : availabilityLoading ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-white/[0.04]" />
            ))}
          </div>
        ) : availability.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/50">
            No bookable hours on {DAYS[dayOfWeek].long}. Try a different day.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {availability.map((slot) => {
              const key = `${dayOfWeek}|${slot.start_time}`;
              const selected = pickedKeys.has(key);
              const cantPick = !selected && remaining <= 0;
              const baseClass =
                "rounded-xl border px-2 py-3 text-center transition-all";
              if (!slot.available) {
                return (
                  <div
                    key={slot.start_time}
                    className={`${baseClass} cursor-not-allowed border-white/[0.04] bg-white/[0.01] opacity-40`}
                    title={
                      slot.reason === "booking_conflict"
                        ? "Already booked in upcoming weeks"
                        : slot.reason === "subscription_conflict"
                          ? "Another member's recurring slot"
                          : "Unavailable"
                    }
                  >
                    <div className="font-display text-sm font-bold text-white/40 line-through">
                      {formatTime(slot.start_time)}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-white/30">
                      Taken
                    </div>
                  </div>
                );
              }
              return (
                <button
                  key={slot.start_time}
                  type="button"
                  onClick={() => toggleSlot(slot)}
                  disabled={cantPick}
                  className={`${baseClass} ${
                    selected
                      ? "border-[#b2f746] bg-[#b2f746] text-[#121f00] shadow-lg shadow-[#b2f746]/15"
                      : cantPick
                        ? "cursor-not-allowed border-white/[0.04] bg-white/[0.01] opacity-40"
                        : "border-white/10 bg-white/[0.03] text-white/80 hover:border-[#b2f746]/40 hover:text-white"
                  }`}
                >
                  <div className="font-display text-sm font-bold">
                    {formatTime(slot.start_time)}
                  </div>
                  <div
                    className={`text-[10px] uppercase tracking-wider ${
                      selected ? "text-[#121f00]/60" : "text-white/40"
                    }`}
                  >
                    – {formatTime(slot.end_time)}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm bar */}
      <div className="fixed bottom-4 left-4 right-4 z-10 mx-auto max-w-3xl rounded-3xl border border-white/[0.08] bg-[#0a0b0c]/95 p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="min-w-0 text-center sm:text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
              {picked.length === required ? "Ready to pay" : `Pick ${remaining} more`}
            </p>
            <p className="mt-1 truncate font-display text-sm font-bold text-white sm:text-base">
              {picked.length === 0
                ? "No slots picked yet"
                : picked
                    .map(
                      (s) => `${DAYS[s.day_of_week].short} ${formatTime(s.start_time)}`,
                    )
                    .join("  ·  ")}
            </p>
          </div>
          <button
            type="button"
            onClick={handleProceedToPayment}
            disabled={submittingPlan || picked.length !== required}
            className="w-full rounded-full bg-[#b2f746] px-7 py-3 text-sm font-bold text-[#121f00] shadow-lg shadow-[#b2f746]/20 transition-all hover:bg-white disabled:opacity-40 sm:w-auto"
          >
            {submittingPlan ? "Saving…" : `Pay ${formatCurrency(Number(plan.price))} →`}
          </button>
        </div>
        {error && <p className="mt-3 text-center text-xs text-rose-300">{error}</p>}
      </div>
    </div>
  );
}
