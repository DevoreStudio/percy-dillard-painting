import type { Testimonial } from "@/types/content";

/**
 * Real customer reviews, supplied directly by Corey from Angi and
 * Nextdoor screenshots. Quotes are verbatim from the source (only minor
 * HTML-encoding/typo cleanup, e.g. "Drywll" -> "Drywall" in the business
 * name D.M. typed) — see CLAUDE.md and the Pre-Launch content rules on
 * never rewriting a customer's statement and presenting it as a direct
 * quote.
 *
 * D.M.'s Nextdoor recommendation did not come with a star rating in the
 * supplied screenshot, so `rating` is intentionally `null` for that
 * entry — do not default it to 5 just because the other two are 5.
 */
export const testimonials: Testimonial[] = [
  {
    id: "lisa-e",
    quote:
      "Percy brings professionalism, expert craftsmanship, and passion to the work he does. His attention to detail is exquisite and he's a joy to be around. If you want to find someone who will transform your house into a beautiful home, Percy is your man.",
    authorName: "Lisa E.",
    authorLocation: null,
    source: "Angi",
    sourceLabel: "Verified Angi Review",
    date: "May 2022",
    rating: 5,
    isVerified: true,
  },
  {
    id: "paul-v",
    quote:
      "He always does a good job for us! He does it efficiently, on time, reasonable price, and the work is excellent!",
    authorName: "Paul V.",
    authorLocation: null,
    source: "Angi",
    sourceLabel: "Verified Angi Review",
    date: "December 2021",
    rating: 5,
    isVerified: true,
  },
  {
    id: "d-m",
    quote:
      "Percy J Dillard Paint & Drywall. Percy just completed a drywall and painting project for us and the overall experience and level of workmanship exceeded our expectations. Percy is professional, friendly, experienced and knowledgeable. He was recommended by a good friend and did not disappoint. We were so impressed by the care he took to minimize dust and by the time he took to cover everything with plastic and drop cloths. At the end of each day he vacuumed and cleaned up. The quality of his drywall work and painting is just awesome. Percy is easy to talk to and takes pride in his work. I highly recommend Percy J. Dillard Painting & Drywall.",
    excerpt:
      "Percy just completed a drywall and painting project for us and the overall experience and level of workmanship exceeded our expectations. Percy is professional, friendly, experienced and knowledgeable.",
    authorName: "D.M.",
    authorLocation: "Charlottesville, VA",
    source: "Nextdoor",
    sourceLabel: "Nextdoor Recommendation",
    date: "September 2021",
    // No star rating shown on the supplied Nextdoor screenshot for this
    // recommendation — do not display one.
    rating: null,
    isVerified: true,
  },
];
