import type { Faq } from "@/types/content";

/**
 * Questions are from the approved Figma design. No answer copy exists
 * in the design for any of them — `answer` stays null until real content
 * is supplied. Do not write answers here, and do not generate FAQPage
 * JSON-LD from this file while any entry is null (see CLAUDE.md /
 * docs/SEO-CHECKLIST.md on fabricated structured data).
 */
export const faqs: Faq[] = [
  { id: "cost", question: "How much does painting cost?", answer: null },
  {
    id: "timeline",
    question: "How long does a typical job take?",
    answer: null,
  },
  { id: "insured", question: "Are you insured?", answer: null },
  { id: "paint", question: "What paint do you use?", answer: null },
  {
    id: "drywall-before-painting",
    question: "Do you handle drywall repair before painting?",
    answer: null,
  },
  {
    id: "protect-home",
    question: "How do you protect my home while you work?",
    answer: null,
  },
];
