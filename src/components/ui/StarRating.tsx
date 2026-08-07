import { icons } from "@/lib/icons";
import { cn } from "@/lib/utils";

export type StarRatingProps = {
  /** Rating out of `max`, e.g. 5. Rounded to the nearest whole star. */
  rating: number;
  max?: number;
  /** Icon size in pixels. */
  size?: number;
  className?: string;
  /** Accessible label; defaults to "{rating} out of {max} stars". */
  label?: string;
};

/**
 * Renders `max` stars, filling the first `rating` (rounded). The exact
 * gold/amber star color in the Figma file was exported as a flattened
 * image asset rather than a code-visible hex value, so this uses the
 * approved orange accent token as a close approximation — flag for a
 * pixel comparison against the design screenshot before treating the
 * color as final.
 */
export function StarRating({
  rating,
  max = 5,
  size = 16,
  className,
  label,
}: StarRatingProps) {
  const Star = icons.star;
  const filled = Math.round(rating);
  const accessibleLabel = label ?? `${rating} out of ${max} stars`;

  return (
    <div
      className={cn("inline-flex items-center gap-1", className)}
      role="img"
      aria-label={accessibleLabel}
    >
      {Array.from({ length: max }, (_, index) => {
        const isFilled = index < filled;
        return (
          <Star
            key={index}
            width={size}
            height={size}
            aria-hidden="true"
            className={isFilled ? "text-orange" : "text-border"}
            fill={isFilled ? "currentColor" : "none"}
            strokeWidth={isFilled ? 0 : 1.5}
          />
        );
      })}
    </div>
  );
}
