import {
  MAX_PHOTO_COUNT,
  MAX_PHOTO_FILE_BYTES,
  MAX_PHOTO_TOTAL_BYTES,
} from "@/lib/estimate-validation";

/**
 * Server-side validation for photos uploaded to the estimate endpoint
 * (src/app/api/estimate/route.ts). Deliberately kept in its own,
 * server-only module (rather than folded into estimate-validation.ts,
 * which the client also imports for shared constants) since it reads
 * file bytes and uses Node's Buffer — nothing here should ever end up
 * in a client bundle.
 *
 * Untrusted input: never trust the browser-supplied `file.type`/
 * filename extension alone. Each file's first bytes are checked against
 * the real JPEG/PNG magic numbers before it's treated as an image, so a
 * renamed or relabeled file can't slip through as an attachment.
 */

export type ValidatedPhoto = {
  /** Sanitized, safe-to-use version of the original filename. */
  filename: string;
  contentType: "image/jpeg" | "image/png";
  buffer: Buffer;
};

export type PhotoValidationResult =
  { ok: true; photos: ValidatedPhoto[] } | { ok: false; message: string };

const JPEG_MAGIC = [0xff, 0xd8, 0xff];
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function bytesStartWith(bytes: Uint8Array, signature: number[]): boolean {
  if (bytes.length < signature.length) return false;
  return signature.every((byte, index) => bytes[index] === byte);
}

/** Sniffs the real file type from its bytes, ignoring the declared
 * MIME type entirely — returns null if it isn't recognizably a JPEG or
 * PNG. */
function sniffImageType(bytes: Uint8Array): "image/jpeg" | "image/png" | null {
  if (bytesStartWith(bytes, JPEG_MAGIC)) return "image/jpeg";
  if (bytesStartWith(bytes, PNG_MAGIC)) return "image/png";
  return null;
}

/** Strips path separators, control characters, and anything else that
 * isn't safe in an email attachment filename, while preserving the
 * original name as closely as possible. Falls back to a generic name
 * if nothing usable survives. */
function sanitizeFilename(
  name: string,
  index: number,
  extension: string,
): string {
  const base = name
    .replace(/[\\/]/g, "_")
    .replace(/[\x00-\x1f\x7f]/g, "")
    .trim()
    .slice(0, 120);

  if (!base) return `photo-${index + 1}${extension}`;
  return base;
}

function extensionFor(contentType: "image/jpeg" | "image/png"): string {
  return contentType === "image/png" ? ".png" : ".jpg";
}

/**
 * Validates and reads the photo files submitted with an estimate
 * request. Enforces count, per-file size, combined total size, and
 * real (byte-sniffed) file type — all server-side, independent of
 * whatever the browser already checked (see FileUploadField.tsx for
 * the client-side mirror of these same limits).
 */
export async function validatePhotos(
  files: File[],
): Promise<PhotoValidationResult> {
  if (files.length > MAX_PHOTO_COUNT) {
    return {
      ok: false,
      message: `You can attach up to ${MAX_PHOTO_COUNT} photos.`,
    };
  }

  let totalBytes = 0;
  const photos: ValidatedPhoto[] = [];

  for (const [index, file] of files.entries()) {
    if (file.size > MAX_PHOTO_FILE_BYTES) {
      const maxMb = (MAX_PHOTO_FILE_BYTES / (1024 * 1024)).toFixed(1);
      return {
        ok: false,
        message: `"${file.name}" is larger than ${maxMb}MB. Please choose a smaller photo.`,
      };
    }

    totalBytes += file.size;
    if (totalBytes > MAX_PHOTO_TOTAL_BYTES) {
      const maxMb = (MAX_PHOTO_TOTAL_BYTES / (1024 * 1024)).toFixed(1);
      return {
        ok: false,
        message: `Your photos add up to more than ${maxMb}MB total. Please remove one or choose smaller files.`,
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const sniffedType = sniffImageType(bytes);

    if (!sniffedType) {
      return {
        ok: false,
        message: `"${file.name}" isn't a valid JPG or PNG file.`,
      };
    }

    photos.push({
      filename: sanitizeFilename(file.name, index, extensionFor(sniffedType)),
      contentType: sniffedType,
      buffer: Buffer.from(bytes),
    });
  }

  return { ok: true, photos };
}
