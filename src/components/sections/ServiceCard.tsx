import { estimateFormHref } from "@/lib/content/nav";
import { icons } from "@/lib/icons";
import type { Service } from "@/types/content";

export function ServiceCard({ number, title, description }: Service) {
  const ArrowRight = icons.arrowRight;

  return (
    <div className="flex flex-col gap-4 rounded-card border border-border bg-surface px-6 py-8 shadow-sm">
      <p className="font-display text-base font-bold tracking-wide text-blue">
        {number}
      </p>
      <div className="flex flex-col gap-4">
        <h3 className="font-display text-xl text-foreground">{title}</h3>
        <p className="font-body font-light text-text-muted">{description}</p>
      </div>
      <a
        href={estimateFormHref}
        className="mt-auto flex items-center gap-1 font-body text-blue"
      >
        Get a price
        <ArrowRight aria-hidden="true" size={20} />
      </a>
    </div>
  );
}
