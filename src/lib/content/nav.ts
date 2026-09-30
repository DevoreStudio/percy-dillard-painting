import type { NavLink } from "@/types/content";

export const navLinks: NavLink[] = [
  { label: "Services", href: "#services" },
  { label: "Gallery", href: "#gallery" },
  { label: "Reviews", href: "#reviews" },
  { label: "Service Area", href: "#service-area" },
  { label: "FAQ", href: "#faq" },
];

/** Anchor target for every "Request a Free Estimate" CTA. */
export const estimateFormHref = "#estimate";

/**
 * window CustomEvent name dispatched by a service card's "Get an
 * estimate" link (detail: the clicked service's `id`) and consumed by
 * EstimateForm to preselect that service in the "What do you need?"
 * multi-select. See ServiceCard.tsx / EstimateForm.tsx.
 */
export const ESTIMATE_PRESELECT_EVENT = "estimate:preselect-service";
