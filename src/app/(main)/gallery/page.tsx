import GalleryGrid from "@/components/gallery/GalleryGrid";

export const metadata = {
  title: "Gallery · Signal Shift",
};

export default function GalleryPage() {
  return (
    <div className="bg-[#0a0b0c]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0a0b0c] px-6 pt-20 pb-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(178,247,70,0.08),_transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-[#b2f746]">
            · Gallery ·
          </p>
          <h1 className="font-display text-5xl font-black tracking-tight text-white md:text-6xl">
            See the <span className="text-[#b2f746]">turf</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/60">
            A closer look at Signal Shift — the surface, the lights, and the moments that make weekends worth waiting for.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="bg-[#0a0b0c] px-6 pb-24">
        <div className="mx-auto max-w-7xl">
          <GalleryGrid />
        </div>
      </section>
    </div>
  );
}
