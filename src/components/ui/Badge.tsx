import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeProps = {
  children: ReactNode;
  className?: string;
};

/** Category tag used on Featured Projects cards (e.g. "Interior", "Exterior"). */
export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 font-ui text-sm text-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
