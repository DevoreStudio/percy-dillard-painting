import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type FormFieldProps = {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Shared label / description / control / error layout used by every form
 * primitive below. Handles the accessible wiring (label -> control via
 * htmlFor/id, description and error linked via aria-describedby) so each
 * concrete field only has to render its own control.
 *
 * Concrete fields are responsible for applying `aria-describedby` /
 * `aria-invalid` to their control using descriptionId / errorId — see
 * TextInput for the pattern.
 */
export function FormField({
  id,
  label,
  description,
  error,
  required,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="font-ui text-base text-foreground">
        {label}
        {required && (
          <span aria-hidden="true" className="text-orange">
            {" "}
            *
          </span>
        )}
      </label>
      {description && (
        <p id={descriptionId(id)} className="font-ui text-sm text-text-muted">
          {description}
        </p>
      )}
      {children}
      {error && (
        <p
          id={errorId(id)}
          role="alert"
          className="font-ui text-sm text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function descriptionId(id: string) {
  return `${id}-description`;
}

export function errorId(id: string) {
  return `${id}-error`;
}
