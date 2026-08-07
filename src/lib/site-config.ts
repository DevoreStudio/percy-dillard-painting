/**
 * Percy Dillard Painting & Drywall — Site Configuration
 *
 * Single source of truth for site identity, used by the root metadata
 * (src/app/layout.tsx), sitemap (src/app/sitemap.ts), and robots
 * (src/app/robots.ts) — edit values here rather than in each file.
 *
 * `name` and `description` reflect only confirmed facts (business name,
 * trade, general service area from the DeVore Studio project brief) —
 * no invented claims, specialties, or years-of-experience copy. Revisit
 * once Percy/Corey confirm additional SEO-safe copy.
 */

export const siteConfig = {
  name: "Percy Dillard Painting & Drywall",
  description:
    "Interior and exterior painting and drywall services for homes and businesses in Waynesboro, Charlottesville, and Central Virginia.",
  // Production URL comes from NEXT_PUBLIC_SITE_URL. localhost is a
  // development fallback ONLY — this must be set to the project's real
  // domain before launch (see docs/LAUNCH-CHECKLIST.md). Used for
  // canonical URLs, Open Graph tags, and the generated sitemap/robots.
  // Must be an absolute URL including the protocol (e.g.
  // https://example.com) — a bare domain will crash the build, since
  // this value is passed to `new URL()` in src/app/layout.tsx.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;
