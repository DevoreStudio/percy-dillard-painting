# QA Checklist

Run before considering any feature or page complete.

## Automated checks

- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run format:check` passes
- [ ] `npm run build` completes with no errors

## Responsive behavior

- [ ] Tested at mobile, tablet, laptop, and desktop widths
- [ ] No horizontal overflow at any width
- [ ] Touch targets are large enough on mobile

## Accessibility

- [ ] See `docs/ACCESSIBILITY-CHECKLIST.md`

## Forms

- [ ] All fields validate correctly, with clear error messaging
- [ ] Successful submission is confirmed to the user
- [ ] Submission actually reaches its destination (email, database, etc.)

## Links & navigation

- [ ] No dead or placeholder links (`href="#"`) left in shipped content
- [ ] External links use `rel="noopener noreferrer"` with
      `target="_blank"`

## Images

- [ ] All images use `next/image` where practical
- [ ] Images are appropriately sized and compressed
- [ ] No missing or broken images

## Metadata

- [ ] Every page has an accurate title and description
- [ ] No leftover starter placeholder content in metadata (see
      `docs/SEO-CHECKLIST.md`)

## Runtime

- [ ] No errors or warnings in the browser console
- [ ] No errors in server/build logs
