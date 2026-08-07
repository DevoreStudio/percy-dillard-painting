import { icons, type IconName } from "@/lib/icons";
import { cn } from "@/lib/utils";

export type IconBubbleProps = {
  icon: IconName;
  /** Outer circle diameter in pixels. Feature cards use 44 in the design. */
  size?: number;
  className?: string;
  iconClassName?: string;
};

/** Circular icon-in-a-tint-background pattern used on the feature cards. */
export function IconBubble({
  icon,
  size = 44,
  className,
  iconClassName,
}: IconBubbleProps) {
  const Icon = icons[icon];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-tint-blue",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Icon
        aria-hidden="true"
        width={Math.round(size * 0.55)}
        height={Math.round(size * 0.55)}
        className={cn("text-navy", iconClassName)}
      />
    </span>
  );
}
