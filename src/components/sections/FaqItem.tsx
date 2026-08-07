import { icons } from "@/lib/icons";
import { isDevPreview } from "@/lib/dev-preview";
import type { Faq } from "@/types/content";

/**
 * No answer copy exists for any FAQ yet — `answer` is null until real
 * content is approved (see lib/content/faqs.ts). Nothing customer-facing
 * is shown in that case. In development only, a neutral, clearly
 * non-production placeholder is shown so the accordion layout can be
 * reviewed — gated by isDevPreview (NODE_ENV), so it cannot ship in a
 * production build.
 */
export function FaqItem({ question, answer }: Faq) {
  const ChevronDown = icons.chevronDown;

  return (
    <details className="group border-b border-border py-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-xl text-foreground marker:content-none">
        {question}
        <ChevronDown
          aria-hidden="true"
          size={20}
          className="shrink-0 text-foreground transition-transform group-open:rotate-180"
        />
      </summary>
      {answer ? (
        <p className="mt-4 font-body font-light text-text-muted">{answer}</p>
      ) : isDevPreview ? (
        <p
          data-dev-placeholder="faq-answer"
          className="mt-4 border border-dashed border-orange bg-orange/5 px-3 py-2 font-mono text-sm text-orange"
        >
          [DEV PLACEHOLDER — no answer approved yet. Not for production.]
        </p>
      ) : null}
    </details>
  );
}
