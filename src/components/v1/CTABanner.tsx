import Link from "next/link";

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  href: string;
};

export default function CTABanner({ eyebrow, title, subtitle, buttonLabel, href }: Props) {
  return (
    <section className="px-6 pb-16 md:pb-20">
      <div className="mx-auto max-w-4xl rounded-3xl bg-[#004900] p-8 text-center md:p-14">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-[#b2f746]">
          · {eyebrow} ·
        </p>
        <h2 className="mt-3 font-display text-2xl font-black tracking-tight text-white md:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-white/70">{subtitle}</p>
        <Link
          href={href}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#b2f746] px-6 py-3 text-sm font-bold text-[#121f00] shadow-lg shadow-[#b2f746]/20 transition-transform hover:scale-[1.03] md:px-8 md:py-4"
        >
          {buttonLabel}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
