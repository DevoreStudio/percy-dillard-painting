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
 * Best-effort read of Cloudflare's siteverify response body, used for
 * BOTH the 2xx and non-2xx paths below. Cloudflare returns a JSON body
 * with an `error-codes` array in both cases (e.g. `bad-request`,
 * `invalid-input-secret`) — that array is the one piece of evidence
 * that actually explains a rejection, and is safe to log (see the
 * module docblock). This never throws: a malformed or non-JSON body
 * (e.g. an HTML error page from an intermediary proxy) degrades to
 * `null` rather than masking the original HTTP status with a parse
 * error.
 */
async function readSiteverifyBody(
  response: Response,
): Promise<SiteverifyResponse | null> {
  const text = await response.text().catch(() => null);
  if (!text) return null;
  try {
    return JSON.parse(text) as SiteverifyResponse;
  } catch {
    return null;
  }
}

/**
 * Formats the subset of a siteverify body that's safe to put in server
 * logs: only Cloudflare's own short, fixed `error-codes` enum values
 * (e.g. "invalid-input-secret", "bad-request", "timeout-or-duplicate").
 * Never includes the secret, the token, or any other request/response
 * field.
 */
function describeErrorCodes(body: SiteverifyResponse | null): string {
  if (
    !body ||
    !Array.isArray(body["error-codes"]) ||
    body["error-codes"].length === 0
  ) {
    return "none provided";
  }
  return body["error-codes"].join(", ");
}

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
    // A non-2xx status (seen in practice as an HTTP 400) means
    // Cloudflare rejected the request itself, not just the token —
    // but Cloudflare still typically returns a JSON body with
    // `error-codes` explaining why (e.g. "invalid-input-secret",
    // "bad-request"). Reading it here, instead of discarding it, is
    // the one piece of evidence that explains a 400 rather than
    // leaving only the bare status code in the logs. Never includes
    // the secret or token (see describeErrorCodes/the module docblock)
    // — only Cloudflare's own short, fixed error-code strings.
    const errorBody = await readSiteverifyBody(response);
    console.error(
      `[verify-turnstile] siteverify HTTP ${response.status}; error-codes: ${describeErrorCodes(errorBody)}`,
    );
    throw new TurnstileVerificationError(
      `Turnstile siteverify responded with HTTP ${response.status}.`,
    );
  }

  const result = await readSiteverifyBody(response);

  if (!result) {
    // A 2xx status with a body that isn't valid JSON (or couldn't be
    // read at all) is itself unexpected/malformed — fail closed rather
    // than treating an unreadable body as success.
    console.error(
      "[verify-turnstile] siteverify returned a 2xx status with a malformed or unreadable body.",
    );
    throw new TurnstileVerificationError(
      "Malformed response from Turnstile siteverify.",
    );
  }

  if (!result.success) {
    const errorCodes = describeErrorCodes(result);
    console.error(
      `[verify-turnstile] token rejected; error-codes: ${errorCodes}`,
    );
    throw new TurnstileVerificationError(
      `Turnstile rejected the token: ${errorCodes}`,
    );
  }
}
