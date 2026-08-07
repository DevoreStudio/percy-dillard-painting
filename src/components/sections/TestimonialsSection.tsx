import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonials } from "@/lib/content/testimonials";
import { isDevPreview } from "@/lib/dev-preview";
import { TestimonialCard } from "./TestimonialCard";

/**
 * None of the testimonials in lib/content/testimonials.ts have been
 * confirmed as real customer feedback yet (isVerified: false). Per the
 * approved plan they may render for local/preview visual review with a
 * dev-only "Unverified" badge, but must not silently become production
 * content — so production only shows verified testimonials, and the
 * section itself disappears if none exist yet.
 */
export function TestimonialsSection() {
  const visibleTestimonials = testimonials.filter(
    (t) => t.isVerified || isDevPreview,
  );

  if (visibleTestimonials.length === 0) {
    return null;
  }

  return (
    <section id="reviews" className="bg-background py-16 lg:py-24">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow="What My Clients Say"
          title="Thirty years of relationships, one job at a time."
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {visibleTestimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} {...testimonial} />
          ))}
        </div>
      </Container>
    </section>
  );
}
