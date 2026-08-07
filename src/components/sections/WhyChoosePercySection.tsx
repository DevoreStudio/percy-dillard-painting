import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { features } from "@/lib/content/features";
import { FeatureCard } from "./FeatureCard";

export function WhyChoosePercySection() {
  return (
    <section id="why-percy" className="bg-surface-muted py-16 lg:py-24">
      <Container className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start">
        <div className="flex flex-col gap-8">
          <SectionHeading
            eyebrow="Why people Work with us"
            title={
              <>
                A local craftsman,
                <br className="hidden lg:block" /> not a franchise.
              </>
            }
            description="Percy Dillard has been painting Central Virginia homes for over thirty years. Word of mouth is still where nearly every job comes from — which is exactly why the details matter so much to us."
          />
          <Image
            src="/images/why-choose-percy/supporting-placeholder.svg"
            alt="Placeholder supporting photo — pending a real Percy Dillard project photo"
            width={541}
            height={280}
            className="h-auto w-full rounded-card object-cover"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <FeatureCard key={feature.id} {...feature} />
          ))}
        </div>
      </Container>
    </section>
  );
}
