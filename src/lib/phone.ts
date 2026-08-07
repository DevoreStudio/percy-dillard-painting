/**
 * US phone auto-formatting for the estimate form's phone field.
 *
 * Kept dependency-free (no input-mask library) per the studio's
 * "avoid unnecessary dependencies" standard — this is a small, well-
 * contained bit of logic, not a generalized masking system.
 */

const MAX_DIGITS = 10;

/** Strips everything but digits and caps at 10 (US phone number length). */
export function toPhoneDigits(rawValue: string): string {
  return rawValue.replace(/\D/g, "").slice(0, MAX_DIGITS);
}

/** Formats up to 10 digits as `###-###-####`, growing as digits are added. */
export function formatPhoneDigits(digits: string): string {
  const area = digits.slice(0, 3);
  const prefix = digits.slice(3, 6);
  const line = digits.slice(6, 10);

  let formatted = area;
  if (prefix) formatted += `-${prefix}`;
  if (line) formatted += `-${line}`;
  return formatted;
}

/** Counts digits in `value` up to (not including) index `caretIndex`. */
export function countDigitsBeforeCaret(
  value: string,
  caretIndex: number,
): number {
  return value.slice(0, caretIndex).replace(/\D/g, "").length;
}

/**
 * Finds the caret index in `formatted` that sits right after the Nth
 * digit (`digitCount`), so the caret stays anchored to the same digit
 * the user was next to before re-formatting — rather than jumping to
 * the end on every keystroke, which is the usual failure mode for
 * naive masked inputs.
 */
export function caretIndexForDigitCount(
  formatted: string,
  digitCount: number,
): number {
  if (digitCount <= 0) return 0;

  let digitsSeen = 0;
  for (let i = 0; i < formatted.length; i += 1) {
    if (/\d/.test(formatted[i])) {
      digitsSeen += 1;
      if (digitsSeen === digitCount) return i + 1;
    }
  }
  return formatted.length;
}
