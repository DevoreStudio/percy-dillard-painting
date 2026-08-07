import type { Testimonial } from "@/types/content";

/**
 * Quotes/names below are taken verbatim from the approved Figma design,
 * but have NOT been confirmed as real customer feedback — `isVerified`
 * is false for all of them. Treat as illustrative placeholder content
 * only: do not reference these as real reviews in copy, and do not use
 * them in structured data (Review/AggregateRating JSON-LD) while
 * isVerified is false. Flip isVerified to true only once a testimonial
 * is confirmed as real, ideally alongside a source/date.
 */
export const testimonials: Testimonial[] = [
  {
    id: "karen-m",
    quote:
      "Percy repainted our whole downstairs and repaired a ceiling the last guy botched. Showed up when he said he would, cleaned up every single day, and the lines are perfect.",
    authorName: "Karen M.",
    authorLocation: "Waynesboro, VA",
    rating: 5,
    isVerified: false,
  },
  {
    id: "doug-r",
    quote:
      "We got three bids for our exterior. Percy's was the most detailed and he was the only one who walked the whole house with me explaining the prep. Two years later it still looks new.",
    authorName: "Doug R.",
    authorLocation: "Fishersville, VA",
    rating: 5,
    isVerified: false,
  },
  {
    id: "alicia-t",
    quote:
      "Honest, friendly and genuinely detail-oriented. Our kitchen cabinets look like they came from a factory. We've already had him back for the guest bath.",
    authorName: "Alicia T.",
    authorLocation: "Crozet, VA",
    rating: 5,
    isVerified: false,
  },
];
