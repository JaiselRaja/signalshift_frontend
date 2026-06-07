"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  getTurf, previewPrice, createBooking, initiatePayment, submitPaymentCallback,
  getMyTeams, getMe,
} from "@/lib/api";
import type {
  BookingType,
  PriceBreakdown,
  RazorpayInitiateResponse,
  RazorpayResponse,
  TeamRead,
  TurfRead,
  UserRead,
} from "@/types";
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
  const rawStart = searchParams.get("start") ?? "";
  const rawEnd = searchParams.get("end") ?? "";
  // Accept both HH:MM and HH:MM:SS — backend expects HH:MM:SS
  const startTime = rawStart.length === 5 ? `${rawStart}:00` : rawStart;
  const endTime = rawEnd.length === 5 ? `${rawEnd}:00` : rawEnd;

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
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "failed" | "cancelled">("idle");
  const [pendingInit, setPendingInit] = useState<RazorpayInitiateResponse | null>(null);
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

  async function openRazorpayCheckout(init: RazorpayInitiateResponse) {
    if (typeof window === "undefined" || !window.Razorpay) {
      throw new Error("Payment SDK not loaded. Please refresh and try again.");
    }

    const rz = new window.Razorpay({
      key: init.razorpay_key_id,
      order_id: init.razorpay_order_id,
      amount: init.amount_paise,
      currency: init.currency,
      name: "Signal Shift",
      description: `${turf?.name ?? "Turf booking"} · ${formatDate(bookingDate)}`,
      theme: { color: "#b2f746" },
      prefill: {
        name: user?.full_name ?? "",
        email: user?.email ?? "",
        contact: user?.phone ?? "",
      },
      handler: async (response: RazorpayResponse) => {
        try {
          await submitPaymentCallback(response);
          setPendingInit(null);
          setPaymentStatus("success");
          setTimeout(() => router.push("/bookings"), 2000);
        } catch (verifyErr) {
          setError(verifyErr instanceof Error ? verifyErr.message : "Payment verification failed.");
          setPaymentStatus("failed");
          setPaying(false);
        }
      },
      modal: {
        ondismiss: () => {
          setPaymentStatus("cancelled");
          setPaying(false);
        },
      },
    });

    rz.open();
  }

  async function handlePay() {
    if (!turfId || !breakdown || !user) return;
    setError(null);
    setPaying(true);

    try {
      // If a payment was already initiated and the user cancelled the modal,
      // re-open Razorpay with the same order — do NOT create a duplicate booking.
      if (pendingInit) {
        await openRazorpayCheckout(pendingInit);
        return;
      }

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

      const init = await initiatePayment(booking.id);
      setPendingInit(init);

      await openRazorpayCheckout(init);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed. Please try again.");
      setPaymentStatus("failed");
      setPaying(false);
    }
  }

  if (!bookingDate || !startTime) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-white/50">Invalid booking link. Please select a slot from the turf page.</p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-[#b2f746] hover:text-[#006400]">← Go Back</button>
      </div>
    );
  }
  if (loadingInit) return <PageLoader />;
  if (!turf) return <div className="p-8 text-red-700">{error ?? "Turf not found."}</div>;

  if (paymentStatus === "success") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h2 className="text-xl font-bold text-white">Booking Confirmed!</h2>
        <p className="text-sm text-white/50">Redirecting to your bookings...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <button onClick={() => router.back()} className="mb-6 flex items-center gap-1.5 text-xs text-white/50 hover:text-white">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        Back
      </button>

      <h1 className="mb-6 text-xl font-bold text-white">Confirm Booking</h1>

      {/* Booking summary */}
      <div className="glass-card mb-4 p-5 animate-fade-in">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">Booking Summary</p>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Turf</span>
            <span className="font-medium text-white">{turf.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Date</span>
            <span className="font-medium text-white">{formatDate(bookingDate)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Time</span>
            <span className="font-mono font-medium text-white">
              {formatTime(startTime)} – {formatTime(endTime)}
            </span>
          </div>
          {turf.city && (
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Location</span>
              <span className="text-white">{turf.city}</span>
            </div>
          )}
        </div>
      </div>

      {/* Booking type */}
      <div className="glass-card mb-4 p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">Booking Type</p>
        <div className="flex flex-wrap gap-2">
          {BOOKING_TYPES.map((bt) => (
            <button
              key={bt.value}
              onClick={() => setBookingType(bt.value)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                bookingType === bt.value
                  ? "border-[#b2f746] bg-[#b2f746]/15 text-[#b2f746]"
                  : "border-white/10 text-white/70 hover:border-white/10"
              }`}
            >
              {bt.label}
            </button>
          ))}
        </div>

        {/* Team selector for tournament bookings */}
        {bookingType === "tournament" && myTeams.length > 0 && (
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
              Select Team
            </label>
            <select
              value={selectedTeamId ?? ""}
              onChange={(e) => setSelectedTeamId(e.target.value || null)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none focus:border-[#b2f746]/50 focus:ring-2 focus:ring-[#b2f746]/15"
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
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">Coupon Code</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); }}
            className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm font-mono text-white placeholder-white/40 outline-none focus:border-[#b2f746]/50 focus:ring-2 focus:ring-[#b2f746]/15"
          />
          <button
            onClick={handleApplyCoupon}
            disabled={!couponCode.trim() || loadingPrice}
            className="rounded-lg bg-[#b2f746] px-4 py-2.5 text-xs font-bold text-[#121f00] hover:bg-white disabled:opacity-40"
          >
            Apply
          </button>
        </div>
        {appliedCoupon && breakdown?.coupon_discount === 0 && (
          <p className="mt-1.5 text-xs text-red-700">Coupon is not valid for this booking.</p>
        )}
        {appliedCoupon && breakdown && breakdown.coupon_discount > 0 && (
          <p className="mt-1.5 text-xs text-emerald-700">
            Coupon applied! You save {formatCurrency(breakdown.coupon_discount)}.
          </p>
        )}
      </div>

      {/* Notes */}
      <div className="glass-card mb-4 p-5">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">
          Notes (optional)
        </label>
        <textarea
          placeholder="Any special requests or information..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/40 outline-none focus:border-[#b2f746]/50 focus:ring-2 focus:ring-[#b2f746]/15"
        />
      </div>

      {/* Price breakdown */}
      <div className="glass-card mb-6 p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">Price Breakdown</p>
        <PriceBreakdownComp breakdown={breakdown} loading={loadingPrice} />
      </div>

      {/* Cancelled — pending booking can be retried */}
      {paymentStatus === "cancelled" && (
        <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/5 px-4 py-3 text-sm text-amber-300">
          Payment cancelled. Your slot is held — tap Pay to retry, or cancel from{" "}
          <Link href="/bookings" className="underline underline-offset-4 hover:text-amber-200">
            My Bookings
          </Link>
          .
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>
      )}

      {/* Phone required gate */}
      {!user?.phone && (
        <div className="mb-4 rounded-xl border border-amber-400/40 bg-amber-50 p-4">
          <p className="mb-2 text-sm font-semibold text-amber-900">Phone number required</p>
          <p className="mb-3 text-xs text-amber-800">
            We need your phone number to contact you about this booking. Please add it to your profile.
          </p>
          <button
            type="button"
            onClick={() => router.push(`/profile?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname + window.location.search : "/")}`)}
            className="rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700"
          >
            Add phone to profile →
          </button>
        </div>
      )}

      {/* Pay button */}
      <button
        onClick={handlePay}
        disabled={paying || loadingInit || !breakdown || !user?.phone}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#b2f746] py-4 text-base font-bold text-[#121f00] shadow-xl shadow-[#b2f746]/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        {paying ? (
          <>
            <span className="h-5 w-5 rounded-full border-2 border-[#121f00]/20 border-t-[#121f00] animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ${breakdown ? formatCurrency(breakdown.total) : "..."}`
        )}
      </button>
      <p className="mt-2 text-center text-xs text-white/50">
        Secure payment via Razorpay · UPI · Cards · Netbanking
      </p>
    </div>
  );
}

export default function BookingPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<PageLoader />}>
        <BookingContent />
      </Suspense>
    </ProtectedRoute>
  );
}
