import Link from "next/link";
import MapEmbed from "@/components/MapEmbed";

export const metadata = {
  title: "Contact · Signal Shift",
};

const SOCIAL = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Twitter",
    href: "https://twitter.com",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01z" />
      </svg>
    ),
  },
];

export default function ContactPage() {
  return (
    <div className="bg-[#0a0b0c]">
      {/* ───── Hero ───── */}
      <section className="relative overflow-hidden bg-[#0a0b0c] px-6 pt-20 pb-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(178,247,70,0.08),_transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-[#b2f746]">
            · Get in Touch ·
          </p>
          <h1 className="font-display text-5xl font-black tracking-tight text-white md:text-6xl">
            Let&apos;s <span className="text-[#b2f746]">Talk</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/60">
            Got a question, want to book a private event, or just want to say hi? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* ───── Visit Us / Reach Us cards ───── */}
      <section className="bg-[#0a0b0c] px-6 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          {/* Visit Us */}
          <div className="overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.03]">
            <div className="p-8 pb-5">
              <div className="mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b2f746" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h2 className="mb-3 font-display text-2xl font-black text-white">Visit Us</h2>
              <p className="text-base leading-relaxed text-white/70">
                Signal Shift Sports & Events Centre
                <br />
                Ananthanadarkudy, Kanyakumari district
                <br />
                Tamil Nadu, India
              </p>
              <a
                href="https://www.google.com/maps/place/Signal+Shift+Sports+%26+Events+Centre/@8.1496779,77.3826845,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#b2f746] underline-offset-4 hover:underline"
              >
                Get Directions
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="h-64 w-full border-t border-white/[0.06]">
              <MapEmbed />
            </div>
          </div>

          {/* Reach Us */}
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-8">
            <div className="mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b2f746" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h2 className="mb-3 font-display text-2xl font-black text-white">Reach Us</h2>
            <div className="mb-5">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Phone
              </p>
              <a
                href="tel:+918420058420"
                className="mt-1 inline-block text-base font-semibold text-[#b2f746] underline-offset-4 hover:underline"
              >
                +91 84200 58420
              </a>
            </div>
            <div className="mb-5">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Email
              </p>
              <a
                href="mailto:signalshiftturf@gmail.com"
                className="mt-1 inline-block text-base font-semibold text-[#b2f746] underline-offset-4 hover:underline"
              >
                signalshiftturf@gmail.com
              </a>
            </div>
            <div>
              <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Follow Us
              </p>
              <div className="flex gap-2">
                {SOCIAL.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/70 transition-all hover:-translate-y-0.5 hover:border-[#b2f746]/50 hover:bg-[#b2f746]/10 hover:text-[#b2f746]"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Final CTA ───── */}
      <section className="bg-[#0a0b0c] px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl bg-[#b2f746] p-10 text-center md:p-14">
            <h2 className="font-display text-3xl font-black text-[#121f00] md:text-4xl">
              Ready to play?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-[#121f00]/80">
              Skip the calls. Book your slot in seconds and show up ready to play.
            </p>
            <Link
              href="/login"
              className="mt-7 inline-block rounded-full bg-[#121f00] px-10 py-4 text-sm font-bold tracking-wide text-[#b2f746] shadow-lg transition-transform hover:scale-[1.03]"
            >
              Book Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
