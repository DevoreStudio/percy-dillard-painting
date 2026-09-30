import {
  MAX_PHOTO_FILE_BYTES,
  MAX_PHOTO_TOTAL_BYTES,
} from "@/lib/estimate-validation";

/**
 * Client-side photo optimization for the estimate form.
 *
 * Real phone-camera photos routinely arrive well over the server's
 * per-photo/combined budget (see the comment on MAX_PHOTO_FILE_BYTES /
 * MAX_PHOTO_TOTAL_BYTES in estimate-validation.ts for why that budget
 * is this small — Vercel's serverless function request-body ceiling).
 * Rather than asking a customer to manually resize photos before they
 * can submit an estimate request, oversized images are automatically
 * resized/recompressed here, in the browser, before upload.
 *
 * This is a convenience layer only, not a security boundary — the
 * server (estimate-photo-validation.ts) re-validates real file type
 * (by magic bytes), count, per-file size, and combined size
 * independently, and does not trust anything about how these bytes
 * were produced or what this module claims about them.
 *
 * Uses only browser-native APIs (createImageBitmap, Canvas, Blob,
 * File) — no image-processing dependency was added for this.
 */

/** Long edge (px) tried, largest first. 1920 keeps enough detail for
 * Percy to inspect painting/drywall surface conditions (cracks,
 * texture, color) while already being a substantial reduction from a
 * typical modern phone photo (commonly 3000-4000px on the long edge);
 * smaller steps are only tried if 1920 doesn't fit the size budget.
 * Images are only ever scaled down, never up. */
const LONG_EDGE_STEPS = [1920, 1600, 1280, 1024, 800];

/** JPEG quality tried, highest first (0-1 scale). 0.8 is a standard
 * "visually high quality" JPEG setting and the suggested starting
 * point; lower steps are only used if 0.8 doesn't fit the budget. 0.5
 * is treated as the practical floor — below that, compression
 * artifacts start to obscure the surface detail Percy needs to see. */
const JPEG_QUALITY_STEPS = [0.8, 0.7, 0.6, 0.5];

export type OptimizePhotosResult =
  { ok: true; files: File[] } | { ok: false; message: string };

type CompressResult = { ok: true; file: File } | { ok: false; reason: string };

function stripExtension(name: string): string {
  const index = name.lastIndexOf(".");
  return index > 0 ? name.slice(0, index) : name;
}

function toOptimizedFile(
  blob: Blob,
  originalName: string,
  extension: string,
): File {
  return new File([blob], `${stripExtension(originalName)}${extension}`, {
    type: blob.type,
    lastModified: Date.now(),
  });
}

/** Never upscales — returns the bitmap's original size if it's already
 * at or under `maxLongEdge`. */
function scaledSize(
  bitmap: ImageBitmap,
  maxLongEdge: number,
): { width: number; height: number } {
  const longEdge = Math.max(bitmap.width, bitmap.height);
  if (longEdge <= maxLongEdge) {
    return { width: bitmap.width, height: bitmap.height };
  }
  const scale = maxLongEdge / longEdge;
  return {
    width: Math.max(1, Math.round(bitmap.width * scale)),
    height: Math.max(1, Math.round(bitmap.height * scale)),
  };
}

function drawToBlob(
  bitmap: ImageBitmap,
  width: number,
  height: number,
  type: "image/jpeg" | "image/png",
  quality?: number,
): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);
  ctx.drawImage(bitmap, 0, 0, width, height);
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Resizes/recompresses a single file until it fits under `targetBytes`.
 * Tries the original format first (PNG stays PNG, JPEG stays JPEG)
 * across progressively smaller dimensions — PNG has no quality knob in
 * Canvas, so dimensions are its only lever. If a PNG still can't fit
 * while staying PNG, it's converted to JPEG (which compresses
 * photographic content far better) as a last resort — acceptable here
 * since these are project photos, not graphics needing transparency.
 * Returns the original file unchanged if it's already within budget.
 */
async function compressFile(
  file: File,
  targetBytes: number,
): Promise<CompressResult> {
  if (file.size <= targetBytes) {
    return { ok: true, file };
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return { ok: false, reason: "couldn't be read as an image" };
  }

  try {
    const isPng = file.type === "image/png";

    for (const longEdge of LONG_EDGE_STEPS) {
      const { width, height } = scaledSize(bitmap, longEdge);

      if (isPng) {
        const blob = await drawToBlob(bitmap, width, height, "image/png");
        if (blob && blob.size <= targetBytes) {
          return { ok: true, file: toOptimizedFile(blob, file.name, ".png") };
        }
        continue;
      }

      for (const quality of JPEG_QUALITY_STEPS) {
        const blob = await drawToBlob(
          bitmap,
          width,
          height,
          "image/jpeg",
          quality,
        );
        if (blob && blob.size <= targetBytes) {
          return { ok: true, file: toOptimizedFile(blob, file.name, ".jpg") };
        }
      }
    }

    // PNG couldn't fit while staying PNG at any tried size — fall back
    // to JPEG.
    if (isPng) {
      for (const longEdge of LONG_EDGE_STEPS) {
        const { width, height } = scaledSize(bitmap, longEdge);
        for (const quality of JPEG_QUALITY_STEPS) {
          const blob = await drawToBlob(
            bitmap,
            width,
            height,
            "image/jpeg",
            quality,
          );
          if (blob && blob.size <= targetBytes) {
            return {
              ok: true,
              file: toOptimizedFile(blob, file.name, ".jpg"),
            };
          }
        }
      }
    }

    return {
      ok: false,
      reason: "is too large or detailed to optimize for upload",
    };
  } finally {
    bitmap.close();
  }
}

/**
 * Optimizes a batch of selected photos so the whole set fits the
 * server's combined upload budget (MAX_PHOTO_TOTAL_BYTES), not just
 * each file's individual budget (MAX_PHOTO_FILE_BYTES) — several
 * photos that each just barely fit alone could still add up to more
 * than the combined limit. Already-small files are left untouched.
 * Never partially succeeds silently: either the whole batch comes back
 * usable, or a specific, human-readable reason is returned.
 */
export async function optimizePhotos(
  files: File[],
): Promise<OptimizePhotosResult> {
  if (files.length === 0) {
    return { ok: true, files: [] };
  }

  const firstPass: File[] = [];
  for (const file of files) {
    const result = await compressFile(file, MAX_PHOTO_FILE_BYTES);
    if (!result.ok) {
      return {
        ok: false,
        message: `"${file.name}" ${result.reason}. Please choose a different photo.`,
      };
    }
    firstPass.push(result.file);
  }

  const firstTotal = firstPass.reduce((sum, file) => sum + file.size, 0);
  if (firstTotal <= MAX_PHOTO_TOTAL_BYTES) {
    return { ok: true, files: firstPass };
  }

  // Individually each photo fits, but the set doesn't — recompress
  // from the ORIGINAL files (not the already-compressed ones, to avoid
  // compounding JPEG artifacts) targeting a fair share of the combined
  // budget instead.
  const fairShare = Math.floor(MAX_PHOTO_TOTAL_BYTES / files.length);
  const secondPass: File[] = [];
  for (const file of files) {
    const result = await compressFile(
      file,
      Math.min(fairShare, MAX_PHOTO_FILE_BYTES),
    );
    if (!result.ok) {
      return {
        ok: false,
        message: `"${file.name}" ${result.reason}. Please choose fewer or smaller photos.`,
      };
    }
    secondPass.push(result.file);
  }

  const secondTotal = secondPass.reduce((sum, file) => sum + file.size, 0);
  if (secondTotal <= MAX_PHOTO_TOTAL_BYTES) {
    return { ok: true, files: secondPass };
  }

  return {
    ok: false,
    message:
      "Your photos add up to more than the supported total, even after optimizing. Please remove one and try again.",
  };
}
