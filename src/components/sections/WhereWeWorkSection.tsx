import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { serviceAreas } from "@/lib/content/service-areas";
import { icons } from "@/lib/icons";

/**
 * Map-free redesign, per approved decision: the Figma design paired this
 * copy with a static map graphic, which is intentionally omitted here
 * (no map dependency). Rebalanced as a single centered column with the
 * town list presented as a generously-spaced chip grid, closer in
 * spirit to the "30+ years" stat treatment elsewhere in the design than
 * a literal map replacement.
 *
 * QA Pass 1 correction: dark navy section background + white section
 * copy + light chips with dark text and a blue-stroke MapPin icon, to
 * bring this closer to the approved Figma treatment.
 */
export function WhereWeWorkSection() {
  const MapPin = icons.mapPin;

  return (
    <section
      id="service-area"
      className="bg-navy-deep py-16 text-white lg:py-24"
    >
      <Container className="flex flex-col items-center gap-12 text-center">
        <SectionHeading
          eyebrow="Where We Work"
          title="Serving Waynesboro and Central Virginia."
          description="Serving Waynesboro, Charlottesville, and surrounding Central Virginia communities."
          className="items-center text-center"
          eyebrowClassName="text-white"
          titleClassName="text-white"
          descriptionClassName="text-text-inverse-muted"
        />
        <ul className="flex max-w-[720px] flex-wrap items-center justify-center gap-3">
          {serviceAreas.map((area) => (
            <li
              key={area.id}
              className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 font-ui text-sm text-foreground"
            >
              <MapPin aria-hidden="true" size={18} className="text-blue" />
              {area.name}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
