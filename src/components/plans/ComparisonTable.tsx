import type { PlanRead } from "@/types";
import Eyebrow from "@/components/v1/Eyebrow";

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

function Dash({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function renderVal(v: string | boolean | null) {
  if (v === true)
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#b2f746]/15 text-[#b2f746]">
        <Check size={14} />
      </span>
    );
  if (v === false || v === null)
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.04] text-white/30">
        <Dash size={14} />
      </span>
    );
  return <span className="text-sm font-semibold text-white">{v}</span>;
}

function priceLabel(plan: PlanRead): string {
  return `₹${Number(plan.price).toLocaleString("en-IN")}${plan.price_unit}`;
}

function hoursLabel(plan: PlanRead): string {
  if (plan.plan_type === "daily") return "Pay per use";
  return plan.hours_per_month
    ? `${plan.hours_per_month} hrs/month`
    : "—";
}

function discountLabel(plan: PlanRead): string {
  if (plan.discount_pct == null) return "—";
  return `${plan.discount_pct}% off`;
}

function advanceLabel(plan: PlanRead): string {
  if (plan.advance_window_days == null) return "—";
  const days = plan.advance_window_days;
  if (days === 1) return "24 hours";
  return `${days} days`;
}

export default function ComparisonTable({ plans }: { plans: PlanRead[] }) {
  // Need at least 2 plans to show a comparison. If we have just one (or zero)
  // hide the table — it would look broken with empty columns.
  if (plans.length < 2) return null;

  const rows: { label: string; cell: (p: PlanRead) => string | boolean }[] = [
    { label: "Pricing", cell: priceLabel },
    { label: "Hours included", cell: hoursLabel },
    { label: "Discount on extra bookings", cell: discountLabel },
    { label: "Advance booking window", cell: advanceLabel },
    {
      label: "Recurring fixed slot",
      cell: (p) => p.plan_type === "monthly",
    },
  ];

  // Build column template — N plans = N+1 grid columns (first is feature label)
  const cols = `1.4fr ${plans.map(() => "1fr").join(" ")}`;

  return (
    <section className="px-6 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <Eyebrow>Side by Side</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-white md:text-5xl">
            Compare every detail
          </h2>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[640px] overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02]">
            <div className="grid text-sm" style={{ gridTemplateColumns: cols }}>
              <div className="border-b border-white/[0.06] bg-white/[0.03] p-4 text-xs font-semibold uppercase tracking-wider text-white/40 md:p-5">
                Feature
              </div>
              {plans.map((p) => (
                <div
                  key={p.id}
                  className={`border-b border-l p-4 text-center md:p-5 ${
                    p.featured
                      ? "border-[#b2f746]/30 bg-[#b2f746]/[0.06]"
                      : "border-white/[0.06] bg-white/[0.03]"
                  }`}
                >
                  <p
                    className={`font-display text-base font-black ${
                      p.featured ? "text-[#b2f746]" : "text-white"
                    }`}
                  >
                    {p.name}
                  </p>
                  <p
                    className={`text-xs ${
                      p.featured ? "text-[#b2f746]/70" : "text-white/40"
                    }`}
                  >
                    {p.featured ? "Most popular" : p.plan_type === "daily" ? "Pay per use" : "Monthly"}
                  </p>
                </div>
              ))}

              {rows.map((row, idx) => {
                const isLast = idx === rows.length - 1;
                const cellBase = `p-4 md:p-5 ${isLast ? "" : "border-b"} border-white/[0.06]`;
                return (
                  <div key={row.label} className="contents">
                    <div className={`${cellBase} text-white/70`}>{row.label}</div>
                    {plans.map((p) => (
                      <div
                        key={p.id}
                        className={`${cellBase} border-l text-center ${
                          p.featured ? "border-[#b2f746]/15 bg-[#b2f746]/[0.03]" : ""
                        }`}
                      >
                        {renderVal(row.cell(p))}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
