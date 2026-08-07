import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { services } from "@/lib/content/services";
import { ServiceCard } from "./ServiceCard";

export function WhatWeDoSection() {
  return (
    <section id="services" className="bg-background py-16 lg:py-24">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow="What We Do"
          title={
            <>
              One crew for the whole job —<br className="hidden lg:block" />{" "}
              prep, patch, paint, cleanup.
            </>
          }
          description="Most of our work comes from homeowners who were tired of chasing separate contractors. We handle the drywall and the finish, so nothing gets blamed on the other guy."
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>
      </Container>
    </section>
  );
}
