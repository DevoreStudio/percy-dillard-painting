"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { FormField, descriptionId, errorId } from "./FormField";

export type FileUploadFieldProps = {
  id?: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  maxFiles?: number;
  accept?: string;
  /** Called with the current file selection whenever it changes. */
  onFilesChange?: (files: File[]) => void;
};

/**
 * "Project photos (optional)" dropzone. UI + local selection state only
 * — no upload/backend wiring yet (that's a later milestone alongside the
 * Resend/form-delivery decision). Enforces maxFiles client-side so the
 * validation architecture is in place ahead of a real submit handler.
 */
export function FileUploadField({
  id,
  label,
  description = "Up to 6 images · JPG or PNG",
  error,
  required,
  className,
  maxFiles = 6,
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
    const selected = Array.from(nextFiles);
    if (selected.length > maxFiles) {
      setLocalError(`You can add up to ${maxFiles} photos.`);
    } else {
      setLocalError(null);
    }
    const limited = selected.slice(0, maxFiles);
    setFiles(limited);
    onFilesChange?.(limited);
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
