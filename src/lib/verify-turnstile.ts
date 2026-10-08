const SITEVERIFY_ENDPOINT =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Server-side verification of a Cloudflare Turnstile token (the estimate
 * form's bot-protection widget — see EstimateForm.tsx for the client
 * side). Thrown errors are split the same way as send-estimate-email.ts:
 *
 * - `TurnstileConfigError`: TURNSTILE_SECRET_KEY is missing — a
 *   deployment/config problem, not something the visitor can fix by
 *   retrying. The route must fail CLOSED here (reject the request)
 *   rather than silently skipping verification.
 * - `TurnstileVerificationError`: the token itself was missing, invalid,
 *   expired, already used, or the network/Cloudflare call itself failed.
 *   This is NOT the same thing as "detected spam" — see route.ts, which
 *   must surface this as a real, honest, retryable error rather than the
 *   generic success response used for actual spam content.
 *
 * No dependency added: this is a single POST to Cloudflare's siteverify
 * endpoint via the platform fetch, following the same pattern already
 * used for Resend in send-estimate-email.ts.
 */

export class TurnstileConfigError extends Error {}
export class TurnstileVerificationError extends Error {}

type SiteverifyResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

/**
 * Verifies a Turnstile token with Cloudflare. Resolves (void) only when
 * Cloudflare confirms the token is valid, unused, and unexpired for our
 * site. Every call reaches Cloudflare — there is no local caching or
 * short-circuiting — so a replayed token is rejected by Cloudflare
 * itself (`error-codes: ["timeout-or-duplicate"]`) on every repeat use,
 * not just the first.
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp: string,
): Promise<void> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    throw new TurnstileConfigError("TURNSTILE_SECRET_KEY is not configured.");
  }

  if (!token) {
    throw new TurnstileVerificationError("Missing Turnstile token.");
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (remoteIp && remoteIp !== "unknown") {
    body.set("remoteip", remoteIp);
  }

  let response: Response;
  try {
    response = await fetch(SITEVERIFY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch (cause) {
    throw new TurnstileVerificationError(
      "Network error calling Turnstile siteverify.",
      { cause },
    );
  }

  if (!response.ok) {
    throw new TurnstileVerificationError(
      `Turnstile siteverify responded with HTTP ${response.status}.`,
    );
  }

  let result: SiteverifyResponse;
  try {
    result = (await response.json()) as SiteverifyResponse;
  } catch (cause) {
    throw new TurnstileVerificationError(
      "Malformed response from Turnstile siteverify.",
      { cause },
    );
  }

  if (!result.success) {
    const errorCodes = result["error-codes"]?.join(", ") || "unknown reason";
    throw new TurnstileVerificationError(
      `Turnstile rejected the token: ${errorCodes}`,
    );
  }
}
