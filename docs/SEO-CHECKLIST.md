# SEO Checklist

## Metadata

- [ ] Every page has a unique, accurate title and description
- [ ] Canonical URLs resolve correctly (via `metadataBase` in
      `src/app/layout.tsx`, plus per-page overrides where needed)

## Open Graph

- [ ] Open Graph title/description/type are set
- [ ] A real Open Graph image has been added — the starter ships without
      one (see "Before launch" below)

## Sitemap & robots

- [ ] `/sitemap.xml` (`src/app/sitemap.ts`) lists every real route, not
      just the placeholder homepage
- [ ] `/robots.txt` (`src/app/robots.ts`) reflects the intended crawl
      policy
- [ ] Both resolve to the real production URL, not localhost

## Structured data

- [ ] Any JSON-LD added uses `src/lib/json-ld.ts` and reflects only
      real, accurate project content
- [ ] No fabricated ratings, reviews, addresses, business hours, or FAQs

## Content & crawlability

- [ ] Semantic heading structure (see `docs/ACCESSIBILITY-CHECKLIST.md`)
- [ ] URLs are descriptive, not opaque IDs
- [ ] Images have descriptive `alt` text (helps image search too)

## Performance (affects SEO ranking)

- [ ] Core Web Vitals checked (Lighthouse or similar)
- [ ] `next/image` and `next/font` used where applicable

## Before launch — replace every starter placeholder

This starter ships with clearly-marked placeholder values that are not
real project content. Before any project goes live, replace:

- [ ] Site name (`src/lib/site-config.ts`)
- [ ] Site description (`src/lib/site-config.ts`)
- [ ] Production URL (`NEXT_PUBLIC_SITE_URL`, set in Vercel's
      Environment Variables)
- [ ] Open Graph image, if the project uses one
- [ ] Any project-specific schema/structured data content

See `docs/LAUNCH-CHECKLIST.md` for the full pre-launch list.
