"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  getTurf, previewPrice, createBooking, initiatePayment,
  submitPaymentCallback, getMyTeams, getMe,
} from "@/lib/api";
import type { BookingType, PriceBreakdown, TeamRead, TurfRead, UserRead } from "@/types";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import PriceBreakdownComp from "@/components/bookings/PriceBreakdown";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { PageLoader } from "@/components/ui/LoadingSpinner";

const BOOKING_TYPES: { value: BookingType; label: string }[] = [
  { value: "regular", label: "Regular" },
  { value: "practice", label: "Practice" },
  { value: "tournament", label: "Tournament" },
  { value: "event", label: "Event" },
];

function BookingContent() {
  const params = useParams<{ turf_id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const turfId = params.turf_id;
  const bookingDate = searchParams.get("date") ?? "";
  const startTime = (searchParams.get("start") ?? "") + ":00";
  const endTime = (searchParams.get("end") ?? "") + ":00";

  const [turf, setTurf] = useState<TurfRead | null>(null);
  const [user, setUser] = useState<UserRead | null>(null);
  const [myTeams, setMyTeams] = useState<TeamRead[]>([]);
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [bookingType, setBookingType] = useState<BookingType>("regular");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = useCallback(async (coupon?: string) => {
    if (!turfId || !bookingDate || !startTime || !endTime) return;
    setLoadingPrice(true);
    try {
      const bd = await previewPrice({
        turf_id: turfId,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        booking_type: bookingType,
        coupon_code: coupon || null,
      });
      setBreakdown(bd);
    } catch {
      // Keep previous breakdown on error
    } finally {
      setLoadingPrice(false);
    }
  }, [turfId, bookingDate, startTime, endTime, bookingType]);

  useEffect(() => {
    if (!turfId || !bookingDate) return;
    Promise.all([
      getTurf(turfId),
      getMe(),
      getMyTeams(),
    ])
      .then(([t, u, teams]) => {
        setTurf(t);
        setUser(u);
        setMyTeams(teams);
      })
      .catch(() => setError("Failed to load booking details."))
      .finally(() => setLoadingInit(false));
  }, [turfId, bookingDate]);

  useEffect(() => {
    fetchPrice(appliedCoupon || undefined);
  }, [fetchPrice, appliedCoupon]);

  async function handleApplyCoupon() {
    setAppliedCoupon(couponCode.trim());
  }

  async function handlePay() {
    if (!turfId || !breakdown) return;
    setError(null);
    setPaying(true);
    setPaymentStatus("pending");

    try {
      // 1. Create booking
      const booking = await createBooking({
        turf_id: turfId,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        booking_type: bookingType,
        team_id: selectedTeamId,
        coupon_code: appliedCoupon || null,
        notes: notes || null,
      });

      // 2. Initiate payment (get Razorpay order)
      const payment = await initiatePayment(booking.id);

      // 3. Open Razorpay checkout
      const RazorpayClass = window.Razorpay;
      if (!RazorpayClass) {
        throw new Error("Payment SDK not loaded. Please refresh and try again.");
      }

      const rzp = new RazorpayClass({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
        amount: payment.amount * 100, // paise
        currency: payment.currency,
        order_id: payment.gateway_order_id ?? "",
        name: "Signal Shift",
        description: `Booking at ${turf?.name}`,
        prefill: {
          name: user?.full_name,
          email: user?.email,
          contact: user?.phone ?? undefined,
        },
        theme: { color: "#6366f1" },
        handler: async (response) => {
          try {
            // 4. Verify payment on backend
            await submitPaymentCallback(response);
            setPaymentStatus("success");
            setTimeout(() => router.push("/bookings"), 1500);
          } catch {
            setPaymentStatus("failed");
            setError("Payment verification failed. Please contact support with your booking ID: " + booking.id);
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentStatus("idle");
            setPaying(false);
            setError("Payment was cancelled. Your slot is held for 10 minutes.");
          },
        },
      });

      rzp.open();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Booking failed. Please try again.";
      setError(msg);
      setPaymentStatus("failed");
    } finally {
      setPaying(false);
    }
  }

  if (!bookingDate || !startTime) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-[var(--text-muted)]">Invalid booking link. Please select a slot from the turf page.</p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-indigo-400 hover:text-indigo-300">← Go Back</button>
      </div>
    );
  }
  if (loadingInit) return <PageLoader />;
  if (!turf) return <div className="p-8 text-red-400">{error ?? "Turf not found."}</div>;

  if (paymentStatus === "success") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Booking Confirmed!</h2>
        <p className="text-sm text-[var(--text-muted)]">Redirecting to your bookings...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <button onClick={() => router.back()} className="mb-6 flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-white">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        Back
      </button>

      <h1 className="mb-6 text-xl font-bold text-[var(--text-primary)]">Confirm Booking</h1>

      {/* Booking summary */}
      <div className="glass-card mb-4 p-5 animate-fade-in">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Booking Summary</p>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Turf</span>
            <span className="font-medium text-[var(--text-primary)]">{turf.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Date</span>
            <span className="font-medium text-[var(--text-primary)]">{formatDate(bookingDate)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Time</span>
            <span className="font-mono font-medium text-[var(--text-primary)]">
              {formatTime(startTime)} – {formatTime(endTime)}
            </span>
          </div>
          {turf.city && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Location</span>
              <span className="text-[var(--text-primary)]">{turf.city}</span>
            </div>
          )}
        </div>
      </div>

      {/* Booking type */}
      <div className="glass-card mb-4 p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Booking Type</p>
        <div className="flex flex-wrap gap-2">
          {BOOKING_TYPES.map((bt) => (
            <button
              key={bt.value}
              onClick={() => setBookingType(bt.value)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                bookingType === bt.value
                  ? "border-indigo-500/50 bg-indigo-500/15 text-indigo-300"
                  : "border-white/[0.06] text-[var(--text-secondary)] hover:border-white/20"
              }`}
            >
              {bt.label}
            </button>
          ))}
        </div>

        {/* Team selector for tournament bookings */}
        {bookingType === "tournament" && myTeams.length > 0 && (
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Select Team
            </label>
            <select
              value={selectedTeamId ?? ""}
              onChange={(e) => setSelectedTeamId(e.target.value || null)}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500/40"
            >
              <option value="">No team (individual)</option>
              {myTeams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Coupon */}
      <div className="glass-card mb-4 p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Coupon Code</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); }}
            className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm font-mono text-white placeholder-[var(--text-muted)] outline-none focus:border-indigo-500/40"
          />
          <button
            onClick={handleApplyCoupon}
            disabled={!couponCode.trim() || loadingPrice}
            className="rounded-lg bg-indigo-500/10 px-4 py-2.5 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/20 disabled:opacity-40"
          >
            Apply
          </button>
        </div>
        {appliedCoupon && breakdown?.coupon_discount === 0 && (
          <p className="mt-1.5 text-xs text-red-400">Coupon is not valid for this booking.</p>
        )}
        {appliedCoupon && breakdown && breakdown.coupon_discount > 0 && (
          <p className="mt-1.5 text-xs text-emerald-400">
            Coupon applied! You save {formatCurrency(breakdown.coupon_discount)}.
          </p>
        )}
      </div>

      {/* Notes */}
      <div className="glass-card mb-4 p-5">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Notes (optional)
        </label>
        <textarea
          placeholder="Any special requests or information..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-indigo-500/40"
        />
      </div>

      {/* Price breakdown */}
      <div className="glass-card mb-6 p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Price Breakdown</p>
        <PriceBreakdownComp breakdown={breakdown} loading={loadingPrice} />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      {/* Pay button */}
      <button
        onClick={handlePay}
        disabled={paying || loadingInit || !breakdown}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 py-4 text-base font-bold text-white shadow-xl shadow-indigo-500/25 transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {paying ? (
          <>
            <span className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ${breakdown ? formatCurrency(breakdown.total) : "..."}`
        )}
      </button>
      <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
        Powered by Razorpay · Secure payment
      </p>
    </div>
  );
}

export default function BookingPage() {
  return (
    <ProtectedRoute>
      <BookingContent />
    </ProtectedRoute>
  );
}
