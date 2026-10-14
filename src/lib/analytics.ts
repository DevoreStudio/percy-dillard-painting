import { track } from "@vercel/analytics";

/**
 * Every custom Vercel Web Analytics event this site sends, in one place,
 * so event names stay consistent across components (and across DeVore
 * Studio sites built from this template) and a typo can't silently
 * create a second, differently named event in the dashboard.
 *
 * Custom events are only available on Vercel Pro and Enterprise plans
 * (see https://vercel.com/docs/analytics/custom-events). Page-view
 * tracking via <Analytics /> in the root layout works on every plan.
 */
export const ANALYTICS_EVENTS = {
  /**
   * An estimate request received `{ ok: true }` from /api/estimate.
   *
   * Counts can include some spam: by design, the API answers
   * submissions caught by its server-side content spam check with the
   * same `{ ok: true }` as a real success (so bots get no signal that
   * they were caught), and nothing is emailed for them. The browser
   * cannot tell the two apart, so those submissions are counted too.
   * Treat this as an approximate conversion trend; the estimate emails
   * Percy actually receives are the authoritative lead count. (The
   * client-side honeypot never sends a request, so it is never counted.)
   */
  estimateSubmitted: "estimate_submitted",
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/**
 * Sends a custom analytics event with no properties.
 *
 * Deliberately takes no data argument: conversion events here only need
 * to be counted, and keeping properties out entirely guarantees no
 * personal information (names, emails, phone numbers, project details,
 * file names) can ever be attached to an event by accident.
 *
 * Analytics must never interfere with the visitor's experience, so any
 * error from the tracking library is swallowed rather than allowed to
 * break the calling flow (e.g. the estimate success state).
 */
export function trackEvent(name: AnalyticsEventName): void {
  try {
    track(name);
  } catch {
    // Intentionally ignored — see above.
  }
}
