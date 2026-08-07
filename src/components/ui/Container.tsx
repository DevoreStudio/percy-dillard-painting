import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ContainerProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Shared max-width/padding wrapper used by every section, so the page's
 * horizontal rhythm lives in one place rather than being repeated
 * per-section. Not from Figma directly — introduced during Milestone 2
 * section-building for consistency.
 */
export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1280px] px-6 sm:px-8 lg:px-12",
        className,
      )}
    >
      {children}
    </div>
  );
}
