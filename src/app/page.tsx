import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { WhatWeDoSection } from "@/components/sections/WhatWeDoSection";
import { WhyChoosePercySection } from "@/components/sections/WhyChoosePercySection";
import { FeaturedProjectsSection } from "@/components/sections/FeaturedProjectsSection";
import { WhereWeWorkSection } from "@/components/sections/WhereWeWorkSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { FaqEstimateSection } from "@/components/sections/FaqEstimateSection";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex flex-col">
        <Hero />
        <WhatWeDoSection />
        <WhyChoosePercySection />
        <FeaturedProjectsSection />
        <WhereWeWorkSection />
        <TestimonialsSection />
        <FaqEstimateSection />
      </main>
      <Footer />
    </>
  );
}
