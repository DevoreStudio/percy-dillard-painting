import { NextResponse } from "next/server";
import { validateEstimateRequest } from "@/lib/estimate-validation";
import { isWithinRateLimit } from "@/lib/rate-limit";
import {
  EstimateEmailConfigError,
  EstimateEmailDeliveryError,
  sendEstimateEmail,
} from "@/lib/send-estimate-email";

// Node.js runtime (the default) rather than Edge: this route reads
// server-only env vars and makes a normal outbound fetch to Resend,
// nothing here needs Edge's constrained runtime.
export const runtime = "nodejs";

/**
 * Estimate request endpoint.
 *
 * PHOTO STRATEGY — read before changing this file to accept file
 * uploads:
 *
 * This endpoint intentionally does NOT accept photo file bytes today.
 * Vercel's serverless functions have a hard 4.5MB request body limit
 * that cannot be raised through configuration (see
 * https://vercel.com/docs/functions/limitations) — it's a platform
 * ceiling, not a Resend limitation (Resend accepts up to 40MB per
 * email). The estimate form currently expects to support up to 6
 * photos with no aggressive compression, and real phone photos
 * routinely run 2-8MB each — even a single typical photo could exceed
 * the request body limit on its own, well before Resend or email
 * provider limits become relevant. Direct attachment through this
 * function is therefore not a reliable architecture at the form's
 * current photo expectations.
 *
 * The client instead sends only a photo COUNT (see
 * EstimateFormPayload.photoCount) so Percy's email can honestly note
 * "customer selected N photos" without the endpoint ever touching file
 * data. Making photos actually arrive requires either uploading them
 * client-side directly to external storage (bypassing this function
 * entirely — e.g. Vercel Blob's client upload or Supabase Storage) or
 * accepting a much smaller photo/size budget than the form currently
 * advertises. That's a real architectural decision with a new
 * provider/account attached to it, so it hasn't been made here — see
 * the production-readiness report.
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

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_body", message: "Malformed request." },
      { status: 400 },
    );
  }

  // Honeypot: a real visitor never fills this field in (it's visually
  // hidden and out of tab order — see EstimateForm.tsx). A populated
  // value almost certainly means a bot. Respond exactly as if the
  // submission succeeded, without actually sending anything, so the bot
  // gets no signal that it was caught and has no reason to adapt.
  const honeypot = typeof body.company === "string" ? body.company.trim() : "";
  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  const result = validateEstimateRequest(body);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: "validation_failed", fieldErrors: result.errors },
      { status: 422 },
    );
  }

  try {
    await sendEstimateEmail(result.values);
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
