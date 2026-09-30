"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { icons } from "@/lib/icons";
import { optimizePhotos } from "@/lib/optimize-photo";
import { cn } from "@/lib/utils";
import { FormField, descriptionId, errorId } from "./FormField";

const ALLOWED_TYPES = ["image/jpeg", "image/png"];
// Kept in sync with MAX_PHOTO_FILE_BYTES / MAX_PHOTO_TOTAL_BYTES in
// src/lib/estimate-validation.ts, which the server enforces
// independently — see that file for why these numbers are this small
// (Vercel's serverless function request-body ceiling).
const DEFAULT_MAX_FILE_SIZE_MB = 1.5;
const DEFAULT_MAX_TOTAL_SIZE_MB = 4;

export type FileUploadFieldProps = {
  id?: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  maxFiles?: number;
  /** Per-file size ceiling, in megabytes. */
  maxFileSizeMB?: number;
  /** Combined size ceiling across all selected files, in megabytes. */
  maxTotalSizeMB?: number;
  accept?: string;
  /** Called with the current valid file selection whenever it changes. */
  onFilesChange?: (files: File[]) => void;
  /** Called while a selection is being optimized in the browser (see
   * src/lib/optimize-photo.ts), so a parent form can disable submission
   * until it's done — optimizing can take a moment on large phone
   * photos and must finish before the files it returns are usable. */
  onProcessingChange?: (isProcessing: boolean) => void;
};

/**
 * A selected photo, tracked as both its original (untouched) bytes and
 * its optimized (upload-ready) bytes. Keeping the true original around
 * — rather than only the optimized output — matters once selection
 * becomes additive: if adding a 7th... well, a 4th or 5th photo pushes
 * the combined total back over budget, optimizePhotos() re-compresses
 * from the ORIGINAL bytes of every photo, old and new alike, so
 * already-added photos never get recompressed from an already-lossy
 * JPEG (which would compound artifacts across multiple add actions).
 */
type PhotoEntry = {
  id: string;
  original: File;
  optimized: File;
};

/**
 * "Project photos (optional)" dropzone. Selection is additive — picking
 * or dropping more files adds to whatever's already selected (up to
 * maxFiles), rather than replacing it. Selected files are handed back
 * via onFilesChange for EstimateForm.tsx to send as real attachments
 * (see submitEstimateRequest there and src/app/api/estimate/route.ts).
 * Validates file type and max count immediately; oversized photos are
 * automatically resized/recompressed in the browser (see
 * src/lib/optimize-photo.ts) rather than rejected, since a normal
 * smartphone photo routinely exceeds maxFileSizeMB on its own. The
 * server (src/lib/estimate-photo-validation.ts) re-validates type,
 * count, and size independently regardless of what happens here, since
 * a client check/optimization alone isn't trustworthy. Selected files
 * render as removable chips below the dropzone so a visitor can drop
 * the wrong photo before submitting.
 *
 * State-update rule: onFilesChange (and any other external callback)
 * is always called as a plain statement with an already-computed
 * array, never from inside a setEntries functional updater — updater
 * functions must stay pure and free of side effects, or React logs
 * "Cannot update a component while rendering a different component"
 * (this component previously did this in removeFile).
 */
export function FileUploadField({
  id,
  label,
  description = `Up to 6 images · JPG or PNG · ${DEFAULT_MAX_FILE_SIZE_MB}MB each, ${DEFAULT_MAX_TOTAL_SIZE_MB}MB total`,
  error,
  required,
  className,
  maxFiles = 6,
  maxFileSizeMB = DEFAULT_MAX_FILE_SIZE_MB,
  maxTotalSizeMB = DEFAULT_MAX_TOTAL_SIZE_MB,
  accept = "image/jpeg,image/png",
  onFilesChange,
  onProcessingChange,
}: FileUploadFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const nextEntryId = useRef(0);
  const [entries, setEntries] = useState<PhotoEntry[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const ImagePlus = icons.imagePlus;

  function makeEntryId(): string {
    nextEntryId.current += 1;
    return `photo-${nextEntryId.current}`;
  }

  async function applyFiles(nextFiles: FileList | null) {
    if (!nextFiles || isProcessing) return;
    const incoming = Array.from(nextFiles);
    const problems: string[] = [];

    // Type is checked immediately and synchronously — no amount of
    // client-side resizing fixes "wrong file type", so there's no
    // reason to wait on that before telling the visitor.
    const typeValid = incoming.filter((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        problems.push(`${file.name} isn't a JPG or PNG.`);
        return false;
      }
      return true;
    });

    // Additive: new files are added to whatever's already selected,
    // capped at maxFiles total — not replaced by the new picker/drop
    // interaction. `entries` here reflects the current selection as of
    // this render; the dropzone and remove buttons are both disabled
    // while isProcessing, so nothing else can change `entries`
    // concurrently while this (possibly long-running) function is in
    // flight.
    const availableSlots = maxFiles - entries.length;
    let toAdd = typeValid;
    if (toAdd.length > availableSlots) {
      problems.push(
        availableSlots > 0
          ? `Only ${availableSlots} more photo${availableSlots === 1 ? "" : "s"} could be added — the limit is ${maxFiles} total.`
          : `You've already selected the maximum of ${maxFiles} photos.`,
      );
      toAdd = toAdd.slice(0, Math.max(0, availableSlots));
    }

    if (toAdd.length === 0) {
      setLocalError(problems.length > 0 ? problems.join(" ") : null);
      return;
    }

    // Oversized photos are automatically resized/recompressed in the
    // browser (see src/lib/optimize-photo.ts) rather than rejected
    // outright — a normal smartphone photo routinely exceeds
    // maxFileSizeMB on its own, and a visitor shouldn't have to know
    // that or resize it by hand. The server re-validates the actual
    // bytes regardless of what happens here (see FormField's error
    // prop / estimate-photo-validation.ts), so this is a convenience
    // step, not a security boundary.
    //
    // The combined-size budget applies across the WHOLE resulting
    // selection, not just the newly added files, so every original
    // (existing + new) is re-optimized together.
    const combinedOriginals = [
      ...entries.map((entry) => entry.original),
      ...toAdd,
    ];

    setIsProcessing(true);
    onProcessingChange?.(true);
    try {
      const result = await optimizePhotos(combinedOriginals);
      if (!result.ok) {
        // Don't silently drop anything and don't guess which existing
        // selection to keep — surface exactly why, and leave the
        // current selection exactly as it was.
        setLocalError([...problems, result.message].filter(Boolean).join(" "));
        return;
      }

      const nextEntries = combinedOriginals.map((original, index) => ({
        id: makeEntryId(),
        original,
        optimized: result.files[index] ?? original,
      }));

      setEntries(nextEntries);
      setLocalError(problems.length > 0 ? problems.join(" ") : null);
      onFilesChange?.(nextEntries.map((entry) => entry.optimized));
    } finally {
      setIsProcessing(false);
      onProcessingChange?.(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    void applyFiles(event.dataTransfer.files);
  }

  function removeFile(index: number) {
    // Compute the next array directly from current state, then call
    // setEntries and onFilesChange as separate, plain statements — not
    // from inside a setEntries functional updater. React invokes
    // updater functions during the render phase (and may invoke them
    // more than once), so triggering another component's setState from
    // inside one is invalid and logs "Cannot update a component while
    // rendering a different component." `entries` is safe to read
    // directly here (rather than via an updater) since removal is
    // disabled while isProcessing, so nothing else can change it
    // concurrently.
    const next = entries.filter((_, i) => i !== index);
    setEntries(next);
    onFilesChange?.(next.map((entry) => entry.optimized));
    setLocalError(null);
    // The native file input keeps its own FileList independent of this
    // component's `entries` state. Clearing it here means the next
    // pick (via the file dialog or a fresh drop) always starts from a
    // clean slate rather than the browser silently re-adding a file
    // the user just removed.
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const combinedError = error ?? localError ?? undefined;
  const Close = icons.close;

  return (
    <FormField
      id={fieldId}
      label={label}
      description={description}
      error={combinedError}
      required={required}
      className={className}
    >
      <label
        htmlFor={fieldId}
        onDragOver={(event) => {
          event.preventDefault();
          if (!isProcessing) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        aria-disabled={isProcessing || undefined}
        className={cn(
          "flex h-[135px] w-full min-w-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-input border border-border-input bg-surface-muted px-4 py-3 text-center transition-colors",
          isDragging && "border-blue bg-tint-blue",
          isProcessing && "cursor-wait opacity-70",
        )}
      >
        <ImagePlus
          aria-hidden="true"
          width={36}
          height={36}
          className="text-navy"
        />
        <span className="font-body text-lg text-foreground" aria-live="polite">
          {isProcessing
            ? "Optimizing photos…"
            : entries.length > 0
              ? `${entries.length} photo${entries.length === 1 ? "" : "s"} selected`
              : "Add photos of the space"}
        </span>
        <span className="font-body text-sm text-text-muted">
          Up to {maxFiles} images · JPG or PNG · {maxFileSizeMB}MB each,{" "}
          {maxTotalSizeMB}MB total
        </span>
        <input
          ref={inputRef}
          id={fieldId}
          type="file"
          multiple
          accept={accept}
          disabled={isProcessing}
          onChange={(event) => void applyFiles(event.target.files)}
          aria-describedby={
            cn(
              description && descriptionId(fieldId),
              combinedError && errorId(fieldId),
            ) || undefined
          }
          aria-invalid={Boolean(combinedError) || undefined}
          className="sr-only"
        />
      </label>

      {entries.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {entries.map((entry, index) => (
            <li
              key={entry.id}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-chip px-3 py-1 font-ui text-sm text-foreground"
            >
              <span className="max-w-[200px] truncate">
                {entry.optimized.name}
              </span>
              <button
                type="button"
                aria-label={`Remove ${entry.optimized.name}`}
                onClick={() => removeFile(index)}
                disabled={isProcessing}
                className="shrink-0 rounded-full p-0.5 text-text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--color-blue)] disabled:pointer-events-none disabled:opacity-50"
              >
                <Close aria-hidden="true" size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </FormField>
  );
}
