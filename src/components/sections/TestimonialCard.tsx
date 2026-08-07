import { StarRating } from "@/components/ui/StarRating";
import { icons } from "@/lib/icons";
import { isDevPreview } from "@/lib/dev-preview";
import type { Testimonial } from "@/types/content";

export function TestimonialCard({
  quote,
  authorName,
  authorLocation,
  rating,
  isVerified,
}: Testimonial) {
  const Quote = icons.quote;

  return (
    <div className="relative flex flex-col gap-6 rounded-card border border-border bg-surface px-6 py-8 shadow-sm">
      {isDevPreview && !isVerified && (
        <span
          data-dev-indicator="unverified-testimonial"
          className="absolute right-4 top-4 rounded-full bg-orange/10 px-2 py-0.5 font-ui text-[10px] font-bold uppercase tracking-wide text-orange"
        >
          Unverified (dev)
        </span>
      )}
      <Quote aria-hidden="true" size={36} className="text-navy" />
      <p className="font-body font-light italic leading-relaxed text-foreground">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex flex-col gap-2">
        <StarRating rating={rating} />
        <p className="font-ui text-sm text-text-muted">
          {authorName} — {authorLocation}
        </p>
      </div>
    </div>
  );
}
