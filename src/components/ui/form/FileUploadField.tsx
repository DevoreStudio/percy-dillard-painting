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
 * "Project photos (optional)" dropzone. UI + local selection state only
 * — no upload/backend wiring yet (that's a later milestone alongside the
 * Resend/form-delivery decision). Validates file type, per-file size,
 * and max count client-side so the validation architecture is in place
 * ahead of a real submit handler; invalid files are rejected with a
 * specific reason rather than silently dropped.
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

  const combinedError = error ?? localError ?? undefined;

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
    </FormField>
  );
}
