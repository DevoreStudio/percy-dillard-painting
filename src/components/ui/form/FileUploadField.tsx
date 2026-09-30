"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { FormField, descriptionId, errorId } from "./FormField";

const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const DEFAULT_MAX_FILE_SIZE_MB = 8;

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
  accept?: string;
  /** Called with the current valid file selection whenever it changes. */
  onFilesChange?: (files: File[]) => void;
};

/**
 * "Project photos (optional)" dropzone. UI + local selection state only.
 * No upload/backend wiring yet; that's a later milestone alongside the
 * Resend/form-delivery decision (see EstimateForm.tsx and the
 * production-readiness report notes on the estimate form's submission
 * destination). Validates file type, per-file size, and max count
 * client-side so the validation architecture is in place ahead of a
 * real submit handler; invalid files are rejected with a specific
 * reason rather than silently dropped. Selected files render as
 * removable chips below the dropzone so a visitor can drop the wrong
 * photo before submitting.
 */
export function FileUploadField({
  id,
  label,
  description = "Up to 6 images · JPG or PNG",
  error,
  required,
  className,
  maxFiles = 6,
  maxFileSizeMB = DEFAULT_MAX_FILE_SIZE_MB,
  accept = "image/jpeg,image/png",
  onFilesChange,
}: FileUploadFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const ImagePlus = icons.imagePlus;

  function applyFiles(nextFiles: FileList | null) {
    if (!nextFiles) return;
    const incoming = Array.from(nextFiles);
    const problems: string[] = [];
    const maxBytes = maxFileSizeMB * 1024 * 1024;

    const valid = incoming.filter((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        problems.push(`${file.name} isn't a JPG or PNG.`);
        return false;
      }
      if (file.size > maxBytes) {
        problems.push(`${file.name} is larger than ${maxFileSizeMB}MB.`);
        return false;
      }
      return true;
    });

    let kept = valid;
    if (kept.length > maxFiles) {
      problems.push(
        `Only the first ${maxFiles} photos were kept — the limit is ${maxFiles}.`,
      );
      kept = kept.slice(0, maxFiles);
    }

    setFiles(kept);
    setLocalError(problems.length > 0 ? problems.join(" ") : null);
    onFilesChange?.(kept);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    applyFiles(event.dataTransfer.files);
  }

  function removeFile(index: number) {
    setFiles((current) => {
      const next = current.filter((_, i) => i !== index);
      onFilesChange?.(next);
      return next;
    });
    setLocalError(null);
    // The native file input keeps its own FileList independent of this
    // component's `files` state. Clearing it here means the next pick
    // (via the file dialog or a fresh drop) always starts from a clean
    // slate rather than the browser silently re-adding a file the user
    // just removed.
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
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex h-[135px] w-full min-w-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-input border border-border-input bg-surface-muted px-4 py-3 text-center transition-colors",
          isDragging && "border-blue bg-tint-blue",
        )}
      >
        <ImagePlus
          aria-hidden="true"
          width={36}
          height={36}
          className="text-navy"
        />
        <span className="font-body text-lg text-foreground">
          {files.length > 0
            ? `${files.length} photo${files.length === 1 ? "" : "s"} selected`
            : "Add photos of the space"}
        </span>
        <span className="font-body text-sm text-text-muted">
          Up to {maxFiles} images · JPG or PNG
        </span>
        <input
          ref={inputRef}
          id={fieldId}
          type="file"
          multiple
          accept={accept}
          onChange={(event) => applyFiles(event.target.files)}
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

      {files.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.lastModified}-${index}`}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-chip px-3 py-1 font-ui text-sm text-foreground"
            >
              <span className="max-w-[200px] truncate">{file.name}</span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => removeFile(index)}
                className="shrink-0 rounded-full p-0.5 text-text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--color-blue)]"
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
