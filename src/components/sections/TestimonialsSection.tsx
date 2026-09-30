import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonials } from "@/lib/content/testimonials";
import { TestimonialCard } from "./TestimonialCard";

/**
 * Real reviews only. `isVerified` stays on the Testimonial type as a
 * safety net for anything added here before it's confirmed real — the
 * filter below (and the section disappearing entirely if nothing is
 * verified) is what keeps an unconfirmed draft entry from silently
 * shipping to production. It's not gated on isDevPreview: there's no
 * "preview-only" testimonial content anymore, so there's nothing to show
 * in development that shouldn't also be safe to show in production.
 */
export function TestimonialsSection() {
  const visibleTestimonials = testimonials.filter((t) => t.isVerified);

  if (visibleTestimonials.length === 0) {
    return null;
  }

  return (
    <section id="reviews" className="bg-background py-16 lg:py-24">
      <Container className="flex flex-col gap-6">
        <SectionHeading
          eyebrow="What Clients Say"
          title="Thirty years of relationships, one job at a time."
        />
        <p className="font-ui text-sm text-text-muted">
          Real customer reviews from Angi and Nextdoor.
        </p>
        <div className="grid grid-cols-1 gap-6 pt-6 lg:grid-cols-3">
          {visibleTestimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} {...testimonial} />
          ))}
        </div>
      </Container>
    </section>
  );
}
