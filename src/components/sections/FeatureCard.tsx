import { IconBubble } from "@/components/ui/IconBubble";
import type { Feature } from "@/types/content";

export function FeatureCard({ icon, title, description }: Feature) {
  return (
    <div className="flex flex-col gap-4 rounded-card bg-surface px-6 py-6 shadow-sm">
      <IconBubble icon={icon} />
      <div className="flex flex-col gap-3">
        <h3 className="font-display text-xl text-foreground">{title}</h3>
        <p className="font-body font-light leading-snug text-text-muted">
          {description}
        </p>
      </div>
    </div>
  );
}
