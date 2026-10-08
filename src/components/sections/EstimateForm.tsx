"use client";

import Script from "next/script";
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

// Public by design — Cloudflare's own Turnstile docs note the site key
// is meant to be embedded in page markup/scripts, unlike the secret key
// (TURNSTILE_SECRET_KEY, used only server-side in verify-turnstile.ts).
// If unset, the widget simply doesn't render (see the conditional block
// in the JSX below) rather than crashing — the server fails closed
// regardless (a missing token is rejected the same as an invalid one),
// so this only affects whether a visitor sees the widget, not whether
// verification happens.
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// How long to wait for a first Turnstile token before giving up on the
// widget entirely (most commonly hit when the Cloudflare script never
// loads — an ad blocker, firewall, or outage), and how many consecutive
// automatic expire/error resets to attempt before giving up the same
// way (so a widget stuck failing because Cloudflare itself is
// unreachable can't loop forever). See the `turnstileUnavailable` notes
// in EstimateForm below for what "giving up" means for the visitor.
const TURNSTILE_LOAD_TIMEOUT_MS = 10_000;
const MAX_TURNSTILE_AUTO_RESETS = 2;

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
  turnstileToken: string | null,
): Promise<EstimateApiResponse> {
  const formData = new FormData();
  formData.set("name", values.name);
  formData.set("phone", values.phone);
  formData.set("email", values.email);
  formData.set("city", values.city);
  formData.set("details", values.details);
  formData.set("company", values.company);
  // Field name matches what src/app/api/estimate/route.ts reads and
  // what Cloudflare's own Turnstile examples conventionally call it —
  // see verify-turnstile.ts for server-side verification.
  formData.set("cf-turnstile-response", turnstileToken ?? "");
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

  // Cloudflare Turnstile (bot verification widget). Explicit rendering
  // (rather than the script's automatic DOM scanning) is used so the
  // widget can be reset for a fresh token after a failed submission —
  // every token is single-use, so once verify-turnstile.ts has checked
  // one (succeeding OR failing the rest of the request for some other
  // reason), it can't be reused for a retry. See resetTurnstile below.
  //
  // `turnstileUnavailable` is the escape hatch for everything that can
  // go wrong outside a normal solve/expire cycle: the Cloudflare script
  // failing to load at all (ad blocker, firewall, outage), or the
  // widget repeatedly failing/expiring faster than it can be solved
  // (e.g. Cloudflare itself being unreachable). Once set, the submit
  // button stops waiting on a token — the form becomes submittable
  // again so a real visitor is never stuck, and the server's existing,
  // honest verification_failed response (with its own phone fallback)
  // is what actually handles an unverifiable request from there. A
  // visible message here additionally gives the phone number
  // immediately, without making the visitor submit first to find it.
  const [turnstileScriptLoaded, setTurnstileScriptLoaded] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileUnavailable, setTurnstileUnavailable] = useState(false);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  const turnstileAutoResetCount = useRef(0);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileScriptLoaded || turnstileUnavailable) {
      return;
    }
    if (!turnstileContainerRef.current || turnstileWidgetId.current) return;
    if (!window.turnstile) return;

    // Gives up and surfaces the phone-fallback message after a bounded
    // number of automatic expire/error resets, rather than looping
    // forever if Cloudflare itself is unreachable (each reset attempt
    // would otherwise immediately fail again, calling this right back).
    function attemptAutoReset() {
      if (turnstileAutoResetCount.current >= MAX_TURNSTILE_AUTO_RESETS) {
        setTurnstileUnavailable(true);
        return;
      }
      turnstileAutoResetCount.current += 1;
      if (window.turnstile && turnstileWidgetId.current) {
        window.turnstile.reset(turnstileWidgetId.current);
      }
    }

    turnstileWidgetId.current = window.turnstile.render(
      turnstileContainerRef.current,
      {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token) => {
          turnstileAutoResetCount.current = 0;
          setTurnstileToken(token);
        },
        "expired-callback": () => {
          setTurnstileToken(null);
          attemptAutoReset();
        },
        "error-callback": () => {
          setTurnstileToken(null);
          attemptAutoReset();
        },
      },
    );
  }, [turnstileScriptLoaded, turnstileUnavailable]);

  // If the widget never produces a token within a reasonable window —
  // most commonly because the Cloudflare script never loaded at all —
  // stop waiting on it rather than leaving the submit button disabled
  // indefinitely.
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || turnstileToken || turnstileUnavailable) return;

    const timer = setTimeout(() => {
      setTurnstileUnavailable(true);
    }, TURNSTILE_LOAD_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [turnstileToken, turnstileUnavailable]);

  function resetTurnstile() {
    setTurnstileToken(null);
    if (turnstileUnavailable) return;
    if (window.turnstile && turnstileWidgetId.current) {
      window.turnstile.reset(turnstileWidgetId.current);
    }
  }

  // True only while a widget is configured, hasn't produced a token
  // yet, AND hasn't been given up on — once turnstileUnavailable flips
  // to true, submission is allowed through regardless of token state
  // (see the notes above turnstileUnavailable).
  const turnstilePending =
    Boolean(TURNSTILE_SITE_KEY) && !turnstileToken && !turnstileUnavailable;

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
    // Enter presses while a request is already in flight, prevent
    // submitting before the browser-side photo optimization (see
    // FileUploadField's onProcessingChange) has finished, and prevent
    // submitting before Turnstile has produced a token (when
    // configured) — the button is disabled during all three, this is
    // just a defensive backstop.
    if (submitState === "submitting" || photosProcessing || turnstilePending) {
      return;
    }

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
      const result = await submitEstimateRequest(
        values,
        photos,
        turnstileToken,
      );

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

      // Every failure path below gets a fresh Turnstile token queued up
      // — the token just submitted has already been checked by
      // Cloudflare (verify-turnstile.ts) and can't be reused, so without
      // this a retry would fail Turnstile verification even after the
      // visitor fixes whatever else was wrong.
      resetTurnstile();

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
      resetTurnstile();
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

      {/* Cloudflare Turnstile (bot verification). Rendered only when a
          site key is configured (see TURNSTILE_SITE_KEY above) — if
          it's missing, the server still fails closed on the missing
          token, this just determines whether a widget is shown. Managed
          mode usually resolves near-instantly with no visible
          challenge, so in practice this adds no friction for real
          visitors; the submit button is simply disabled for that brief
          window (see turnstilePending above). */}
      {TURNSTILE_SITE_KEY && (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            strategy="afterInteractive"
            onLoad={() => setTurnstileScriptLoaded(true)}
            onError={() => setTurnstileUnavailable(true)}
          />
          <div ref={turnstileContainerRef} />

          {/* Accessible status region for verification state changes:
              announces readiness to screen-reader users (who otherwise
              have no reliable signal that the submit button just
              became enabled — see the QA audit), and surfaces a
              VISIBLE error + phone fallback if the widget never works
              (script blocked/failed to load, or repeated expire/error
              resets gave up — see turnstileUnavailable above). This is
              deliberately not sr-only in the failure case: a visitor
              needs to see this, not just have it announced once. */}
          <div aria-live="polite" role="status">
            {turnstileUnavailable ? (
              <p className="rounded-input border border-red-500 bg-red-50 px-4 py-3 font-ui text-sm text-foreground">
                We couldn&rsquo;t load the verification check.
                {contact.phone ? (
                  <>
                    {" "}
                    You can still try submitting below — if it doesn&rsquo;t go
                    through, please call Percy directly at {contact.phone}.
                  </>
                ) : (
                  " You can still try submitting below."
                )}
              </p>
            ) : (
              turnstileToken && (
                <span className="sr-only">
                  Verification complete. You can now submit your request.
                </span>
              )
            )}
          </div>
        </>
      )}

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
        disabled={isSubmitting || photosProcessing || turnstilePending}
        aria-busy={isSubmitting || photosProcessing || undefined}
      >
        {isSubmitting
          ? "Sending Request..."
          : photosProcessing
            ? "Optimizing photos…"
            : turnstilePending
              ? "Verifying…"
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
