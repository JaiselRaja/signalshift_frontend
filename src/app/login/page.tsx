"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { sendOtp, verifyOtp, googleSignIn, devLogin, setPreviewToken, getToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/turfs";

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [showDevLogin, setShowDevLogin] = useState(false);
  const [devEmail, setDevEmail] = useState("");
  const [devPassword, setDevPassword] = useState("");

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
  const isDev = process.env.NODE_ENV === "development";

  // Redirect if already logged in
  useEffect(() => {
    if (getToken()) router.replace(redirect);
  }, [redirect, router]);

  // Initialise Google Identity Services once the GIS script loads
  useEffect(() => {
    if (!googleClientId || step !== "email") return;

    function initGoogle() {
      if (!window.google || !googleBtnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential,
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        width: googleBtnRef.current.offsetWidth || 320,
        text: "continue_with",
        logo_alignment: "center",
      });
    }

    // GIS may already be loaded or still loading
    if (window.google) {
      initGoogle();
    } else {
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      script?.addEventListener("load", initGoogle);
      return () => script?.removeEventListener("load", initGoogle);
    }
  }, [googleClientId, step]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDevLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!devEmail.trim() || !devPassword.trim()) return;
    setError(null);
    setLoading(true);
    try {
      await devLogin(devEmail.trim(), devPassword.trim());
      router.replace(redirect);
    } catch {
      setError("Dev login failed. Make sure the backend is running in development mode.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleCredential(response: { credential: string }) {
    setError(null);
    setLoading(true);
    try {
      await googleSignIn(response.credential);
      router.replace(redirect);
    } catch {
      setError("Google sign-in failed. Please try again or use email OTP.");
    } finally {
      setLoading(false);
    }
  }

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((n) => n - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return setError("Please enter your email address.");
    setError(null);
    setLoading(true);
    try {
      await sendOtp(email.trim());
      setStep("otp");
      setResendTimer(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError("Failed to send OTP. Please check your email and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) return setError("Please enter the full 6-digit code.");
    setError(null);
    setLoading(true);
    try {
      await verifyOtp(email.trim(), code);
      router.replace(redirect);
    } catch {
      setError("Invalid or expired OTP. Please try again.");
      setOtp(Array(6).fill(""));
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(i: number, val: string) {
    const digits = val.replace(/\D/g, "");
    setError(null);
    if (digits.length > 1) {
      const next = [...otp];
      for (let k = 0; k < digits.length && i + k < 6; k++) {
        next[i + k] = digits[k];
      }
      setOtp(next);
      const lastFilled = Math.min(i + digits.length, 6) - 1;
      if (lastFilled < 5) otpRefs.current[lastFilled + 1]?.focus();
      else otpRefs.current[5]?.blur();
      return;
    }
    const digit = digits.slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
  }

  function handleOtpPaste(i: number, e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text") ?? "";
    const digits = text.replace(/\D/g, "");
    if (digits.length <= 1) return;
    e.preventDefault();
    setError(null);
    const next = [...otp];
    for (let k = 0; k < digits.length && i + k < 6; k++) {
      next[i + k] = digits[k];
    }
    setOtp(next);
    const lastFilled = Math.min(i + digits.length, 6) - 1;
    if (lastFilled < 5) otpRefs.current[lastFilled + 1]?.focus();
    else otpRefs.current[5]?.blur();
  }

  function handleOtpKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  }

  async function handleResend() {
    if (resendTimer > 0) return;
    setOtp(Array(6).fill(""));
    setError(null);
    setLoading(true);
    try {
      await sendOtp(email.trim());
      setResendTimer(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError("Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f9fa] px-4">
      {/* Glow effect */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#004900]/5 blur-[120px]" />
      </div>

      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3 animate-fade-in">
        <Image src="/logo.png" alt="Signal Shift" width={56} height={51} className="h-14 w-auto" />
        <div className="text-center">
          <Image src="/logo-text.png" alt="SIGNAL SHIFT" width={160} height={30} className="h-7 w-auto" />
          <div className="text-xs text-[#446900]/60">Book · Play · Win</div>
        </div>
      </div>

      {/* Auth card */}
      <div className="w-full max-w-sm animate-slide-up">
      <div className="bg-white rounded-2xl p-8 shadow-lg shadow-[#004900]/5">
        {step === "email" ? (
          <>
            <h1 className="mb-1 text-xl font-bold text-[#191c1d]">Sign in</h1>
            <p className="mb-6 text-sm text-[#707a6a]">
              We&apos;ll send a one-time code to your email.
            </p>

            {/* Google Sign-In — only shown when client ID is configured */}
            {googleClientId && (
              <div className="mb-5 flex flex-col gap-3">
                <div ref={googleBtnRef} className="w-full" />
                {loading && (
                  <div className="flex justify-center">
                    <span className="h-4 w-4 rounded-full border-2 border-[#bfcab7]/40 border-t-[#004900] animate-spin" />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#bfcab7]/30" />
                  <span className="text-xs text-[#707a6a]">or continue with email</span>
                  <div className="h-px flex-1 bg-[#bfcab7]/30" />
                </div>
              </div>
            )}

            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-[#707a6a]">
                  Email address
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  className="w-full border border-[#bfcab7]/40 bg-white px-3 py-3 text-sm text-[#191c1d] placeholder-[#707a6a] rounded-xl outline-none focus:border-[#004900]/50 focus:ring-2 focus:ring-[#004900]/10 transition-colors"
                />
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center bg-[#b2f746] text-[#121f00] rounded-full py-3.5 text-sm font-bold shadow-lg shadow-[#004900]/10 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-[#bfcab7]/40 border-t-[#004900] animate-spin" />
                    Sending...
                  </span>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            <button
              onClick={() => { setStep("email"); setError(null); }}
              className="mb-4 flex items-center gap-1.5 text-xs text-[#707a6a] hover:text-[#191c1d] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
              Back
            </button>

            <h1 className="mb-1 text-xl font-bold text-[#191c1d]">Enter OTP</h1>
            <p className="mb-6 text-sm text-[#404a3b]">
              Sent to <span className="text-[#004900] font-medium">{email}</span>
            </p>

            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              {/* 6-digit OTP inputs */}
              <div className="flex gap-2 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onPaste={(e) => handleOtpPaste(i, e)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="h-12 w-10 rounded-xl border border-[#bfcab7]/40 bg-white text-center font-mono text-lg font-bold text-[#191c1d] outline-none transition-colors focus:border-[#004900] focus:ring-2 focus:ring-[#004900]/10"
                  />
                ))}
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || otp.join("").length < 6}
                className="flex w-full items-center justify-center bg-[#b2f746] text-[#121f00] rounded-full py-3.5 text-sm font-bold shadow-lg shadow-[#004900]/10 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-[#bfcab7]/40 border-t-[#004900] animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Verify & Sign In"
                )}
              </button>

              <div className="text-center text-xs text-[#707a6a]">
                Didn&apos;t receive it?{" "}
                {resendTimer > 0 ? (
                  <span className="text-[#404a3b]">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="text-[#004900] hover:text-[#006400] disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>

      {/* Dev tools panel — only visible in development */}
      {isDev && (
      <div className="mt-3 w-full rounded-xl border border-amber-400/30 bg-amber-50 overflow-hidden">
        <button
          onClick={() => setShowDevLogin((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-medium text-amber-700 hover:bg-amber-100/60 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Dev tools
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`transition-transform ${showDevLogin ? "rotate-180" : ""}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {showDevLogin && (
          <div className="flex flex-col gap-3 px-4 pb-4">
            {/* Preview mode — no backend needed */}
            <button
              onClick={() => { setPreviewToken(); router.replace(redirect); }}
              className="rounded-lg border border-sky-300/50 bg-sky-50 py-2.5 text-sm font-semibold text-sky-700 hover:bg-sky-100 transition-colors"
            >
              Preview UI (no backend)
            </button>

            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-amber-300/30" />
              <span className="text-[10px] text-amber-600/70">or with real backend</span>
              <div className="h-px flex-1 bg-amber-300/30" />
            </div>

            <form onSubmit={handleDevLogin} className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Email"
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-amber-300/40 bg-white px-3 py-2 text-sm text-[#191c1d] placeholder-[#707a6a] outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10"
              />
              <input
                type="password"
                placeholder="Any password"
                value={devPassword}
                onChange={(e) => setDevPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-amber-300/40 bg-white px-3 py-2 text-sm text-[#191c1d] placeholder-[#707a6a] outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10"
              />
              {error && <p className="text-xs text-red-700">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-amber-100 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-200 disabled:opacity-50 transition-colors"
              >
                {loading ? "Signing in..." : "Dev Login (needs backend)"}
              </button>
            </form>
          </div>
        )}
      </div>
      )}
      </div>
    </div>
  );
}
