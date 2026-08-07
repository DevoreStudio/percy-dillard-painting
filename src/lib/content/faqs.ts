import type { Faq } from "@/types/content";

/**
 * Approved FAQ content (QA Pass 1, Design QA review). Answers below were
 * supplied directly by Corey as real, approved project content — not
 * generated or inferred — so they're safe to render in production.
 *
 * "How long does a typical job take?" was removed entirely per that
 * review rather than left with a null answer.
 *
 * FAQPage JSON-LD is still deliberately not implemented — that's part of
 * the SEO/content milestone, not this one.
 */
export const faqs: Faq[] = [
  {
    id: "cost",
    question: "How much does painting cost?",
    answer:
      "Every home is different, so we price by the actual work in front of us — square footage, surface condition, prep needed and paint selection. Estimates are always free, written and itemized so you can see exactly what you're paying for.",
  },
  {
    id: "insured",
    question: "Are you insured?",
    answer:
      "Yes. Percy Dillard Painting & Drywall carries full liability insurance, and we're happy to send proof before we start.",
  },
  {
    id: "paint",
    question: "What paint do you use?",
    answer:
      "We use professional-grade Sherwin-Williams and Benjamin Moore products, matched to the surface and the room. If you have a preferred brand or finish, we'll work with it.",
  },
  {
    id: "drywall-before-painting",
    question: "Do you handle drywall repair before painting?",
    answer:
      "We do — nail pops, cracks, water damage, popcorn ceiling removal and full drywall replacement. It's all done in-house, so there's one crew and one point of contact.",
  },
  {
    id: "protect-home",
    question: "How do you protect my home while you work?",
    answer:
      "Floors get covered, furniture gets moved and masked, and every crew member cleans up at the end of each day. You should barely know we were there — until you see the walls.",
  },
];
