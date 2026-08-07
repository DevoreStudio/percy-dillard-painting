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
 *
 * Always controlled: EstimateForm (the only current caller) manages
 * `service` in React state and passes `value`/`onChange` down. `value`
 * is destructured explicitly and defaulted to "" so the element is never
 * uncontrolled, rather than also accepting `defaultValue` — mixing the
 * two on the same <select> is what previously triggered React's
 * "must be either controlled or uncontrolled" warning.
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
  value,
  onChange,
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
          value={value ?? ""}
          onChange={onChange}
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
