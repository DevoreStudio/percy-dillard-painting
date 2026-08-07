/**
 * Minimal classnames helper — joins truthy class values with a space.
 *
 * Deliberately not clsx/tailwind-merge: the project doesn't need
 * conflict-resolving class merging yet, and CLAUDE.md asks us to avoid
 * adding a dependency unless the existing stack genuinely can't solve
 * the problem. Revisit if components start needing to override
 * conflicting Tailwind classes from a parent.
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
