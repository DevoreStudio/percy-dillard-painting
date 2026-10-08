import { NextResponse } from "next/server";
import { validatePhotos } from "@/lib/estimate-photo-validation";
import { checkForSpam } from "@/lib/estimate-spam-check";
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
import {
  TurnstileConfigError,
  TurnstileVerificationError,
  verifyTurnstileToken,
} from "@/lib/verify-turnstile";

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
 * entries, plus a "cf-turnstile-response" token from the Turnstile
 * widget in EstimateForm.tsx. Photo files are validated and read
 * server-side in validatePhotos() (src/lib/estimate-photo-validation.ts)
 * and, when valid, sent as real attachments on the Resend email — see
 * that file for the size budget this is built around and why.
 *
 * Checks run cheapest-and-most-decisive first, so an abusive request is
 * rejected before any expensive work happens on it:
 *
 *   rate limit
 *   -> request-size pre-check
 *   -> parse body (unavoidable single parse with the native FormData
 *      API — there's no way to read only the text fields and defer
 *      file bytes without a non-native multipart parser)
 *   -> honeypot (free)
 *   -> Turnstile server verification (one network call, but far
 *      cheaper than reading/encoding photo bytes)
 *   -> field validation (cheap, in-memory)
 *   -> content-based spam check (cheap, in-memory, see
 *      estimate-spam-check.ts)
 *   -> photo validation (the expensive part — reads every file's full
 *      bytes for magic-byte sniffing)
 *   -> Resend
 *
 * High-confidence spam (content check) and the honeypot both respond
 * with a generic { ok: true } and send nothing — matching behavior so
 * neither can be distinguished from a real success by a bot probing the
 * endpoint. Turnstile failures are NOT treated this way: a missing,
 * invalid, expired, reused, or unverifiable token is a real, honest
 * error the legitimate visitor needs to see and retry from (see the
 * error handling below) — it is not assumed to be spam.
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

  // Turnstile: verified before any field/content validation, since it's
  // the strongest signal and cheaper than the photo work that follows.
  // A failure here is a real, honest error (see the module docblock) —
  // never the generic { ok: true } used for detected spam, and the
  // route fails CLOSED (rejects) rather than skipping verification if
  // TURNSTILE_SECRET_KEY isn't configured.
  try {
    await verifyTurnstileToken(readField("cf-turnstile-response"), clientIp);
  } catch (error) {
    if (error instanceof TurnstileConfigError) {
      console.error("[estimate] turnstile not configured:", error.message);
      return NextResponse.json(
        {
          ok: false,
          error: "not_configured",
          message: "Estimate request verification isn't set up yet.",
        },
        { status: 500 },
      );
    }

    // Covers a missing, invalid, expired, or already-used token, and
    // network/Cloudflare-side failures verifying it. Logged for
    // diagnosis, but the visitor only ever gets a generic, retryable
    // message — no detail about which of those it was, so this can't
    // be used as an oracle to find a token shape that slips through.
    if (error instanceof TurnstileVerificationError) {
      console.error("[estimate] turnstile verification failed:", error.message);
    } else {
      console.error("[estimate] unexpected turnstile error:", error);
    }
    return NextResponse.json(
      {
        ok: false,
        error: "verification_failed",
        message: "We couldn't verify your request. Please try again.",
      },
      { status: 403 },
    );
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

  // Content-based spam check: only runs on already-shape-valid fields,
  // and only looks for high-confidence patterns (excess links, known
  // marketing/SEO solicitation phrases, bot-filler text — see
  // estimate-spam-check.ts for the conservative thresholds and the
  // false-positive reasoning behind them). High-confidence spam gets
  // the same generic { ok: true } as the honeypot, before the expensive
  // photo-reading work below ever runs — nothing is sent to Resend.
  const spamCheck = checkForSpam(result.values);
  if (spamCheck.spam) {
    console.warn("[estimate] content spam check matched:", spamCheck.reason);
    return NextResponse.json({ ok: true });
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
