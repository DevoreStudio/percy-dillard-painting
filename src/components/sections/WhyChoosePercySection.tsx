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
            description="Percy Dillard has been painting Central Virginia homes for over thirty years. Much of his business has been built through referrals and repeat customers, which is why the details matter so much."
          />
          {/* `fill` on a fixed-aspect wrapper — see Hero.tsx for why. */}
          <div className="relative aspect-[541/280] w-full overflow-hidden rounded-card">
            <Image
              src="/images/why-choose-percy/exterior-painting-process.jpg"
              alt="Percy Dillard Painting & Drywall crew painting a home's exterior, with windows and doors masked off to protect them"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover object-[center_40%]"
            />
          </div>
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
