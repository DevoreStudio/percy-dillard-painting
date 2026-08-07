import { Container } from "@/components/ui/Container";
import { contact, devPlaceholderContact } from "@/lib/content/contact";
import { isDevPreview } from "@/lib/dev-preview";
import { icons } from "@/lib/icons";
import { EstimateForm } from "./EstimateForm";
import { FaqList } from "./FaqList";

const checklist = [
  "Free, no-obligation written estimate",
  "Reply within one business day",
  "Photos help us give a tighter number",
];

function DevPlaceholderTag() {
  return (
    <span
      data-dev-indicator="unconfirmed-contact"
      className="rounded-full bg-orange/20 px-2 py-0.5 font-ui text-[10px] font-bold uppercase tracking-wide text-orange"
    >
      Dev placeholder
    </span>
  );
}

export function FaqEstimateSection() {
  const Check = icons.check;
  const Phone = icons.phone;
  const Mail = icons.mail;

  // Email is confirmed (see lib/content/contact.ts) but this fallback
  // stays in place for robustness in case it's ever unset again. Outside
  // production only, fall back to clearly-tagged dev-only placeholder
  // copy — see devPlaceholderContact. The panel intentionally shows just
  // phone + email now; location/service-area and hours are handled
  // elsewhere on the site (Where We Work section, Footer), not here.
  const displayEmail =
    contact.email ?? (isDevPreview ? devPlaceholderContact.email : null);
  const isEmailPlaceholder = !contact.email && Boolean(displayEmail);

  return (
    <section id="faq" className="bg-surface-muted py-16 lg:py-24">
      <Container className="flex flex-col gap-20">
        <FaqList />

        <div
          id="estimate"
          // Anchor offset now comes from the global `html { scroll-
          // padding-top }` rule in globals.css, which covers every
          // section anchor consistently. Do not add a scroll-margin-top
          // here too — scroll-padding-top (container) and scroll-
          // margin-top (target) stack additively, so combining them
          // would double the offset for this one target.
          className="flex flex-col overflow-hidden rounded-card shadow-lg lg:flex-row"
        >
          <div className="flex flex-col gap-10 bg-navy px-8 py-12 text-navy-foreground lg:w-[420px] lg:shrink-0 lg:px-12">
            <div className="flex flex-col gap-4">
              <p className="font-body text-xs font-bold uppercase tracking-[2.64px] text-orange">
                Free Estimate
              </p>
              <h2 className="font-display text-[40px] leading-[1.1] tracking-tight">
                Tell us about your project.
              </h2>
              <p className="font-body font-light text-text-inverse-muted">
                Send a few details and photos of the space. We&rsquo;ll follow
                up to schedule a walk through and put a real number in writing.
              </p>
            </div>

            <ul className="flex flex-col gap-4">
              {checklist.map((item) => (
                <li key={item} className="flex items-center gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-orange">
                    <Check aria-hidden="true" size={16} />
                  </span>
                  <p className="font-body font-light text-text-inverse-muted">
                    {item}
                  </p>
                </li>
              ))}
            </ul>

            {(contact.phone || displayEmail) && (
              <div className="flex flex-col gap-4 border-t border-white/20 pt-8">
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                    className="flex items-center gap-3 font-display text-xl"
                  >
                    <Phone aria-hidden="true" size={22} />
                    {contact.phone}
                  </a>
                )}

                {displayEmail && (
                  <p className="flex flex-wrap items-center gap-2 font-body font-light text-text-inverse-muted">
                    <Mail aria-hidden="true" size={18} />
                    {isEmailPlaceholder ? (
                      <span>{displayEmail}</span>
                    ) : (
                      <a href={`mailto:${displayEmail}`}>{displayEmail}</a>
                    )}
                    {isEmailPlaceholder && <DevPlaceholderTag />}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 bg-surface px-8 py-12 lg:px-12">
            <EstimateForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
