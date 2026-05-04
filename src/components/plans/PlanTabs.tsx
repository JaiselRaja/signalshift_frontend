"use client";

type Tab = "monthly" | "daily";

export default function PlanTabs({
  active,
  onChange,
  size = "md",
  className = "",
}: {
  active: Tab;
  onChange: (t: Tab) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const outerSize: Record<typeof size, string> = {
    sm: "p-1 text-xs",
    md: "p-1.5 text-sm",
    lg: "p-2 text-sm",
  };
  const innerPad: Record<typeof size, string> = {
    sm: "px-4 py-1.5",
    md: "px-6 py-2.5",
    lg: "px-7 py-3",
  };
  return (
    <div
      className={`inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] ${outerSize[size]} ${className}`}
    >
      {(["monthly", "daily"] as const).map((t) => {
        const isActive = active === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={`${innerPad[size]} rounded-full font-bold tracking-wide capitalize transition-all ${
              isActive
                ? "bg-[#b2f746] text-[#121f00] shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            {t === "monthly" ? "Monthly Plans" : "Daily Pass"}
          </button>
        );
      })}
    </div>
  );
}
