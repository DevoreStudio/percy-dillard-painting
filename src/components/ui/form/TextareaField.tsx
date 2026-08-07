import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { FormField, descriptionId, errorId } from "./FormField";

export type TextareaFieldProps = {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "className">;

/** Multi-line field — used for "Project details". */
export function TextareaField({
  id,
  label,
  description,
  error,
  required,
  className,
  rows = 5,
  ...textareaProps
}: TextareaFieldProps) {
  return (
    <FormField
      id={id}
      label={label}
      description={description}
      error={error}
      required={required}
    >
      <textarea
        id={id}
        rows={rows}
        required={required}
        aria-describedby={
          cn(description && descriptionId(id), error && errorId(id)) ||
          undefined
        }
        aria-invalid={Boolean(error) || undefined}
        className={cn(
          "w-full min-w-[120px] resize-y rounded-input border border-border-input bg-surface px-4 py-3 font-ui text-base text-foreground placeholder:text-text-tertiary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--color-blue)]",
          error && "border-red-500",
          className,
        )}
        {...textareaProps}
      />
    </FormField>
  );
}
