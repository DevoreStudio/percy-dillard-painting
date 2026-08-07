import type { ContactInfo } from "@/types/content";

/**
 * Confirmed business contact details.
 *
 * `phone` and `email` were both explicitly confirmed by the Design &
 * Build Lead. The Figma file itself was NOT a reliable source for this
 * data — it showed two different phone numbers in different places
 * (both wrong), and an email address that was never confirmed as real.
 * Every remaining field below is deliberately null: since the Figma file
 * already contained fabricated contact info once, none of it is trusted
 * here without explicit confirmation. Update this file directly once
 * real values are supplied — do not reintroduce values from the Figma
 * mockup.
 */
export const contact: ContactInfo = {
  phone: "(434) 882-8589",
  email: "pdillardpainting2000@yahoo.com",
  hours: null,
  address: null,
  licenseNumber: null,
  insuranceDetails: null,
};

/**
 * DEVELOPMENT-ONLY placeholder value for fields still unconfirmed in
 * `contact` above. Exists solely so the approved Figma layout (an email
 * row under the phone number in the estimate form panel) can be
 * visually reviewed before a real value is supplied.
 *
 * NOT real business information and must never be presented as such.
 * Every place that reads this must gate on `isDevPreview`
 * (src/lib/dev-preview.ts) so it disappears automatically from any
 * production build — see FaqEstimateSection.tsx for the pattern.
 */
export const devPlaceholderContact = {
  email: "estimates@dev-placeholder.example",
} as const;
