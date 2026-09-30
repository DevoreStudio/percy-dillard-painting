"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Button } from "@/components/ui/Button";
import { FileUploadField } from "@/components/ui/form/FileUploadField";
import { MultiSelectField } from "@/components/ui/form/MultiSelectField";
import type { SelectOption } from "@/components/ui/form/SelectField";
import { TextareaField } from "@/components/ui/form/TextareaField";
import { TextInput } from "@/components/ui/form/TextInput";
import { contact } from "@/lib/content/contact";
import { ESTIMATE_PRESELECT_EVENT } from "@/lib/content/nav";
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
  /**
   * Honeypot spam trap: a field real visitors never see or fill in (see
   * the offscreen input below), but a form-filling bot typically will.
   * Any value here means the submission is treated as spam and silently
   * no-ops on the client. The same field is checked again server-side
   * (src/app/api/estimate/route.ts) — a client-only check is trivial
   * for a bot posting directly to the endpoint to skip.
   */
  company: string;
};

const initialValues: FormValues = {
  name: "",
  email: "",
  phone: "",
  city: "",
  services: [],
  details: "",
  company: "",
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

type SubmitState = "idle" | "submitting" | "success" | "failure";

/** Maps each validated field to the DOM id of its control, so a failed
 * submit can move focus to the first invalid field — required for
 * keyboard/screen-reader users to find what needs fixing without
 * hunting through the form. Also used to translate the server's
 * `fieldErrors` (keyed the same way validateEstimateRequest on the
 * server returns them) back onto the right input. */
const FIELD_ELEMENT_IDS: Record<
  "name" | "email" | "phone" | "city" | "services" | "details",
  string
> = {
  name: "estimate-name",
  phone: "estimate-phone",
  email: "estimate-email",
  city: "estimate-city",
  services: "estimate-service",
  details: "estimate-details",
};

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

type EstimateApiResponse =
  | { ok: true }
  | {
      ok: false;
      error: string;
      message?: string;
      fieldErrors?: Partial<Record<keyof typeof FIELD_ELEMENT_IDS, string>>;
    };

/**
 * Submits to the estimate endpoint (src/app/api/estimate/route.ts).
 * Only photo COUNT is sent, never the files themselves — see the
 * PHOTO STRATEGY note at the top of that route for why, and
 * FileUploadField/removeFile for where `photoCount` comes from.
 */
async function submitEstimateRequest(
  values: FormValues,
  photoCount: number,
): Promise<EstimateApiResponse> {
  const response = await fetch("/api/estimate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: values.name,
      phone: values.phone,
      email: values.email,
      city: values.city,
      services: values.services,
      details: values.details,
      company: values.company,
      photoCount,
    }),
  });

  const data = (await response
    .json()
    .catch(() => null)) as EstimateApiResponse | null;

  if (!data) {
    throw new Error("The server returned an unexpected response.");
  }

  return data;
}

export function EstimateForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const Phone = icons.phone;

  // Move focus to the status banner whenever a submission resolves, so
  // keyboard and screen-reader users get a clear, immediate signal of
  // the outcome instead of having to go looking for it.
  useEffect(() => {
    if (submitState === "success" || submitState === "failure") {
      statusRef.current?.focus();
    }
  }, [submitState]);

  // Preselect a service when a "Get an estimate" service card CTA is
  // clicked elsewhere on the page — see ServiceCard.tsx, which
  // dispatches this event with the clicked service's id before the
  // anchor scrolls down to this form.
  useEffect(() => {
    function handlePreselect(event: Event) {
      const serviceId = (event as CustomEvent<string>).detail;
      if (!serviceOptions.some((option) => option.value === serviceId)) {
        return;
      }
      setValues((current) =>
        current.services.includes(serviceId)
          ? current
          : { ...current, services: [...current.services, serviceId] },
      );
    }

    window.addEventListener(ESTIMATE_PRESELECT_EVENT, handlePreselect);
    return () =>
      window.removeEventListener(ESTIMATE_PRESELECT_EVENT, handlePreselect);
  }, []);

  function updateField<K extends "name" | "email" | "city" | "details">(
    field: K,
  ) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      if (submitState !== "idle") setSubmitState("idle");
    };
  }

  function updateServices(next: string[]) {
    setValues((current) => ({ ...current, services: next }));
    if (submitState !== "idle") setSubmitState("idle");
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
    if (submitState !== "idle") setSubmitState("idle");

    requestAnimationFrame(() => {
      const nextCaret = caretIndexForDigitCount(formatted, digitsBeforeCaret);
      input.setSelectionRange(nextCaret, nextCaret);
    });
  }

  function focusFirstInvalidField(fieldErrors: FormErrors) {
    const firstInvalidField = (
      Object.keys(FIELD_ELEMENT_IDS) as Array<keyof typeof FIELD_ELEMENT_IDS>
    ).find((field) => fieldErrors[field]);
    if (firstInvalidField) {
      document.getElementById(FIELD_ELEMENT_IDS[firstInvalidField])?.focus();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Prevent duplicate submissions from a double-click or repeated
    // Enter presses while a request is already in flight.
    if (submitState === "submitting") return;

    // Honeypot: a real visitor never sees or fills the "company" field
    // (see the offscreen input below), so any value here almost
    // certainly means a bot filled every field it could find. Silently
    // no-op rather than showing an error, so the bot has no signal that
    // it was caught.
    if (values.company.trim()) {
      return;
    }

    const nextErrors = validate(values);
    setErrors(nextErrors);
    const isValid = Object.keys(nextErrors).length === 0;

    if (!isValid) {
      setSubmitState("idle");
      focusFirstInvalidField(nextErrors);
      return;
    }

    setSubmitState("submitting");
    setStatusMessage(null);

    try {
      const result = await submitEstimateRequest(values, photos.length);

      if (result.ok) {
        setSubmitState("success");
        return;
      }

      if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
        // The server caught something the client-side check missed (or
        // the request was tampered with) — this is a fixable input
        // problem, not a delivery failure, so it gets field-level
        // errors and normal focus behavior rather than the "couldn't
        // send, call Percy instead" banner.
        setErrors(result.fieldErrors);
        focusFirstInvalidField(result.fieldErrors);
        setSubmitState("idle");
        return;
      }

      setStatusMessage(
        result.message ?? "We couldn't send your request right now.",
      );
      setSubmitState("failure");
    } catch {
      setStatusMessage("We couldn't reach the server.");
      setSubmitState("failure");
    }
  }

  const isSubmitting = submitState === "submitting";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {/* Honeypot spam trap. `sr-only` clips it visually without
          `display:none`/`visibility:hidden`, which unsophisticated bots
          often check for and skip — so a form-filling bot is likely to
          still fill this in, while a real visitor never sees it.
          aria-hidden + tabIndex={-1} keep it out of the experience for
          screen reader and keyboard users, who'd otherwise land on a
          field that visually doesn't exist. */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="estimate-company">Company</label>
        <input
          id="estimate-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.company}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              company: event.target.value,
            }))
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <TextInput
          id="estimate-name"
          label="Name"
          required
          value={values.name}
          onChange={updateField("name")}
          error={errors.name}
          disabled={isSubmitting}
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
          disabled={isSubmitting}
        />
        <TextInput
          id="estimate-email"
          label="Email"
          type="email"
          required
          value={values.email}
          onChange={updateField("email")}
          error={errors.email}
          disabled={isSubmitting}
        />
        <TextInput
          id="estimate-city"
          label="City / town"
          required
          value={values.city}
          onChange={updateField("city")}
          error={errors.city}
          disabled={isSubmitting}
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
        disabled={isSubmitting}
        placeholder="Rooms, square footage, timeline, colors you have in mind..."
      />

      <FileUploadField
        label="Project photos (optional)"
        maxFiles={6}
        onFilesChange={setPhotos}
      />

      {/* Single status region, focusable so it can receive focus
          programmatically on submit resolution (see the effect above).
          role="status"/"alert" and the polite/assertive split matches
          each outcome's urgency: a quiet confirmation vs. something
          that needs the visitor's attention. */}
      <div
        ref={statusRef}
        tabIndex={-1}
        aria-live={submitState === "failure" ? "assertive" : "polite"}
        role={submitState === "failure" ? "alert" : "status"}
      >
        {submitState === "success" && (
          <p className="rounded-input border border-blue bg-tint-blue px-4 py-3 font-ui text-sm text-foreground">
            Thanks! Your estimate request has been sent to Percy. We&rsquo;ll
            follow up to discuss your project.
            {photos.length > 0 && (
              <>
                {" "}
                Photos aren&rsquo;t included with this request yet: email them
                to {contact.email ?? "Percy"} or bring them up when he calls.
              </>
            )}
            {contact.phone && (
              <> You can also reach Percy directly at {contact.phone}.</>
            )}
          </p>
        )}

        {submitState === "failure" && statusMessage && (
          <p className="rounded-input border border-red-500 bg-red-50 px-4 py-3 font-ui text-sm text-foreground">
            {statusMessage} Your information hasn&rsquo;t been lost.
            {contact.phone && (
              <> Please try again or call Percy at {contact.phone}.</>
            )}
          </p>
        )}
        {/* Note: this banner is only reached for true delivery
            failures (network error, or the server responding without
            fieldErrors) — a 422 with fieldErrors is handled as normal
            field-level validation instead, see handleSubmit. */}
      </div>

      <Button
        type="submit"
        variant="accent"
        className="w-full sm:w-auto"
        disabled={isSubmitting}
        aria-busy={isSubmitting || undefined}
      >
        {isSubmitting ? "Sending Request..." : "Request a Free Estimate"}
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
