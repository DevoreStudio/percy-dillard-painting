# DeVore Studio Project Starter

Reusable technical foundation for DeVore Studio client projects. This is
a technical starter, not a themed website template — every project built
from this repo gets its visual design from an approved Figma file, not
from styling baked into this template.

## Tech Stack

- **Next.js** (App Router) — React framework
- **React** + **TypeScript**
- **Tailwind CSS** — styling
- **ESLint** + **Prettier** — linting and formatting
- **Lucide React** — icon library

Optional, added per-project once needed:

- **shadcn/ui** — component primitives. Not pre-installed here; its CLI
  requires choosing a visual preset that would conflict with staying
  neutral in this starter. See `CLAUDE.md` for setup guidance (use the
  `vega` preset, add only what's needed, match Figma via token
  overrides rather than fighting the preset's markup).
- **Supabase** — database/auth, when a project needs one
- **Resend** — transactional email, when a project needs it

Hosting: **Vercel**. Source control: **GitHub** (`DevoreStudio` org).

## Directory Structure

```
src/
  app/            Routes (App Router)
  lib/            Shared utilities (site-config, json-ld, etc.)
  components/     Not created yet — add as a project needs it:
    ui/             Reusable primitives (e.g. shadcn-based)
    layout/         Structural, site-wide components
    sections/       Reusable or project-specific page sections
  types/          Not created yet — add shared TypeScript types here
                  once a project needs them
public/           Static assets
docs/             Reusable checklists (accessibility, QA, SEO, launch)
CLAUDE.md         Engineering contract for AI-assisted implementation
AGENTS.md         Next.js framework notes (auto-maintained by Next.js)
```

`components/` and `types/` are conventions, not existing folders — this
starter avoids placeholder directories with nothing in them. See
`CLAUDE.md` for the reasoning.

## Local Setup

```bash
git clone <repo-url>
cd <repo-name>
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `.env.local` is
gitignored — never commit it.

## Development Commands

| Command                | What it does                          |
| ---------------------- | ------------------------------------- |
| `npm run dev`          | Start the local dev server            |
| `npm run build`        | Production build                      |
| `npm run start`        | Run the production build locally      |
| `npm run lint`         | ESLint (includes accessibility rules) |
| `npm run typecheck`    | TypeScript check, no output emitted   |
| `npm run format:check` | Verify Prettier formatting            |
| `npm run format:write` | Apply Prettier formatting             |

> **Note:** `npm run typecheck` relies on types Next.js generates on
> first run. On a brand-new clone, run `npm run dev` or `npm run build`
> at least once before `typecheck` — otherwise it may fail looking for
> `.next/types`.

## Environment Variables

See `.env.example` for the full list. `NEXT_PUBLIC_SITE_URL` is required
before launch — it falls back to `localhost:3000` in development, but
must be set to the real production domain in Vercel before going live
(see `docs/LAUNCH-CHECKLIST.md`). Supabase and Resend variables are
optional and commented out by default; uncomment only if a project
actually uses that integration.

## Creating a New Client Project From This Template

1. On GitHub, use **"Use this template"** on
   `DevoreStudio/devore-project-template` to create a new repository.
2. Clone the new repo and run through Local Setup above.
3. Replace the placeholders in `src/lib/site-config.ts` — the site name
   and description there are starter defaults, not real content.
4. Set `NEXT_PUBLIC_SITE_URL` for the new project.
5. `CLAUDE.md` and `AGENTS.md` come with the template automatically —
   no extra setup needed.
6. As the project develops, work through `docs/QA-CHECKLIST.md`,
   `docs/ACCESSIBILITY-CHECKLIST.md`, and `docs/SEO-CHECKLIST.md`, and
   `docs/LAUNCH-CHECKLIST.md` before going live.

## Figma + Claude Workflow

Figma is the visual source of truth for every DeVore Studio project. The
intended workflow:

1. Design is created and approved in Figma first.
2. Implementation (by Claude or a human) translates the approved design
   into maintainable, reusable components — not brittle one-off markup
   that merely looks right.
3. Visual patterns are never invented when an approved design exists.
4. If following the design exactly would create a real accessibility,
   usability, or responsive problem, that gets flagged rather than
   silently changed.

This is enforced in detail in `CLAUDE.md` — that file is the working
engineering contract; this README is the human-readable summary.

## Deployment Workflow

Projects deploy to **Vercel**, connected to their GitHub repository.
Environment variables must be set in Vercel's dashboard — `.env.local`
never leaves your machine. Pushes to non-production branches get
preview deployments; promote to production only after completing
`docs/LAUNCH-CHECKLIST.md`.

This starter repository itself is never deployed — it's a foundation,
not a live site.

## Where Project-Specific Documentation Belongs

The `docs/` checklists in this starter are generic and reusable — they
apply to any DeVore Studio project. Project-specific material (client
notes, content plans, one-off decisions) belongs in that project's own
repository, not merged back into this template.

## Maintaining the Starter

Changes here affect every future DeVore Studio project. Before changing
anything in this repo, confirm it:

- stays reusable across future projects, not specific to one client
- introduces no project-specific client content
- preserves Figma as the visual source of truth
- doesn't add a dependency unless it solves a problem the existing
  stack genuinely can't
- passes lint, typecheck, format check, and a production build before
  being pushed
- is reflected in `CLAUDE.md` or the relevant `docs/` checklist if it
  changes a studio-wide engineering standard

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
