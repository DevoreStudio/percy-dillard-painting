/**
 * Lightweight, conservative content-based spam heuristics for the
 * estimate request endpoint (src/app/api/estimate/route.ts). Runs AFTER
 * shape validation (estimate-validation.ts) succeeds — this module
 * never rejects something for being malformed, only for looking like
 * unsolicited marketing/automated spam content.
 *
 * Principle (re-affirmed after the production QA audit found two rules
 * that could silently drop real inquiries): prefer false negatives over
 * false positives. A missed spam message is a minor annoyance; a
 * silently dropped real customer inquiry is a lost lead the business
 * never finds out about, since high-confidence matches here return the
 * same generic success response as a real send (see route.ts). When in
 * doubt, a rule should be narrowed or removed, not kept "just in case."
 *
 * Pure and synchronous: no I/O, no network calls, safe to run on every
 * submission with negligible cost (this is what makes it safe to place
 * after the more expensive Turnstile check but before photo
 * processing).
 */

export type SpamCheckResult = { spam: true; reason: string } | { spam: false };

const URL_PATTERN = /https?:\/\/|www\.[a-z0-9-]+\.[a-z]{2,}/gi;

// More than this many links across name + city + details combined is
// treated as spam. Raised from the original 2 to 3 (i.e. reject only at
// 4+) after the QA audit — a detailed renovation inquiry can
// legitimately reference several inspiration links (Pinterest, Houzz,
// Instagram), so the bar is intentionally a little higher than "more
// than a couple."
const MAX_TOTAL_URLS = 3;

// Phrases that are near-exclusively used in unsolicited marketing/SEO
// solicitations and automated spam, never in a genuine painting
// estimate request. Kept short and specific on purpose — broader or
// fuzzier matches risk false-positiving real homeowners.
//
// Removed after the QA audit: "web design service", "website design
// service", "digital marketing service", "social media marketing
// service" — these describe common, entirely legitimate occupations a
// real homeowner might mention about themselves (e.g. "I run a web
// design service from my home office and want it repainted"), and a
// false match here silently drops a real inquiry while telling the
// customer it succeeded. Every phrase remaining below was re-reviewed
// against that same bar and judged to have no plausible legitimate
// collision in a painting/drywall estimate context.
const SPAM_PHRASES = [
  "seo service",
  "seo services",
  "search engine optimization",
  "increase your website traffic",
  "increase website traffic",
  "backlink",
  "guest post",
  "link building",
  "boost your rankings",
  "improve your google ranking",
  "unsubscribe from this list",
  "click here to unsubscribe",
  "crypto investment",
  "cryptocurrency investment",
  "forex trading",
  "bitcoin investment",
  "weight loss supplement",
  "male enhancement",
  "canadian pharmacy",
  "cheap viagra",
  "online casino",
  "work from home opportunity",
  "make money online",
];

function countUrls(text: string): number {
  return text.match(URL_PATTERN)?.length ?? 0;
}

// Repeated-filler detection, made more conservative after the QA audit:
// the original 8-character/5-repetition thresholds were reachable by
// genuine enthusiastic writing (e.g. "so excited " repeated five times
// is 55 characters and would have matched). Requiring a much longer
// repeated unit AND more repetitions pushes this far out of range of
// anything a real person would plausibly type, while still catching
// the kind of long literal filler bots produce.
const REPEATED_FILLER_UNIT_MIN_LENGTH = 20;
const REPEATED_FILLER_MIN_REPEATS = 6;

/**
 * Flags a run of REPEATED_FILLER_UNIT_MIN_LENGTH+ characters repeated
 * back-to-back REPEATED_FILLER_MIN_REPEATS+ times — a strong bot-filler
 * signal requiring well over a hundred characters of exact literal
 * repetition, deliberately far beyond anything a real person typing
 * enthusiastically or making a typo would produce.
 */
function hasRepeatedFiller(text: string): boolean {
  const pattern = new RegExp(
    `(.{${REPEATED_FILLER_UNIT_MIN_LENGTH},}?)\\1{${REPEATED_FILLER_MIN_REPEATS - 1},}`,
  );
  return pattern.test(text);
}

/**
 * Evaluates already-shape-validated estimate fields for high-confidence
 * spam content. Returns the first matching reason (for server-side
 * logging only — never shown to the submitter, see route.ts) rather
 * than all matches, since one is enough to act on.
 *
 * Removed after the QA audit: a "low space ratio" rule that flagged
 * long text with few spaces as likely spam filler. It had no safeguard
 * for languages that don't delimit words with spaces (Chinese,
 * Japanese, Thai, and others), so a legitimate non-English-speaking
 * customer's message could have been silently dropped. Nothing
 * replaces it — see the module docblock on preferring false negatives.
 */
export function checkForSpam(values: {
  name: string;
  city: string;
  details: string;
}): SpamCheckResult {
  const combined =
    `${values.name} ${values.city} ${values.details}`.toLowerCase();

  if (countUrls(combined) > MAX_TOTAL_URLS) {
    return { spam: true, reason: "too many links" };
  }

  if (countUrls(values.name) > 0) {
    return { spam: true, reason: "link in name field" };
  }

  if (countUrls(values.city) > 0) {
    return { spam: true, reason: "link in city field" };
  }

  for (const phrase of SPAM_PHRASES) {
    if (combined.includes(phrase)) {
      return { spam: true, reason: `matched spam phrase "${phrase}"` };
    }
  }

  if (hasRepeatedFiller(values.details)) {
    return { spam: true, reason: "repeated filler text in details" };
  }

  return { spam: false };
}
