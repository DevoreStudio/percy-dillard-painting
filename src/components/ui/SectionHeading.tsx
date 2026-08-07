import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SectionHeadingProps = {
  /** Small tracked all-caps label, e.g. "FEATURED PROJECTS". */
  eyebrow: string;
  /** ReactNode so callers can force a specific line break (e.g. <br />). */
  title: ReactNode;
  description?: string;
  className?: string;
  /** Full replacement for the eyebrow's default classes, incl. color. */
  eyebrowClassName?: string;
  /** Full replacement for the title's default classes, incl. color. */
  titleClassName?: string;
  /** Full replacement for the description's default classes, incl. color. */
  descriptionClassName?: string;
};

/**
 * The eyebrow + serif title + supporting description pattern repeated
 * across "What We Do", "Why People Choose Percy", "Featured Projects",
 * "Where We Work" and "Testimonials".
 *
 * `*ClassName` props fully replace that part's default classes (rather
 * than merging) so color overrides — e.g. white text on the dark "Where
 * We Work" section — don't fight the default color utility in the
 * cascade.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  eyebrowClassName,
  titleClassName,
  descriptionClassName,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <p
        className={cn(
          "font-body text-xs font-bold uppercase tracking-[2.64px]",
          eyebrowClassName ?? "text-blue",
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={cn(
          "font-display text-[40px] leading-tight",
          titleClassName ?? "text-foreground",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "max-w-[584px] font-body font-light",
            descriptionClassName ?? "text-text-muted",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
