"use client";

import { ESTIMATE_PRESELECT_EVENT, estimateFormHref } from "@/lib/content/nav";
import { icons } from "@/lib/icons";
import type { Service } from "@/types/content";

/**
 * "use client" only so the CTA can dispatch a same-page
 * ESTIMATE_PRESELECT_EVENT before the anchor scrolls to #estimate — see
 * EstimateForm.tsx, which listens for it and preselects the matching
 * service. Deliberately not URL query params / routing: everything
 * lives on one page already, so a plain window CustomEvent is the
 * smallest way to pass "which service was clicked" across components
 * without adding a state library or a client-side router dependency.
 */
export function ServiceCard({ id, number, title, description }: Service) {
  const ArrowRight = icons.arrowRight;

  function handleClick() {
    window.dispatchEvent(
      new CustomEvent(ESTIMATE_PRESELECT_EVENT, { detail: id }),
    );
  }

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
        onClick={handleClick}
        className="mt-auto flex items-center gap-1 font-body text-blue"
      >
        Get an estimate
        <ArrowRight aria-hidden="true" size={20} />
      </a>
    </div>
  );
}
