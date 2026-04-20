"use client";

import { useRef, useState } from "react";
import { fileToCompressedDataUrl } from "@/lib/imageUpload";

type Props = {
  /** Current image URL (data URL or http). Null shows fallback initials. */
  src: string | null | undefined;
  /** Text to show when no image is set (usually initials). */
  fallback: string;
  /** Called after successful compression — you then PATCH the server. */
  onChange: (dataUrl: string) => Promise<void> | void;
  /** Called when user clicks "Remove". If omitted, Remove button is hidden. */
  onRemove?: () => Promise<void> | void;
  /** Optional background gradient for the fallback tile. */
  accent?: { from: string; to: string; text?: string };
  /** Size preset. */
  size?: "sm" | "md" | "lg";
  /** Readable label for accessibility. */
  label?: string;
};

const SIZE_CLASSES: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-14 w-14 rounded-xl text-base",
  md: "h-16 w-16 rounded-2xl text-xl",
  lg: "h-24 w-24 rounded-2xl text-3xl",
};

export default function AvatarUpload({
  src,
  fallback,
  onChange,
  onRemove,
  accent,
  size = "md",
  label = "Change photo",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accentStyle = accent
    ? { background: `linear-gradient(135deg, ${accent.from} 0%, ${accent.to} 100%)`, color: accent.text ?? "#fff" }
    : { background: "linear-gradient(135deg, #b2f746 0%, #86df72 100%)", color: "#121f00" };

  async function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again later
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      await onChange(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative inline-block">
        <div
          className={`grain-overlay relative flex shrink-0 items-center justify-center overflow-hidden font-display font-black tracking-tight ${SIZE_CLASSES[size]}`}
          style={accentStyle}
        >
          {src ? (
            <img src={src} alt="" className="h-full w-full object-cover" />
          ) : (
            <span>{fallback}</span>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
          )}
        </div>
        {/* Camera button */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label={label}
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#b2f746] text-[#121f00] shadow-lg shadow-[#b2f746]/30 ring-2 ring-[#0a0b0c] transition-transform hover:scale-110 disabled:opacity-60"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePick}
        />
      </div>

      {(src && onRemove) || error ? (
        <div className="flex flex-col gap-1">
          {error && <p className="text-xs text-rose-300">{error}</p>}
          {src && onRemove && (
            <button
              type="button"
              onClick={() => onRemove()}
              disabled={uploading}
              className="self-start text-[11px] font-semibold uppercase tracking-wider text-white/50 underline-offset-4 hover:text-rose-300 hover:underline disabled:opacity-50"
            >
              Remove photo
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
