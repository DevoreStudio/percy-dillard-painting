"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FileUploadField } from "@/components/ui/form/FileUploadField";
import { MultiSelectField } from "@/components/ui/form/MultiSelectField";
import type { SelectOption } from "@/components/ui/form/SelectField";
import { TextareaField } from "@/components/ui/form/TextareaField";
import { TextInput } from "@/components/ui/form/TextInput";
import { contact } from "@/lib/content/contact";
import { services } from "@/lib/content/services";
import { icons } from "@/lib/icons";
import {
  caretIndexForDigitCount,
  countDigitsBeforeCaret,
  formatPhoneDigits,
  toPhoneDigits,
} from "@/lib/phone";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const serviceOptions: SelectOption[] = [
  ...services.map((service) => ({ value: service.id, label: service.title })),
  { value: "other", label: "Other" },
];

type FormValues = {
  name: string;
  email: string;
  phone: string;
  city: string;
  services: string[];
  details: string;
};

const initialValues: FormValues = {
  name: "",
  email: "",
  phone: "",
  city: "",
  services: [],
  details: "",
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = "Enter your name.";
  if (!values.email.trim()) errors.email = "Enter your email.";
  else if (!EMAIL_PATTERN.test(values.email))
    errors.email = "Enter a valid email address.";
  if (!values.phone.trim()) errors.phone = "Enter a phone number.";
  else if (toPhoneDigits(values.phone).length < 10)
    errors.phone = "Enter a complete 10-digit phone number.";
  if (!values.city.trim()) errors.city = "Enter your city or town.";
  if (values.services.length === 0)
    errors.services = "Select at least one service.";
  if (!values.details.trim())
    errors.details = "Tell us a bit about the project.";
  return errors;
}

/**
 * Frontend-only per the approved plan: full client-side validation, but
 * no network call — Resend/delivery is a separate pending decision.
 * On a valid submit we show an honest, neutral confirmation that the
 * form itself validated, explicitly NOT a "your request has been sent"
 * message, since nothing is actually transmitted yet.
 */
export function EstimateForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [, setPhotos] = useState<File[]>([]);
  const [validated, setValidated] = useState(false);
  const Phone = icons.phone;

  function updateField<K extends "name" | "email" | "city" | "details">(
    field: K,
  ) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setValidated(false);
    };
  }

  function updateServices(next: string[]) {
    setValues((current) => ({ ...current, services: next }));
    setValidated(false);
  }

  /**
   * Reformats the phone field to `###-###-####` on every keystroke while
   * keeping the caret anchored to the digit the user was next to, rather
   * than letting it jump to the end (the usual failure mode for naive
   * masked inputs). Non-digit characters are simply dropped, and input
   * is capped at 10 digits.
   */
  function handlePhoneChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const caret = input.selectionStart ?? input.value.length;
    const digitsBeforeCaret = countDigitsBeforeCaret(input.value, caret);
    const formatted = formatPhoneDigits(toPhoneDigits(input.value));

    setValues((current) => ({ ...current, phone: formatted }));
    setValidated(false);

    requestAnimationFrame(() => {
      const nextCaret = caretIndexForDigitCount(formatted, digitsBeforeCaret);
      input.setSelectionRange(nextCaret, nextCaret);
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setValidated(Object.keys(nextErrors).length === 0);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <TextInput
          id="estimate-name"
          label="Name"
          required
          value={values.name}
          onChange={updateField("name")}
          error={errors.name}
        />
        <TextInput
          id="estimate-phone"
          label="Phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={12}
          placeholder="540-555-1234"
          required
          value={values.phone}
          onChange={handlePhoneChange}
          error={errors.phone}
        />
        <TextInput
          id="estimate-email"
          label="Email"
          type="email"
          required
          value={values.email}
          onChange={updateField("email")}
          error={errors.email}
        />
        <TextInput
          id="estimate-city"
          label="City / town"
          required
          value={values.city}
          onChange={updateField("city")}
          error={errors.city}
        />
      </div>

      <MultiSelectField
        id="estimate-service"
        label="What do you need?"
        required
        options={serviceOptions}
        value={values.services}
        onChange={updateServices}
        error={errors.services}
      />

      <TextareaField
        id="estimate-details"
        label="Project details"
        required
        value={values.details}
        onChange={updateField("details")}
        error={errors.details}
        placeholder="Rooms, square footage, timeline, colors you have in mind..."
      />

      <FileUploadField
        label="Project photos (optional)"
        maxFiles={6}
        onFilesChange={setPhotos}
      />

      {validated && (
        <p
          role="status"
          className="rounded-input border border-blue bg-tint-blue px-4 py-3 font-ui text-sm text-foreground"
        >
          Your details look good. This form isn&rsquo;t connected to email
          delivery yet, so nothing has been sent — that&rsquo;s a separate step
          before this goes live.
        </p>
      )}

      <Button type="submit" variant="accent" className="w-full sm:w-auto">
        Request a Free Estimate
      </Button>

      {contact.phone && (
        <p className="flex items-center gap-2 font-body text-sm text-text-muted">
          <Phone aria-hidden="true" size={16} />
          Prefer to talk it through? Call {contact.phone}.
        </p>
      )}
    </form>
  );
}
