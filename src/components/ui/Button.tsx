import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "accent" | "outline";

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 font-ui text-base leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-blue)] disabled:pointer-events-none disabled:opacity-50";

const variantClasses: Record<ButtonVariant, string> = {
  // Header / Hero primary CTA — matches the approved design exactly.
  primary: "bg-navy text-navy-foreground font-normal hover:opacity-90",
  // Estimate form submit — the stronger, final-action treatment per
  // Corey's decision (orange = conversion/final action).
  accent: "bg-orange text-orange-foreground font-bold hover:opacity-90",
  // Hero secondary CTA (phone number).
  outline:
    "bg-[rgba(25,42,66,0.02)] text-foreground font-normal border border-foreground hover:bg-black/5",
};

type CommonProps = {
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Shared CTA primitive. Renders an <a> when `href` is provided (e.g. the
 * anchor-linked "Request a Free Estimate" CTAs in the header/hero) and a
 * <button> otherwise (e.g. the estimate form's submit button).
 */
export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(baseClasses, variantClasses[variant], className);

  if ("href" in props && props.href !== undefined) {
    const { href, ...anchorProps } = props as ButtonAsLink;
    return (
      <a href={href} className={classes} {...anchorProps}>
        {children}
      </a>
    );
  }

  const { type = "button", ...buttonProps } = props as ButtonAsButton;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
