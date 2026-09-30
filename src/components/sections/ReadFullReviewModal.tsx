"use client";

import { useEffect, useId, useRef, type MouseEvent } from "react";
import { icons } from "@/lib/icons";

export type ReadFullReviewModalProps = {
  quote: string;
  authorName: string;
  authorLocation: string | null;
  sourceLabel: string;
  date: string;
};

/**
 * "Read full review" trigger + native `<dialog>` modal.
 *
 * Replaces the earlier in-card `<details>` expansion, which stretched
 * the whole testimonial grid row to match the tallest (D.M.'s) card and
 * left large gaps under the shorter Lisa E. / Paul V. cards. A native
 * `<dialog>` opened with `showModal()` renders in the top layer instead,
 * so it never affects sibling card heights, and gets real browser
 * behavior for free: focus moves into the dialog and is trapped there,
 * Escape closes it, and it's exposed to assistive tech as a modal
 * dialog automatically. What the browser does NOT do automatically is
 * restore focus to the trigger or lock background scroll, so both are
 * handled explicitly below via the dialog's native `close` event, which
 * fires uniformly whether the dialog was closed via Escape, the close
 * button, or a backdrop click — one cleanup path for all three.
 */
export function ReadFullReviewModal({
  quote,
  authorName,
  authorLocation,
  sourceLabel,
  date,
}: ReadFullReviewModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const headingId = useId();
  const Close = icons.close;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    function handleClose() {
      document.body.style.removeProperty("overflow");
      triggerRef.current?.focus();
    }

    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  function openModal() {
    document.body.style.overflow = "hidden";
    dialogRef.current?.showModal();
  }

  function closeModal() {
    dialogRef.current?.close();
  }

  // The dialog element itself covers the viewport when open (its
  // ::backdrop is a separate pseudo-element behind it); a click that
  // lands on the <dialog> rather than on something inside it is
  // therefore a backdrop click.
  function handleDialogClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) {
      closeModal();
    }
  }

  const attribution = [authorLocation, sourceLabel, date]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openModal}
        className="w-fit cursor-pointer font-ui text-sm font-medium text-blue underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-blue)]"
      >
        Read full review
      </button>

      {/* The backdrop-click-to-close handler below is a convenience on
          top of two fully keyboard-accessible ways to close the dialog
          (Escape, handled natively by <dialog>, and the close button),
          not the only way to dismiss it — so it doesn't need its own
          keyboard equivalent, and the <dialog> itself is a modal
          container rather than a naturally "interactive" element in the
          jsx-a11y sense. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        ref={dialogRef}
        onClick={handleDialogClick}
        aria-labelledby={headingId}
        className="m-auto w-[min(560px,calc(100vw-2rem))] max-w-full rounded-card border border-border bg-surface p-0 shadow-lg backdrop:bg-[rgba(25,42,66,0.6)]"
      >
        <div className="flex max-h-[85vh] flex-col gap-4 overflow-y-auto p-8">
          <div className="flex items-start justify-between gap-4">
            <h3 id={headingId} className="font-display text-xl text-foreground">
              {authorName}&rsquo;s full review
            </h3>
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close"
              className="flex size-11 shrink-0 items-center justify-center rounded-full text-text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-blue)]"
            >
              <Close aria-hidden="true" size={20} />
            </button>
          </div>
          <p className="font-body font-light italic leading-relaxed text-foreground">
            &ldquo;{quote}&rdquo;
          </p>
          {attribution && (
            <p className="font-ui text-sm text-text-muted">{attribution}</p>
          )}
        </div>
      </dialog>
    </>
  );
}
