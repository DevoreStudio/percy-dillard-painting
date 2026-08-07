# DeVore Studio — Repository Implementation Contract

This repository was created from the DeVore Studio starter template. This
file is the working engineering contract for any AI assistant (or human)
implementing work here. It applies to every project created from this
template, not just this repo.

For Next.js framework/version-specific agent notes (auto-maintained by
Next.js tooling), see: @AGENTS.md

## Project Philosophy

- This is a DeVore Studio project.
- Figma is the visual source of truth. If an approved Figma design exists,
  implement it — do not invent visual patterns.
- Translate designs into maintainable production components, not brittle
  one-off markup that merely looks right.

## Architecture

- Next.js App Router, TypeScript, `src/` structure.
- Server Components by default. Use Client Components only when
  interactivity genuinely requires them (state, effects, browser APIs,
  event handlers).
- Build reusable components where reuse is genuine — not speculative.
- Avoid premature abstraction. Duplication is often cheaper than the wrong
  abstraction.

## Components

- `components/ui` — reusable primitives. shadcn/ui is an approved,
  optional tool for scaffolding these. It is not pre-installed in this
  starter — its CLI requires choosing a visual preset that rewrites
  component code, which would conflict with staying visually neutral
  here. Initialize it per-project once the approved Figma design and
  component needs are known: use the `vega` preset (closest to a neutral
  baseline), add only the primitives actually needed, and match the
  Figma design via CSS variable token overrides rather than fighting the
  preset's markup.
- `components/layout` — structural, site-wide components.
- `components/sections` — reusable or project-specific page sections.
- Avoid giant monolithic page files; compose from smaller pieces.
- Do not create abstractions solely to reduce line count.

## Styling

- Tailwind CSS.
- Implementation follows Figma exactly: spacing, typography, hierarchy,
  and responsive behavior are intentional — preserve them.
- No arbitrary visual changes that aren't supported by the design.
- No additional styling framework without explicit justification.

## Responsive Design

- Support mobile through desktop; no desktop-only assumptions.
- Prevent horizontal overflow at all viewport widths.
- Test breakpoints based on where the content/design actually breaks, not
  by blindly targeting specific devices.

## Accessibility

- Target WCAG 2.2 AA where practical.
- Semantic HTML, logical heading hierarchy, keyboard accessibility,
  visible focus states, accessible forms, meaningful alt text, sufficient
  color contrast, reduced-motion consideration, zoom/reflow support.
- Automated linting (jsx-a11y) catches some issues — it does not
  guarantee compliance. Manual QA is still required.
- See `docs/ACCESSIBILITY-CHECKLIST.md` for the full manual QA checklist.

## SEO

- Use the Next.js Metadata API for titles, descriptions, canonical URLs,
  and Open Graph data.
- Semantic page structure and crawlability.
- Add structured data (JSON-LD) only when real project content supports
  it. Never fabricate ratings, reviews, addresses, business details, FAQs,
  or other schema content.
- See `docs/SEO-CHECKLIST.md` for the full checklist, including pre-launch
  placeholder replacement.

## Performance

- Server Components by default; minimize client-side JavaScript.
- Use `next/image` and `next/font` where appropriate.
- Optimize for Core Web Vitals.
- Avoid unnecessary third-party dependencies and animation libraries.

## Security

- Never commit secrets to source control.
- Use environment variables appropriately; never expose server secrets
  through `NEXT_PUBLIC_` variables.
- Validate and sanitize user-controlled data.
- Treat forms and external integrations as security boundaries.

## Git

- Write meaningful commit messages.
- Keep commits scoped to understandable milestones.
- Do not push or deploy unless explicitly instructed.
- Do not rewrite shared Git history without explicit approval.
- Do not commit secrets or generated build output.

## QA

Before considering implementation complete, verify as applicable:

- lint, TypeScript, production build
- responsive behavior
- accessibility
- forms
- links
- images
- metadata
- console/runtime errors

See `docs/QA-CHECKLIST.md` for the full checklist, and
`docs/LAUNCH-CHECKLIST.md` before any project goes live.

## Communication

The person you're working with is the Design & Build Lead — a product and
design expert, not a traditional software engineer. When a technical
decision requires their input:

- explain the practical tradeoff in plain language
- recommend an option and explain why
- avoid unnecessary jargon
- never make consequential architecture decisions silently

## Definition of Done

Code existing is not enough. Work is complete only when:

- it matches the approved design/product requirements
- it is responsive
- accessibility has been considered
- lint, TypeScript, and build checks pass
- there are no known critical runtime errors
- project-specific documentation is updated when needed
