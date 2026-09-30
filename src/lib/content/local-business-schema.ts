import { contact } from "@/lib/content/contact";
import { serviceAreas } from "@/lib/content/service-areas";
import type { JsonLd } from "@/lib/json-ld";
import { siteConfig } from "@/lib/site-config";

/**
 * Minimal LocalBusiness structured data, built only from confirmed
 * business facts already used elsewhere on the site (contact.ts,
 * service-areas.ts, site-config.ts) — nothing here is authored
 * separately, so this can't drift into claiming something the rest of
 * the site doesn't.
 *
 * Deliberately omits: postal address (never confirmed — see
 * contact.ts), aggregateRating / review (schema.org expects a
 * structured rating count and value; the real testimonials shown on the
 * page are not that, and fabricating one is explicitly against the
 * project's content rules), priceRange, and openingHours (none
 * confirmed). Do not add any of these without first confirming the
 * underlying fact with Percy — see the production-readiness report's
 * "claims requiring confirmation" list.
 */
export function getLocalBusinessSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    ...(contact.phone && { telephone: contact.phone }),
    ...(contact.email && { email: contact.email }),
    areaServed: serviceAreas.map((area) => ({
      "@type": "City",
      name: area.name,
    })),
  };
}
