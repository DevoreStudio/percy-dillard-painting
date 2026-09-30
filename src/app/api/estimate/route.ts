import { NextResponse } from "next/server";
import { validatePhotos } from "@/lib/estimate-photo-validation";
import {
  MAX_PHOTO_TOTAL_BYTES,
  validateEstimateRequest,
} from "@/lib/estimate-validation";
import { isWithinRateLimit } from "@/lib/rate-limit";
import {
  EstimateEmailConfigError,
  EstimateEmailDeliveryError,
  sendEstimateEmail,
} from "@/lib/send-estimate-email";

// Node.js runtime (the default) rather than Edge: this route reads
// server-only env vars, reads uploaded file bytes, and makes a normal
// outbound fetch to Resend — nothing here needs Edge's constrained
// runtime.
export const runtime = "nodejs";

// Rough ceiling for the whole request body (text fields + multipart
// overhead + photos), kept comfortably under Vercel's hard ~4.5MB
// serverless function request-body limit (see
// https://vercel.com/docs/functions/limitations and the photo-budget
// note in estimate-validation.ts). This is just a fast, friendlier
// pre-check before parsing — the platform's own ceiling is the real
// backstop and applies regardless of this check.
const MAX_REQUEST_BYTES = MAX_PHOTO_TOTAL_BYTES + 256 * 1024;

/**
 * Estimate request endpoint. Accepts a multipart/form-data POST: the
 * text fields plus up to MAX_PHOTO_COUNT photos under repeated "photos"
 * entries. Photo files are validated and read server-side in
 * validatePhotos() (src/lib/estimate-photo-validation.ts) and, when
 * valid, sent as real attachments on the Resend email — see that file
 * for the size budget this is built around and why.
 */
export async function POST(request: Request) {
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (!isWithinRateLimit(clientIp)) {
    return NextResponse.json(
      {
        ok: false,
        error: "rate_limited",
        message: "Too many requests. Please try again in a few minutes.",
      },
      { status: 429 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "");
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json(
      {
        ok: false,
        error: "payload_too_large",
        message:
          "Your photos are too large to send. Please remove a photo or choose smaller files.",
      },
      { status: 413 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_body", message: "Malformed request." },
      { status: 400 },
    );
  }

  function readField(name: string): string {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  }

  // Honeypot: a real visitor never fills this field in (it's visually
  // hidden and out of tab order — see EstimateForm.tsx). A populated
  // value almost certainly means a bot. Respond exactly as if the
  // submission succeeded, without actually sending anything, so the bot
  // gets no signal that it was caught and has no reason to adapt.
  const honeypot = readField("company").trim();
  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  const body = {
    name: readField("name"),
    phone: readField("phone"),
    email: readField("email"),
    city: readField("city"),
    details: readField("details"),
    services: formData.getAll("services").filter((v) => typeof v === "string"),
  };

  const result = validateEstimateRequest(body);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: "validation_failed", fieldErrors: result.errors },
      { status: 422 },
    );
  }

  const photoFiles = formData
    .getAll("photos")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  const photoValidation = await validatePhotos(photoFiles);
  if (!photoValidation.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "validation_failed",
        fieldErrors: { photos: photoValidation.message },
      },
      { status: 422 },
    );
  }

  try {
    await sendEstimateEmail(
      result.values,
      photoValidation.photos.map((photo) => ({
        filename: photo.filename,
        content: photo.buffer.toString("base64"),
      })),
    );
  } catch (error) {
    // Log server-side for diagnosis, but never forward provider
    // response bodies, stack traces, or API keys to the browser — the
    // client only ever gets a generic, honest failure message. Avoid
    // logging the customer's submitted details (name/phone/email/
    // project description) beyond what's needed to diagnose a delivery
    // failure.
    if (error instanceof EstimateEmailConfigError) {
      console.error("[estimate] email not configured:", error.message);
      return NextResponse.json(
        {
          ok: false,
          error: "not_configured",
          message: "Estimate request delivery isn't set up yet.",
        },
        { status: 500 },
      );
    }

    if (error instanceof EstimateEmailDeliveryError) {
      console.error("[estimate] delivery failed:", error.message);
      return NextResponse.json(
        {
          ok: false,
          error: "delivery_failed",
          message: "We couldn't send your request right now.",
        },
        { status: 502 },
      );
    }

    console.error("[estimate] unexpected error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "unexpected",
        message: "Something went wrong on our end.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
