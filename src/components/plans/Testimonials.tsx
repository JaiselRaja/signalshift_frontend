import Eyebrow from "@/components/v1/Eyebrow";
import { TESTIMONIALS_PLANS } from "./data";

export default function Testimonials() {
  return (
    <section className="px-6 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center md:mb-12">
          <Eyebrow>Member Voices</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-white md:text-5xl">
            Players who never miss a week
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS_PLANS.map((t, i) => {
            const highlighted = i === 1;
            const initials = t.name
              .split(" ")
              .map((n) => n[0])
              .join("");
            return (
              <div
                key={t.name}
                className={`rounded-3xl p-6 transition-all hover:-translate-y-1 md:p-7 ${
                  highlighted
                    ? "bg-[#b2f746] text-[#121f00] shadow-[0_24px_60px_-24px_rgba(178,247,70,0.35)]"
                    : "border border-white/[0.06] bg-white/[0.03] text-white"
                }`}
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg
                        key={s}
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill={highlighted ? "#121f00" : "#b2f746"}
                        stroke="none"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      highlighted
                        ? "bg-[#121f00]/10 text-[#121f00]"
                        : "bg-[#b2f746]/15 text-[#b2f746]"
                    }`}
                  >
                    {t.plan}
                  </span>
                </div>
                <p
                  className={`mb-6 text-sm leading-relaxed ${
                    highlighted ? "text-[#121f00]/80" : "text-white/70"
                  }`}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-black ${
                      highlighted ? "bg-[#121f00] text-[#b2f746]" : "bg-[#b2f746] text-[#121f00]"
                    }`}
                  >
                    {initials}
                  </div>
                  <div>
                    <p
                      className={`font-display text-sm font-bold ${
                        highlighted ? "text-[#121f00]" : "text-white"
                      }`}
                    >
                      {t.name}
                    </p>
                    <p
                      className={`text-xs ${
                        highlighted ? "text-[#121f00]/60" : "text-white/50"
                      }`}
                    >
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
