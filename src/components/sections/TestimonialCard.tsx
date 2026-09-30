import { StarRating } from "@/components/ui/StarRating";
import { icons } from "@/lib/icons";
import type { Testimonial } from "@/types/content";
import { ReadFullReviewModal } from "./ReadFullReviewModal";

/**
 * `excerpt` (when present) is always a verbatim leading substring of
 * `quote` — see lib/content/testimonials.ts. "Read full review" opens
 * the complete quote in a modal dialog (ReadFullReviewModal) rather
 * than expanding in place: an earlier in-card `<details>` version grew
 * the card's own height, which stretched the whole grid row to match
 * and left large gaps under the shorter cards next to it. A modal keeps
 * every card in the row the same height regardless of which review (if
 * any) is currently expanded.
 */
export function TestimonialCard({
  quote,
  excerpt,
  authorName,
  authorLocation,
  sourceLabel,
  date,
  rating,
}: Testimonial) {
  const Quote = icons.quote;
  const attribution = [authorLocation, sourceLabel, date]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-6 rounded-card border border-border bg-surface px-6 py-8 shadow-sm">
      <Quote aria-hidden="true" size={36} className="text-navy" />

      {excerpt ? (
        <div className="flex flex-col gap-2">
          <p className="font-body font-light italic leading-relaxed text-foreground">
            &ldquo;{excerpt}&rdquo;
          </p>
          <ReadFullReviewModal
            quote={quote}
            authorName={authorName}
            authorLocation={authorLocation}
            sourceLabel={sourceLabel}
            date={date}
          />
        </div>
      ) : (
        <p className="font-body font-light italic leading-relaxed text-foreground">
          &ldquo;{quote}&rdquo;
        </p>
      )}

      <div className="flex flex-col gap-2">
        {rating !== null && <StarRating rating={rating} />}
        <p className="font-ui text-sm font-medium text-foreground">
          {authorName}
        </p>
        {attribution && (
          <p className="font-ui text-sm text-text-muted">{attribution}</p>
        )}
      </div>
    </div>
  );
}
