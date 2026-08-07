/**
 * Typed helper for safely embedding JSON-LD structured data.
 *
 * This file intentionally contains no schema content of its own — no
 * business info, ratings, reviews, or FAQs. Add real schema.org objects
 * (LocalBusiness, FAQPage, etc.) only when a project's actual content
 * supports them. Never fabricate structured data. See
 * docs/SEO-CHECKLIST.md.
 *
 * Usage:
 *   import { jsonLdScriptProps, type JsonLd } from "@/lib/json-ld";
 *
 *   const data: JsonLd = {
 *     "@context": "https://schema.org",
 *     "@type": "Organization",
 *     name: siteConfig.name,
 *     url: siteConfig.url,
 *   };
 *
 *   <script {...jsonLdScriptProps(data)} />
 */

export type JsonLd = {
  "@context": "https://schema.org";
  "@type": string;
  [key: string]: unknown;
};

/**
 * Returns props for a <script type="application/ld+json"> tag, with the
 * JSON safely escaped so a value can't break out of the script tag
 * (e.g. a string containing "</script>").
 */
export function jsonLdScriptProps(data: JsonLd) {
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(data).replace(/</g, "\\u003c"),
    },
  } as const;
}
