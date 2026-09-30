import { services } from "@/lib/content/services";

/**
 * Server-side validation for the estimate request endpoint
 * (src/app/api/estimate/route.ts). Deliberately re-implemented here
 * rather than shared with the client-side validation in EstimateForm.tsx
 * — the two run in different environments (browser vs. server) and the
 * whole point of server-side validation is that it must not trust
 * anything the client already checked. Keep the two in sync by hand if
 * the field set changes; don't try to import client code into a server
 * route.
 */

export const MAX_NAME_LENGTH = 100;
export const MAX_CITY_LENGTH = 100;
export const MAX_DETAILS_LENGTH = 4000;
export const MAX_PHOTO_COUNT = 6;

/**
 * Photo attachment budget.
 *
 * Vercel's Node.js serverless functions enforce a hard ~4.5MB request
 * body ceiling that cannot be raised through configuration (see
 * https://vercel.com/docs/functions/limitations) — Resend itself allows
 * up to 40MB per email, so the platform, not the email provider, is the
 * binding constraint. Real phone-camera photos routinely run 2-8MB
 * each, so "6 full-resolution photos" and "stays under 4.5MB" are not
 * simultaneously possible without either client-side compression or
 * external storage — neither of which has been introduced here (see the
 * note in estimate-photo-validation.ts). These numbers are the largest
 * budget that reliably leaves headroom for the text fields and
 * multipart overhead under that ceiling; customers with larger photos
 * will need to send fewer, or smaller, files. Shared between the client
 * (FileUploadField/EstimateForm) and the server (route.ts /
 * estimate-photo-validation.ts) so both enforce the same numbers.
 */
export const MAX_PHOTO_FILE_BYTES = 1.5 * 1024 * 1024; // 1.5MB per photo
export const MAX_PHOTO_TOTAL_BYTES = 4 * 1024 * 1024; // 4MB combined
export const ALLOWED_PHOTO_MIME_TYPES = ["image/jpeg", "image/png"] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Deliberately permissive: accepts anything from a 7-digit local number
// to a 15-digit number with a country code (E.164's max length), so
// this doesn't reject real customers over formatting choices the
// client-side phone formatter (lib/phone.ts) doesn't even enforce for
// non-US numbers. "Plausible", not "strictly US-shaped".
const MIN_PHONE_DIGITS = 7;
const MAX_PHONE_DIGITS = 15;

const KNOWN_SERVICE_IDS = new Set<string>([
  ...services.map((service) => service.id),
  // Matches the "Other" option EstimateForm.tsx adds on top of the real
  // service list — a legitimate selection, not something to reject.
  "other",
]);

export type EstimateFormPayload = {
  name: string;
  phone: string;
  email: string;
  city: string;
  services: string[];
  details: string;
};

export type EstimateFieldErrors = Partial<
  Record<
    "name" | "phone" | "email" | "city" | "services" | "details" | "photos",
    string
  >
>;

export type EstimateValidationResult =
  | { ok: true; values: EstimateFormPayload }
  | { ok: false; errors: EstimateFieldErrors };

/** Strips CR/LF and other control characters — used for any field that
 * ends up inside an email header (Subject, Reply-To) rather than the
 * message body, so a value like "Bob\r\nBcc: attacker@evil.com" can't
 * inject extra headers into the outgoing email. */
export function sanitizeHeaderValue(value: string): string {
  // Intentionally matches control characters (CR/LF and friends) to
  // strip them, so a value can't inject extra lines into an email
  // header such as Subject.
  return value.replace(/[\x00-\x1f\x7f]/g, " ").trim();
}

function readTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Validates a raw, untyped request body (anything from `JSON.parse` on
 * an actual POST body — never assume the shape matches what the client
 * UI would have sent, since this endpoint has to be safe against a
 * request that didn't come from our form at all).
 */
export function validateEstimateRequest(
  body: Record<string, unknown>,
): EstimateValidationResult {
  const errors: EstimateFieldErrors = {};

  const name = readTrimmedString(body.name);
  const phoneRaw = readTrimmedString(body.phone);
  const email = readTrimmedString(body.email);
  const city = readTrimmedString(body.city);
  const details = readTrimmedString(body.details);
  const rawServices = Array.isArray(body.services) ? body.services : [];
  const selectedServices = rawServices.filter(
    (value): value is string =>
      typeof value === "string" && KNOWN_SERVICE_IDS.has(value),
  );

  if (!name) {
    errors.name = "Enter your name.";
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.name = `Name must be ${MAX_NAME_LENGTH} characters or fewer.`;
  }

  const phoneDigits = phoneRaw.replace(/\D/g, "");
  if (!phoneDigits) {
    errors.phone = "Enter a phone number.";
  } else if (
    phoneDigits.length < MIN_PHONE_DIGITS ||
    phoneDigits.length > MAX_PHONE_DIGITS
  ) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!email) {
    errors.email = "Enter your email.";
  } else if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!city) {
    errors.city = "Enter your city or town.";
  } else if (city.length > MAX_CITY_LENGTH) {
    errors.city = `City must be ${MAX_CITY_LENGTH} characters or fewer.`;
  }

  if (selectedServices.length === 0) {
    errors.services = "Select at least one service.";
  }

  if (!details) {
    errors.details = "Tell us a bit about the project.";
  } else if (details.length > MAX_DETAILS_LENGTH) {
    errors.details = `Project details must be ${MAX_DETAILS_LENGTH} characters or fewer.`;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    values: {
      name,
      phone: phoneRaw,
      email,
      city,
      services: selectedServices,
      details,
    },
  };
}
