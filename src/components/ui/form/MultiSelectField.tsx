"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { FormField, descriptionId, errorId } from "./FormField";
import type { SelectOption } from "./SelectField";

export type MultiSelectFieldProps = {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  options: SelectOption[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
};

/**
 * Multi-select combobox for "What do you need?" — lets a customer pick
 * more than one service for a single project. Selected services render
 * as removable chips inside the field; picking an option keeps the
 * listbox open so several services can be chosen in one pass.
 *
 * Deliberately not a native `<select multiple>`: that requires a
 * ctrl/cmd-click to select more than one option (not discoverable) and
 * can't render a chip summary. Built instead as button + listbox.
 *
 * The chip "remove" controls are real `<button>`s living as siblings of
 * the listbox-toggle button, not nested inside it — HTML doesn't allow
 * interactive controls nested inside a `<button>`, so the toggle button
 * only ever contains the chevron. The FormField `<label>` targets the
 * toggle button via `htmlFor`, matching the pattern used by SelectField.
 */
export function MultiSelectField({
  id,
  label,
  description,
  error,
  required,
  className,
  options,
  value,
  onChange,
  placeholder = "Select one or more services",
}: MultiSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = `${id}-listbox`;
  const ChevronDown = icons.chevronDown;
  const Close = icons.close;
  const Check = icons.check;

  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  function toggleOption(optionValue: string) {
    onChange(
      value.includes(optionValue)
        ? value.filter((selected) => selected !== optionValue)
        : [...value, optionValue],
    );
  }

  function removeOption(optionValue: string) {
    onChange(value.filter((selected) => selected !== optionValue));
  }

  function handleToggleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex(0);
      setOpen(true);
    }
  }

  function handleListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        setOpen(false);
        toggleRef.current?.focus();
        break;
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, options.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case "Enter":
      case " ": {
        event.preventDefault();
        const option = options[activeIndex];
        if (option) toggleOption(option.value);
        break;
      }
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  }

  const selectedOptions = options.filter((option) =>
    value.includes(option.value),
  );

  return (
    <FormField
      id={id}
      label={label}
      description={description}
      error={error}
      required={required}
      className={className}
    >
      <div ref={containerRef} className="relative">
        <div
          className={cn(
            "flex min-h-[52px] w-full min-w-[120px] flex-wrap items-center gap-2 rounded-input border border-border-input bg-surface px-4 py-3 font-ui text-base text-foreground",
            error && "border-red-500",
          )}
        >
          {selectedOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-chip px-3 py-1 font-ui text-sm text-foreground"
            >
              {option.label}
              <button
                type="button"
                aria-label={`Remove ${option.label}`}
                onClick={(event) => {
                  event.stopPropagation();
                  removeOption(option.value);
                }}
                className="rounded-full p-0.5 text-text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--color-blue)]"
              >
                <Close aria-hidden="true" size={12} />
              </button>
            </span>
          ))}

          {/* When nothing is selected yet, the placeholder lives inside
              the toggle button so the whole field is one large click/
              focus target — matching a native select's affordance. Once
              chips exist, the button shrinks to just the chevron, since
              the chips themselves fill the field and already carry
              their own (much larger) click targets for removal. */}
          <button
            ref={toggleRef}
            type="button"
            id={id}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-describedby={
              cn(description && descriptionId(id), error && errorId(id)) ||
              undefined
            }
            onClick={(event) => {
              event.stopPropagation();
              setOpen((current) => !current);
            }}
            onKeyDown={handleToggleKeyDown}
            className={cn(
              "flex items-center gap-2 rounded-full text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--color-blue)]",
              selectedOptions.length === 0
                ? "flex-1 justify-between px-1 py-1 text-left"
                : "ml-auto shrink-0 p-1",
            )}
          >
            {selectedOptions.length === 0 && (
              <span className="text-text-tertiary">{placeholder}</span>
            )}
            <ChevronDown
              aria-hidden="true"
              width={20}
              height={20}
              className={cn("transition-transform", open && "rotate-180")}
            />
            <span className="sr-only">Toggle service list</span>
          </button>
        </div>

        {open && (
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-multiselectable="true"
            aria-activedescendant={
              options[activeIndex]
                ? `${id}-option-${options[activeIndex].value}`
                : undefined
            }
            tabIndex={0}
            onKeyDown={handleListKeyDown}
            className="absolute z-10 mt-2 max-h-64 w-full overflow-auto rounded-input border border-border-input bg-surface py-1 shadow-lg focus-visible:outline-none"
          >
            {options.map((option, index) => {
              const selected = value.includes(option.value);
              return (
                // Keyboard activation is handled on the parent <ul> via
                // aria-activedescendant (WAI-ARIA APG listbox pattern) —
                // options themselves are intentionally not tabbable, so
                // they don't need their own keyboard handler.
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                <li
                  key={option.value}
                  id={`${id}-option-${option.value}`}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => toggleOption(option.value)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-2 px-4 py-2 font-ui text-base text-foreground",
                    index === activeIndex && "bg-tint-blue",
                  )}
                >
                  {option.label}
                  {selected && (
                    <Check aria-hidden="true" size={16} className="text-blue" />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </FormField>
  );
}
