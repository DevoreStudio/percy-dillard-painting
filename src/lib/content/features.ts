import type { Feature } from "@/types/content";

/**
 * "Why People Choose Percy" trust grid.
 *
 * The "insured" card originally led with "Full liability coverage" as a
 * settled fact, without a confirmed source. That specific coverage-type
 * claim was removed during the Pre-Launch content pass. Corey has since
 * confirmed Percy is insured, so the card again states that plainly, but
 * still avoids naming a coverage type ("full liability") or dollar
 * amount that hasn't been separately confirmed. See lib/content/faqs.ts
 * for the matching "Are you insured?" answer.
 */
export const features: Feature[] = [
  {
    id: "prep",
    icon: "ruler",
    title: "Prep is most of the work",
    description:
      "Washing, scraping, sanding, caulking and priming. That's what makes a finish last a decade.",
  },
  {
    id: "you-deal-with-percy",
    icon: "handshake",
    title: "You deal with Percy",
    description:
      "The person who quotes your job is on site running it. No rotating crews.",
  },
  {
    id: "on-time",
    icon: "calendarCheck",
    title: "We show up on time",
    description:
      "Start dates we actually keep, and a straight answer when weather changes the schedule.",
  },
  {
    id: "honest-pricing",
    icon: "banknote",
    title: "Honest, itemized pricing",
    description:
      "A written estimate that spells out surfaces, coats and materials. The number doesn't move.",
  },
  {
    id: "daily-cleanup",
    icon: "sparkles",
    title: "Daily cleanup",
    description:
      "Tools packed, trash out, walkways clear. You keep living in your house while we work.",
  },
  {
    id: "insured",
    icon: "shieldCheck",
    title: "Insured and careful",
    description:
      "We're insured, and we protect your property: floors covered, furniture masked, dust kept to a minimum with plastic sheeting where it's needed.",
  },
];
