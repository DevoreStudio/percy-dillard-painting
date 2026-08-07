import type { ContactInfo } from "@/types/content";

/**
 * Confirmed business contact details.
 *
 * `phone` was explicitly confirmed by the Design & Build Lead. The Figma
 * file itself was NOT a reliable source for this data — it showed two
 * different phone numbers in different places (both wrong). Every other
 * field below is deliberately null: the Figma file shows placeholder-
 * looking email/hours text, but since it already contained fabricated
 * contact info once, none of it is trusted here without explicit
 * confirmation. Update this file directly once real values are supplied
 * — do not reintroduce numbers from the Figma mockup.
 */
export const contact: ContactInfo = {
  phone: "(434) 882-8589",
  email: null,
  hours: null,
  address: null,
  licenseNumber: null,
  insuranceDetails: null,
};
