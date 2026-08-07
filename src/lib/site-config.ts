/**
 * DeVore Studio — Site Configuration
 *
 * STARTER PLACEHOLDER — every value below must be replaced when this
 * template is used to start a real project. Nothing here is real
 * content. See docs/LAUNCH-CHECKLIST.md before going live.
 *
 * Single source of truth for site identity, used by the root metadata
 * (src/app/layout.tsx), sitemap (src/app/sitemap.ts), and robots
 * (src/app/robots.ts) — edit values here rather than in each file.
 */

export const siteConfig = {
  // PLACEHOLDER — replace with the real project/business name.
  name: "DeVore Studio Project Starter",
  // PLACEHOLDER — replace with a real, project-specific description.
  description:
    "Reusable technical foundation for DeVore Studio client projects.",
  // Production URL comes from NEXT_PUBLIC_SITE_URL. localhost is a
  // development fallback ONLY — this must be set to the project's real
  // domain before launch (see docs/LAUNCH-CHECKLIST.md). Used for
  // canonical URLs, Open Graph tags, and the generated sitemap/robots.
  // Must be an absolute URL including the protocol (e.g.
  // https://example.com) — a bare domain will crash the build, since
  // this value is passed to `new URL()` in src/app/layout.tsx.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;
