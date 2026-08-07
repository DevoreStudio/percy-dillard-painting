import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { FormField, descriptionId, errorId } from "./FormField";

export type TextInputProps = {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className">;

/** Single-line text input — used for Name, Email, Phone, City/Town. */
export function TextInput({
  id,
  label,
  description,
  error,
  required,
  className,
  type = "text",
  ...inputProps
}: TextInputProps) {
  return (
    <FormField
      id={id}
      label={label}
      description={description}
      error={error}
      required={required}
    >
      <input
        id={id}
        type={type}
        required={required}
        aria-describedby={
          cn(description && descriptionId(id), error && errorId(id)) ||
          undefined
        }
        aria-invalid={Boolean(error) || undefined}
        className={cn(
          "w-full min-w-[120px] rounded-input border border-border-input bg-surface px-4 py-3 font-ui text-base text-foreground placeholder:text-text-tertiary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--color-blue)]",
          error && "border-red-500",
          className,
        )}
        {...inputProps}
      />
    </FormField>
  );
}
