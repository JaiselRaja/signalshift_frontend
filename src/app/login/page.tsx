"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { sendOtp, verifyOtp, googleSignIn, getToken } from "@/lib/api";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/turfs";

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

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
        theme: "filled_black",
        size: "large",
        shape: "pill",
        width: googleBtnRef.current.offsetWidth || 320,
        text: "continue_with",
        logo_alignment: "center",
      });
    }

    if (window.google) {
      initGoogle();
    } else {
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      script?.addEventListener("load", initGoogle);
      return () => script?.removeEventListener("load", initGoogle);
    }
  }, [googleClientId, step]); // eslint-disable-line react-hooks/exhaustive-deps

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
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#0a0b0c] px-4 py-12">
      {/* Lime glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b2f746]/[0.06] blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] translate-x-1/3 translate-y-1/3 rounded-full bg-[#004900]/30 blur-[120px]" />
      </div>

      {/* Logo */}
      <div className="relative mb-8 flex flex-col items-center gap-3 animate-fade-in">
        <Image src="/logo.png" alt="Signal Shift" width={56} height={51} className="h-14 w-auto" />
        <div className="text-center">
          <Image
            src="/logo-text.png"
            alt="SIGNAL SHIFT"
            width={160}
            height={30}
            className="h-7 w-auto brightness-0 invert"
          />
          <p className="mt-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-[#b2f746]">
            · Book · Play · Win ·
          </p>
        </div>
      </div>

      {/* Auth card */}
      <div className="relative w-full max-w-sm animate-slide-up">
        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-7 shadow-2xl shadow-[#b2f746]/[0.04] backdrop-blur-sm">
          {step === "email" ? (
            <>
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-[#b2f746]">
                · Sign in ·
              </p>
              <h1 className="mt-2 font-display text-2xl font-black text-white">
                Welcome back
              </h1>
              <p className="mt-1 text-sm text-white/60">
                We&apos;ll send a one-time code to your email.
              </p>

              {/* Google Sign-In — only shown when client ID is configured */}
              {googleClientId && (
                <div className="mt-6 flex flex-col gap-3">
                  <div ref={googleBtnRef} className="w-full overflow-hidden rounded-full" />
                  {loading && (
                    <div className="flex justify-center">
                      <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-[#b2f746] animate-spin" />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/[0.08]" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                      or continue with email
                    </span>
                    <div className="h-px flex-1 bg-white/[0.08]" />
                  </div>
                </div>
              )}

              <form onSubmit={handleSendOtp} className={`flex flex-col gap-4 ${googleClientId ? "mt-4" : "mt-6"}`}>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
                    Email address
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-[#b2f746]/50 focus:ring-2 focus:ring-[#b2f746]/15"
                  />
                </div>

                {error && (
                  <p className="rounded-xl border border-rose-500/20 bg-rose-500/[0.08] px-3 py-2 text-xs text-rose-300">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-full bg-[#b2f746] py-3.5 text-sm font-bold text-[#121f00] shadow-lg shadow-[#b2f746]/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-[#121f00]/20 border-t-[#121f00] animate-spin" />
                      Sending…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Send OTP
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                    </span>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <button
                onClick={() => { setStep("email"); setError(null); }}
                className="mb-5 flex items-center gap-1.5 text-xs text-white/50 transition-colors hover:text-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                Back
              </button>

              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-[#b2f746]">
                · Verify ·
              </p>
              <h1 className="mt-2 font-display text-2xl font-black text-white">Enter the code</h1>
              <p className="mt-1 text-sm text-white/60">
                Sent to <span className="font-medium text-[#b2f746]">{email}</span>
              </p>

              <form onSubmit={handleVerifyOtp} className="mt-6 flex flex-col gap-4">
                <div className="flex justify-center gap-2">
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
                      className="h-13 w-11 rounded-xl border border-white/10 bg-white/[0.04] text-center font-mono text-lg font-bold text-white outline-none transition-colors focus:border-[#b2f746] focus:ring-2 focus:ring-[#b2f746]/15"
                    />
                  ))}
                </div>

                {error && (
                  <p className="rounded-xl border border-rose-500/20 bg-rose-500/[0.08] px-3 py-2 text-center text-xs text-rose-300">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.join("").length < 6}
                  className="flex w-full items-center justify-center rounded-full bg-[#b2f746] py-3.5 text-sm font-bold text-[#121f00] shadow-lg shadow-[#b2f746]/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-[#121f00]/20 border-t-[#121f00] animate-spin" />
                      Verifying…
                    </span>
                  ) : (
                    "Verify & sign in"
                  )}
                </button>

                <div className="text-center text-xs text-white/50">
                  Didn&apos;t receive it?{" "}
                  {resendTimer > 0 ? (
                    <span className="text-white/30">Resend in {resendTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={loading}
                      className="font-semibold text-[#b2f746] hover:underline disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>

        <p className="mt-5 text-center text-[11px] text-white/30">
          By signing in you agree to the
          {" "}<span className="text-white/50">Terms</span> &amp;
          {" "}<span className="text-white/50">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
