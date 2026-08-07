import type { SelectHTMLAttributes } from "react";
import { icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { FormField, descriptionId, errorId } from "./FormField";

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectFieldProps = {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  options: SelectOption[];
  placeholder?: string;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "className">;

/**
 * Native <select> (matches "What do you need?" in the design). Kept as a
 * real <select> rather than a custom listbox for native keyboard/AT
 * support, per CLAUDE.md's preference for native HTML semantics; only
 * the dropdown chevron is custom-drawn.
 */
export function SelectField({
  id,
  label,
  description,
  error,
  required,
  className,
  options,
  placeholder = "Select a service",
  defaultValue,
  ...selectProps
}: SelectFieldProps) {
  const ChevronDown = icons.chevronDown;

  return (
    <FormField
      id={id}
      label={label}
      description={description}
      error={error}
      required={required}
    >
      <div className="relative">
        <select
          id={id}
          required={required}
          defaultValue={defaultValue ?? ""}
          aria-describedby={
            cn(description && descriptionId(id), error && errorId(id)) ||
            undefined
          }
          aria-invalid={Boolean(error) || undefined}
          className={cn(
            "w-full min-w-[120px] appearance-none rounded-input border border-border-input bg-surface px-4 py-3 pr-10 font-ui text-base text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--color-blue)]",
            error && "border-red-500",
            className,
          )}
          {...selectProps}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          width={20}
          height={20}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground"
        />
      </div>
    </FormField>
  );
}
