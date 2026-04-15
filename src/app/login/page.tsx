"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    setError(null);
    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0b0f] px-4">
      {/* Glow effect */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3 animate-fade-in">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-xl shadow-indigo-500/30">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold tracking-widest text-white">SIGNAL SHIFT</div>
          <div className="text-xs text-[var(--text-muted)]">Book · Play · Win</div>
        </div>
      </div>

      {/* Auth card */}
      <div className="w-full max-w-sm animate-slide-up">
      <div className="glass-card p-8">
        {step === "email" ? (
          <>
            <h1 className="mb-1 text-xl font-bold text-[var(--text-primary)]">Sign in</h1>
            <p className="mb-6 text-sm text-[var(--text-muted)]">
              We&apos;ll send a one-time code to your email.
            </p>

            {/* Google Sign-In — only shown when client ID is configured */}
            {googleClientId && (
              <div className="mb-5 flex flex-col gap-3">
                <div ref={googleBtnRef} className="w-full" />
                {loading && (
                  <div className="flex justify-center">
                    <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-indigo-400 animate-spin" />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/[0.08]" />
                  <span className="text-xs text-[var(--text-muted)]">or continue with email</span>
                  <div className="h-px flex-1 bg-white/[0.08]" />
                </div>
              </div>
            )}

            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Email address
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-sm text-white placeholder-[var(--text-muted)] outline-none transition-colors focus:border-indigo-500/50 focus:bg-white/[0.05]"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
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
              className="mb-4 flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-white"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
              Back
            </button>

            <h1 className="mb-1 text-xl font-bold text-[var(--text-primary)]">Enter OTP</h1>
            <p className="mb-6 text-sm text-[var(--text-muted)]">
              Sent to <span className="font-medium text-indigo-400">{email}</span>
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
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="h-12 w-10 rounded-lg border border-white/[0.08] bg-white/[0.03] text-center font-mono text-lg font-bold text-white outline-none transition-colors focus:border-indigo-500 focus:bg-white/[0.05]"
                  />
                ))}
              </div>

              {error && (
                <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || otp.join("").length < 6}
                className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Verify & Sign In"
                )}
              </button>

              <div className="text-center text-xs text-[var(--text-muted)]">
                Didn&apos;t receive it?{" "}
                {resendTimer > 0 ? (
                  <span className="text-[var(--text-secondary)]">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>

      {/* Dev tools panel */}
      <div className="mt-3 w-full rounded-xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
        <button
          onClick={() => setShowDevLogin((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-medium text-amber-400 hover:bg-amber-500/10 transition-colors"
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
              className="rounded-lg border border-sky-500/30 bg-sky-500/10 py-2.5 text-sm font-semibold text-sky-400 hover:bg-sky-500/20 transition-colors"
            >
              Preview UI (no backend)
            </button>

            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-white/[0.08]" />
              <span className="text-[10px] text-[var(--text-muted)]">or with real backend</span>
              <div className="h-px flex-1 bg-white/[0.08]" />
            </div>

            <form onSubmit={handleDevLogin} className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Email"
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-amber-500/40"
              />
              <input
                type="password"
                placeholder="Any password"
                value={devPassword}
                onChange={(e) => setDevPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-amber-500/40"
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-amber-500/15 py-2 text-sm font-semibold text-amber-400 hover:bg-amber-500/25 disabled:opacity-50 transition-colors"
              >
                {loading ? "Signing in..." : "Dev Login (needs backend)"}
              </button>
            </form>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
