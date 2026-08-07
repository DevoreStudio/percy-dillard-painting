# Launch Checklist

## Replace every starter placeholder

This starter ships with clearly-marked placeholder values that are not
real project content. Before any project goes live, replace:

- [ ] Site name (`src/lib/site-config.ts`)
- [ ] Site description (`src/lib/site-config.ts`)
- [ ] `NEXT_PUBLIC_SITE_URL` set to the real production domain — in
      Vercel's Environment Variables, not just `.env.local`. Must be an
      absolute URL including `https://` (e.g. `https://example.com`) —
      a bare domain will crash the build
- [ ] Open Graph image added, if applicable
- [ ] Any project-specific schema/structured data content
      (`src/lib/json-ld.ts` usage)

## Environment & deployment

- [ ] All required environment variables are set in Vercel
- [ ] Production build completes cleanly (`npm run build`)
- [ ] Custom domain connected and SSL active
- [ ] No staging/test/placeholder content remains

## Final QA pass

- [ ] `docs/QA-CHECKLIST.md` complete
- [ ] `docs/ACCESSIBILITY-CHECKLIST.md` complete
- [ ] `docs/SEO-CHECKLIST.md` complete

## Forms & integrations

- [ ] Forms tested end-to-end in production (not just locally)
- [ ] Email delivery (or other destination) confirmed working
- [ ] Any optional integrations (Supabase, Resend, etc.) verified with
      real production credentials, not test/dev keys

## Post-launch

- [ ] Sitemap accessible at the real domain
- [ ] Spot-check the live site on mobile and desktop
- [ ] Confirm no console/runtime errors on the live site
