# Accessibility Checklist

Automated linting (`eslint-plugin-jsx-a11y`, run via `npm run lint`)
catches some issues. It does not guarantee WCAG compliance — the manual
checks below are still required. Target WCAG 2.2 AA where practical.

## Semantic HTML & structure

- [ ] Semantic elements used where appropriate (`nav`, `main`, `header`,
      `footer`, `button`, etc.) instead of generic `div`/`span` with
      handlers bolted on
- [ ] One `h1` per page; heading levels are sequential, not skipped
- [ ] Landmarks (`main`, `nav`, etc.) are labeled if there's more than
      one of the same kind on a page

## Keyboard & focus

- [ ] Every interactive element is reachable and operable by keyboard
      alone (Tab, Shift+Tab, Enter, Space, Escape as appropriate)
- [ ] Visible focus indicator on every focusable element — never
      `outline: none` without a replacement
- [ ] Focus order follows visual/reading order
- [ ] No keyboard traps

## Forms

- [ ] Every input has a real, associated `<label>` (not just placeholder
      text)
- [ ] Error messages are programmatically associated with their field
      and announced to assistive technology
- [ ] Required fields are indicated both visually and programmatically

## Images & media

- [ ] Meaningful images have descriptive `alt` text
- [ ] Purely decorative images use `alt=""`
- [ ] Video/audio content has captions or a transcript where applicable

## Color & contrast

- [ ] Text meets WCAG 2.2 AA contrast ratios (4.5:1 normal text, 3:1
      large text)
- [ ] Color is never the only way information is conveyed (e.g. error
      states also use text or icons, not just red)

## Motion

- [ ] Animations respect `prefers-reduced-motion`
- [ ] No content flashes more than 3 times per second

## Responsive / zoom

- [ ] Page remains usable at 200% browser zoom
- [ ] No horizontal scrolling introduced at any standard viewport width
- [ ] Reflow works down to 320px width without loss of content or
      function

## Before sign-off

- [ ] Tested with keyboard only (no mouse)
- [ ] Spot-checked with a screen reader (VoiceOver on Mac is built in)
- [ ] `npm run lint` passes — a useful baseline, not proof of compliance
