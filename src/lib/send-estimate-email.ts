import { services } from "@/lib/content/services";
import {
  sanitizeHeaderValue,
  type EstimateFormPayload,
} from "@/lib/estimate-validation";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/**
 * Thin wrapper around Resend's plain HTTP API (fetch), not the `resend`
 * npm package — this is the entire integration surface, and a raw
 * `fetch` call avoids adding a dependency for what's a single POST
 * request. See CLAUDE.md / the studio's "avoid unnecessary
 * dependencies" standard.
 */

export class EstimateEmailConfigError extends Error {}
export class EstimateEmailDeliveryError extends Error {}

function serviceLabel(id: string): string {
  if (id === "other") return "Other";
  return services.find((service) => service.id === id)?.title ?? id;
}

function buildEmailBody(values: EstimateFormPayload): string {
  const submitted = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const photosLine =
    values.photoCount > 0
      ? `Customer selected ${values.photoCount} photo${values.photoCount === 1 ? "" : "s"} in the form, but this website does not yet email photo attachments. Ask them to send photos directly, or plan to view them when you follow up.`
      : "None attached.";

  return [
    "NEW ESTIMATE REQUEST",
    "",
    "Name:",
    values.name,
    "",
    "Phone:",
    values.phone,
    "",
    "Email:",
    values.email,
    "",
    "City / Town:",
    values.city,
    "",
    "Services:",
    values.services.map(serviceLabel).join(", "),
    "",
    "Project Details:",
    values.details,
    "",
    "Project Photos:",
    photosLine,
    "",
    "Submitted:",
    `${submitted} (Eastern Time)`,
  ].join("\n");
}

/**
 * Sends the estimate request email via Resend. Throws
 * `EstimateEmailConfigError` when required server configuration is
 * missing (a deployment/config problem, not something a retry fixes)
 * and `EstimateEmailDeliveryError` when Resend itself rejects or fails
 * the send (a delivery problem, worth telling the visitor to retry).
 * The route handler is responsible for turning either into the right
 * HTTP response and for not leaking the underlying details to the
 * browser.
 */
export async function sendEstimateEmail(
  values: EstimateFormPayload,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.ESTIMATE_FROM_EMAIL;
  const toEmail =
    process.env.ESTIMATE_TO_EMAIL ?? "pdillardpainting2000@yahoo.com";

  if (!apiKey || !fromEmail) {
    throw new EstimateEmailConfigError(
      "RESEND_API_KEY and/or ESTIMATE_FROM_EMAIL is not configured.",
    );
  }

  const subject = sanitizeHeaderValue(
    `New Estimate Request: ${values.name} - ${values.city}`,
  );

  let response: Response;
  try {
    response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Percy Dillard Painting & Drywall <${fromEmail}>`,
        to: [toEmail],
        reply_to: values.email,
        subject,
        text: buildEmailBody(values),
      }),
    });
  } catch (cause) {
    throw new EstimateEmailDeliveryError("Network error calling Resend.", {
      cause,
    });
  }

  if (!response.ok) {
    // Resend's error body may contain account/provider details that
    // shouldn't reach the browser — read it for server-side logging
    // only, never forward it in the API response.
    const errorBody = await response.text().catch(() => "");
    throw new EstimateEmailDeliveryError(
      `Resend responded with ${response.status}: ${errorBody}`,
    );
  }
}
