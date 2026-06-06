const HIGHLIGHTS = [
  {
    n: "01",
    title: "40mm Cushioned Turf",
    sub: "Premium eco-friendly playing surface",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b2f746" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 20h18M5 20V8M9 20V4M13 20V10M17 20V6M21 20V12" />
      </svg>
    ),
  },
  {
    n: "02",
    title: "LED Scoreboard",
    sub: "For real match-day feel",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b2f746" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="12" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    n: "03",
    title: "Premium PA System",
    sub: "With Ahuja speakers",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b2f746" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11v2a4 4 0 0 0 4 4l7 4V4L7 8H4a1 1 0 0 0-1 1z" />
        <path d="M18 8a5 5 0 0 1 0 8" />
      </svg>
    ),
  },
  {
    n: "04",
    title: "Philips LED Floodlights",
    sub: "Eye-comfort, glare-free lighting",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b2f746" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
      </svg>
    ),
  },
  {
    n: "05",
    title: "Separate Restrooms",
    sub: "For gents & ladies",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b2f746" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="4" r="2" />
        <path d="M6 22v-6H4l2-7h4l2 7h-2v6" />
        <circle cx="17" cy="4" r="2" />
        <path d="M15 22v-5h-2l2-8h4l2 8h-2v5" />
      </svg>
    ),
  },
  {
    n: "06",
    title: "RO Drinking Water",
    sub: "Clean and chilled, on tap",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b2f746" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2c3 5 6 9 6 13a6 6 0 0 1-12 0c0-4 3-8 6-13z" />
      </svg>
    ),
  },
  {
    n: "07",
    title: "Convenient Parking",
    sub: "Ample on-site space",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b2f746" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
      </svg>
    ),
  },
  {
    n: "08",
    title: "Removable Cricket Pitch",
    sub: "Football-friendly turf underneath",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b2f746" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
    ),
  },
  {
    n: "09",
    title: "CCTV-Secured Campus",
    sub: "24/7 monitoring for safety",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b2f746" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7h12l4 4v6H3z" />
        <circle cx="9" cy="13" r="2" />
        <path d="M3 21v-2" />
      </svg>
    ),
  },
  {
    n: "10",
    title: "Cafeteria with Arun",
    sub: "Ice creams & fresh juices",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b2f746" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8h12l-1.5 12a2 2 0 0 1-2 1.7h-5a2 2 0 0 1-2-1.7L6 8z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
    ),
  },
];

type Props = {
  compact?: boolean;
};

export default function TurfHighlights({ compact = false }: Props) {
  return (
    <section className={`bg-[#0a0b0c] px-6 ${compact ? "py-12" : "py-24"}`}>
      <div className="mx-auto max-w-7xl">
        <div className={`text-center ${compact ? "mb-8" : "mb-14"}`}>
          <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-[#b2f746]">
            · Play. Perform. Celebrate. ·
          </p>
          <h2 className={`font-display font-black tracking-tight text-white ${compact ? "text-2xl md:text-3xl" : "text-4xl md:text-5xl"}`}>
            Turf Highlights
          </h2>
          {!compact && (
            <p className="mt-4 text-lg text-white/60">
              Premium facilities, built for champions.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {HIGHLIGHTS.map((h) => (
            <div
              key={h.n}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 transition-all hover:-translate-y-1 hover:border-[#b2f746]/40 hover:bg-[#b2f746]/[0.04]"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#b2f746] px-2 font-display text-xs font-black text-[#121f00]">
                  {h.n}
                </span>
                {h.icon}
              </div>
              <h3 className="mb-1.5 font-display text-base font-black leading-tight text-white">
                {h.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/60">{h.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
