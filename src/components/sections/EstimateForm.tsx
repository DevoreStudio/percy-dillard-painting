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

type FormErrors = Partial<Record<keyof FormValues | "photos", string>>;

type SubmitState = "idle" | "submitting" | "success" | "failure";

/** Maps each validated field to the DOM id of its control, so a failed
 * submit can move focus to the first invalid field — required for
 * keyboard/screen-reader users to find what needs fixing without
 * hunting through the form. Also used to translate the server's
 * `fieldErrors` (keyed the same way validateEstimateRequest on the
 * server returns them) back onto the right input. */
const FIELD_ELEMENT_IDS: Record<
  "name" | "email" | "phone" | "city" | "services" | "details" | "photos",
  string
> = {
  name: "estimate-name",
  phone: "estimate-phone",
  email: "estimate-email",
  city: "estimate-city",
  services: "estimate-service",
  details: "estimate-details",
  photos: "estimate-photos",
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
 * Submits to the estimate endpoint (src/app/api/estimate/route.ts) as
 * multipart/form-data so the selected photos travel with the request
 * as real file attachments rather than just a count — see
 * src/lib/estimate-photo-validation.ts for how the server validates and
 * attaches them. The browser sets the multipart Content-Type/boundary
 * automatically when the body is a FormData instance; setting it by
 * hand would omit the boundary and break parsing.
 */
async function submitEstimateRequest(
  values: FormValues,
  photos: File[],
): Promise<EstimateApiResponse> {
  const formData = new FormData();
  formData.set("name", values.name);
  formData.set("phone", values.phone);
  formData.set("email", values.email);
  formData.set("city", values.city);
  formData.set("details", values.details);
  formData.set("company", values.company);
  for (const service of values.services) {
    formData.append("services", service);
  }
  for (const photo of photos) {
    formData.append("photos", photo, photo.name);
  }

  const response = await fetch("/api/estimate", {
    method: "POST",
    body: formData,
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
  const [photosProcessing, setPhotosProcessing] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const Phone = icons.phone;

  // Move focus to the status banner (failure) or the confirmation
  // panel (success) whenever a submission resolves, so keyboard and
  // screen-reader users get a clear, immediate signal of the outcome
  // instead of having to go looking for it.
  useEffect(() => {
    if (submitState === "failure") {
      statusRef.current?.focus();
    } else if (submitState === "success") {
      successRef.current?.focus();
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
    // Enter presses while a request is already in flight, and prevent
    // submitting before the browser-side photo optimization (see
    // FileUploadField's onProcessingChange) has finished — the button
    // is disabled during both, this is just a defensive backstop.
    if (submitState === "submitting" || photosProcessing) return;

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
      const result = await submitEstimateRequest(values, photos);

      if (result.ok) {
        // Clear all form state on success — the confirmation view
        // replaces the form entirely (see the render below), so this
        // also guarantees the same request can't accidentally be
        // resubmitted.
        setValues(initialValues);
        setPhotos([]);
        setErrors({});
        setStatusMessage(null);
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

  // Success replaces the entire form area with a dedicated confirmation
  // state — no form fields, submit button, or "call Percy" prompt.
  // Nothing here encourages a further action, per the approved copy.
  if (submitState === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="flex flex-col gap-6 rounded-input border border-blue bg-tint-blue px-6 py-8 text-center sm:px-10"
      >
        <div className="flex flex-col gap-3">
          <h3 className="font-display text-2xl text-foreground">
            Thanks! Your request has been sent.
          </h3>
          <p className="font-body text-base text-foreground">
            Percy will review your project details and follow up with you to
            discuss your estimate.
          </p>
        </div>

        <div className="border-t border-blue/30 pt-6">
          <p className="font-ui text-sm font-medium uppercase tracking-wide text-text-muted">
            What happens next
          </p>
          <p className="mt-2 font-body text-base text-foreground">
            Percy will contact you using the phone number or email you provided.
          </p>
        </div>
      </div>
    );
  }

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
        id="estimate-photos"
        label="Project photos (optional)"
        maxFiles={6}
        error={errors.photos}
        onFilesChange={setPhotos}
        onProcessingChange={setPhotosProcessing}
      />

      {/* Failure-only status region, focusable so it can receive focus
          programmatically on submit resolution (see the effect above).
          Success no longer renders here — it replaces the whole form
          (see the early return above) — so this region only ever needs
          to handle the "something went wrong" case, which is also the
          only case where the phone fallback should appear. */}
      <div ref={statusRef} tabIndex={-1} aria-live="assertive" role="alert">
        {submitState === "failure" && statusMessage && (
          <p className="rounded-input border border-red-500 bg-red-50 px-4 py-3 font-ui text-sm text-foreground">
            {statusMessage} Your information hasn&rsquo;t been lost — please try
            again.
            {contact.phone && (
              <> You can also reach Percy directly at {contact.phone}.</>
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
        disabled={isSubmitting || photosProcessing}
        aria-busy={isSubmitting || photosProcessing || undefined}
      >
        {isSubmitting
          ? "Sending Request..."
          : photosProcessing
            ? "Optimizing photos…"
            : "Request a Free Estimate"}
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
