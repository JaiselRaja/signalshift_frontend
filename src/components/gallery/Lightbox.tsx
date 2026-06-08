"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";

import type { GALLERY_PHOTOS } from "./photos";

type Photo = (typeof GALLERY_PHOTOS)[number];

type Props = {
  photos: Photo[];
  activeIndex: number | null;
  onClose: () => void;
  onChange: (index: number) => void;
};

export default function Lightbox({ photos, activeIndex, onClose, onChange }: Props) {
  const touchStartX = useRef<number | null>(null);

  const goPrev = useCallback(() => {
    if (activeIndex === null) return;
    onChange((activeIndex - 1 + photos.length) % photos.length);
  }, [activeIndex, photos.length, onChange]);

  const goNext = useCallback(() => {
    if (activeIndex === null) return;
    onChange((activeIndex + 1) % photos.length);
  }, [activeIndex, photos.length, onChange]);

  // Keyboard nav: ESC closes, Left/Right cycle.
  useEffect(() => {
    if (activeIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKey);
    // Lock background scroll while open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [activeIndex, goPrev, goNext, onClose]);

  if (activeIndex === null) return null;
  const photo = photos[activeIndex];

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx > 0) goPrev();
    else goNext();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
    >
      {/* Top bar */}
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-5 py-4 text-white/80">
        <span className="font-mono text-xs tracking-widest">
          {activeIndex + 1} / {photos.length}
        </span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          aria-label="Close"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Prev */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); goPrev(); }}
        aria-label="Previous photo"
        className="absolute left-4 z-10 hidden h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/90 transition-colors hover:bg-white/20 sm:flex"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Image */}
      <div
        className="relative max-h-[88vh] max-w-[92vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          width={2400}
          height={1600}
          priority
          sizes="92vw"
          style={{
            width: "auto",
            height: "auto",
            maxHeight: "88vh",
            maxWidth: "92vw",
            objectFit: "contain",
          }}
          className="rounded-2xl"
        />
      </div>

      {/* Next */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); goNext(); }}
        aria-label="Next photo"
        className="absolute right-4 z-10 hidden h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/90 transition-colors hover:bg-white/20 sm:flex"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
