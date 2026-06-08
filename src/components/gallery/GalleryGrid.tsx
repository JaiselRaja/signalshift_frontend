"use client";

import Image from "next/image";
import { useState } from "react";

import { GALLERY_PHOTOS } from "./photos";
import Lightbox from "./Lightbox";

type Props = {
  /** Subset of photos to show. Defaults to the full set. */
  photos?: typeof GALLERY_PHOTOS;
  /** Tighter padding / smaller column count for in-page sections (vs the full page). */
  compact?: boolean;
};

export default function GalleryGrid({ photos = GALLERY_PHOTOS, compact = false }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <>
      <div
        className={
          compact
            ? "columns-2 gap-3 sm:columns-3 [&>*]:mb-3"
            : "columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4"
        }
      >
        {photos.map((p, i) => (
          <button
            type="button"
            key={p.src}
            onClick={() => setActiveIndex(i)}
            className="group block w-full overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all hover:border-[#b2f746]/40 focus:outline-none focus:ring-2 focus:ring-[#b2f746]/40"
            aria-label={`Open photo ${i + 1}`}
          >
            <Image
              src={p.src}
              alt={p.alt}
              width={1600}
              height={1067}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              style={{ width: "100%", height: "auto" }}
              className="block transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </button>
        ))}
      </div>

      <Lightbox
        photos={photos}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onChange={setActiveIndex}
      />
    </>
  );
}
