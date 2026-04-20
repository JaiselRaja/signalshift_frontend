/**
 * Client-side image → data URL pipeline.
 *
 * Resizes to a max dimension (default 400px) via Canvas, encodes as JPEG at
 * a given quality (default 0.85), returns a `data:image/jpeg;base64,...`
 * string. We store the result directly in `User.avatar_url` / `Team.logo_url`
 * (both `Text` columns) so there's no file server to run.
 *
 * Rejects files that aren't images and results larger than `maxBytes`.
 */

export const AVATAR_MAX_BYTES = 80_000; // ~80 KB cap on the data URL

export type ImageToDataUrlOptions = {
  maxDimension?: number;
  quality?: number;
  maxBytes?: number;
};

export async function fileToCompressedDataUrl(
  file: File,
  opts: ImageToDataUrlOptions = {},
): Promise<string> {
  const { maxDimension = 400, quality = 0.85, maxBytes = AVATAR_MAX_BYTES } = opts;

  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  const bitmap = await loadBitmap(file);
  const { width, height } = scaleToFit(bitmap.width, bitmap.height, maxDimension);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Unable to prepare image canvas.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  // Try a few quality levels if the first encoding is too large
  for (const q of [quality, 0.75, 0.6, 0.45]) {
    const dataUrl = canvas.toDataURL("image/jpeg", q);
    if (estimateBytes(dataUrl) <= maxBytes) return dataUrl;
  }

  // Last resort: shrink further
  const smaller = await fileToCompressedDataUrl(file, {
    maxDimension: Math.round(maxDimension * 0.75),
    quality: 0.7,
    maxBytes,
  });
  return smaller;
}

async function loadBitmap(file: File): Promise<ImageBitmap> {
  // createImageBitmap is well-supported on all modern browsers incl. iOS Safari 15+
  if (typeof createImageBitmap === "function") {
    return await createImageBitmap(file);
  }
  // Fallback for very old browsers (uses an Image element)
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<ImageBitmap>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const cx = c.getContext("2d");
        if (!cx) return reject(new Error("Canvas unavailable."));
        cx.drawImage(img, 0, 0);
        c.toBlob((b) => {
          if (!b) return reject(new Error("Could not decode image."));
          createImageBitmap(b).then(resolve).catch(reject);
        });
      };
      img.onerror = () => reject(new Error("Image failed to load."));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function scaleToFit(w: number, h: number, max: number): { width: number; height: number } {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = w > h ? max / w : max / h;
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

function estimateBytes(dataUrl: string): number {
  // base64 inflates data by ~4/3; for cheap comparison, just use string length.
  return dataUrl.length;
}
