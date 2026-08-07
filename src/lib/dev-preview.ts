/**
 * True outside production builds (local dev, `next dev`). False for
 * `next build` / `next start`, which Next.js always runs with
 * NODE_ENV=production.
 *
 * Used to gate content that must never silently ship as real production
 * content: unverified testimonials, placeholder project photos, and FAQ
 * dev-only placeholder answers. Content gated by this flag is visible
 * during local development so the visual design can be reviewed, but
 * disappears automatically from any production build — see
 * src/components/sections/{TestimonialsSection,FeaturedProjectsSection,FaqItem}.tsx.
 */
export const isDevPreview = process.env.NODE_ENV !== "production";
