import type { Faq } from "@/types/content";

/**
 * FAQ content. Most answers were supplied directly by Corey as real,
 * approved project content (QA Pass 1). The paint-brand answer was
 * revised during the Pre-Launch content pass because the original copy
 * named specific brands as settled fact without a confirmed source, and
 * now uses general, honest language instead. The insurance answer was
 * similarly softened during that pass, then restored to a direct
 * confirmation once Corey confirmed Percy is insured (see
 * lib/content/features.ts for the matching feature-card update).
 *
 * "How long does a typical job take?" was removed entirely per QA Pass 1
 * rather than left with a null answer.
 *
 * FAQPage JSON-LD is still deliberately not implemented — that's part of
 * the SEO/content milestone, not this one.
 */
export const faqs: Faq[] = [
  {
    id: "cost",
    question: "How much does painting cost?",
    answer:
      "Every home is different, so we price by the actual work in front of us: square footage, surface condition, prep needed and paint selection. Estimates are always free, written and itemized so you can see exactly what you're paying for.",
  },
  {
    id: "insured",
    question: "Are you insured?",
    answer:
      "Yes. Percy Dillard Painting & Drywall is insured, and we're happy to provide proof of insurance before we start your project.",
  },
  {
    id: "paint",
    question: "What paint do you use?",
    answer:
      "We use professional-quality paints and coatings selected for the surface, project, and desired finish. If you have a preferred brand or product, let us know when requesting your estimate.",
  },
  {
    id: "drywall-before-painting",
    question: "Do you handle drywall repair before painting?",
    answer:
      "We do: nail pops, cracks, water damage, popcorn ceiling removal and full drywall replacement. It's all done in-house, so there's one crew and one point of contact.",
  },
  {
    id: "protect-home",
    question: "How do you protect my home while you work?",
    answer:
      "We cover floors, mask furniture, and use plastic sheeting where needed to keep dust to a minimum. Crews clean up at the end of each day, including vacuuming, so you're not living in a construction zone longer than necessary.",
  },
];
