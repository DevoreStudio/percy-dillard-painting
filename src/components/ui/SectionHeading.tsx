import { cn } from "@/lib/utils";

export type SectionHeadingProps = {
  /** Small tracked all-caps label, e.g. "FEATURED PROJECTS". */
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
  eyebrowClassName?: string;
};

/**
 * The eyebrow + serif title + supporting description pattern repeated
 * across "What We Do", "Why People Choose Percy", "Featured Projects",
 * "Where We Work" and "Testimonials".
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  eyebrowClassName,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <p
        className={cn(
          "font-body text-xs font-bold uppercase tracking-[2.64px] text-blue",
          eyebrowClassName,
        )}
      >
        {eyebrow}
      </p>
      <h2 className="font-display text-[40px] leading-tight text-foreground">
        {title}
      </h2>
      {description && (
        <p className="max-w-[584px] font-body font-light text-text-muted">
          {description}
        </p>
      )}
    </div>
  );
}
