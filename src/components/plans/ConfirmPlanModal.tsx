"use client";

import type { PlanRead } from "@/types";

type Props = {
  plan: PlanRead | null;
  onClose: () => void;
  onConfirm: () => void;
};

function Check({ size = 14 }: { size?: number }) {
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

export default function ConfirmPlanModal({ plan, onClose, onConfirm }: Props) {
  if (!plan) return null;
  const isMonthly = plan.plan_type === "monthly";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#17181a] p-6 shadow-2xl md:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-[#b2f746]">
              · Confirm Plan ·
            </p>
            <h3 className="mt-2 font-display text-2xl font-black tracking-tight text-white">
              {plan.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
            aria-label="Close"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="mb-5 rounded-2xl bg-white/[0.03] p-5">
          <div className="mb-3 flex items-baseline gap-1">
            <span className="font-display text-4xl font-black text-white">
              ₹{Number(plan.price).toLocaleString("en-IN")}
            </span>
            <span className="text-sm text-white/50">{plan.price_unit}</span>
          </div>
          {plan.tagline && <p className="text-sm text-white/60">{plan.tagline}</p>}
        </div>

        <div className="mb-5 space-y-2.5">
          {plan.perks.slice(0, 4).map((p) => (
            <div key={p} className="flex items-start gap-2.5 text-sm text-white/70">
              <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#b2f746]/15 text-[#b2f746]">
                <Check size={10} />
              </span>
              {p}
            </div>
          ))}
        </div>

        {isMonthly && (
          <div className="mb-5 rounded-2xl border border-[#b2f746]/20 bg-[#b2f746]/[0.04] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#b2f746]">
              Next step
            </p>
            <p className="mt-1 text-sm text-white/80">
              Our team will reach out on WhatsApp/email to lock in your recurring
              day &amp; time and arrange payment.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-6 py-3 text-sm font-bold text-white/70 transition-colors hover:bg-white/[0.06]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-full bg-[#b2f746] px-6 py-3 text-sm font-bold text-[#121f00] shadow-lg shadow-[#b2f746]/10 transition-transform hover:scale-[1.02]"
          >
            {isMonthly ? "Request signup" : "Continue to book"}
          </button>
        </div>
      </div>
    </div>
  );
}
