import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqs } from "@/lib/content/faqs";
import { FaqItem } from "./FaqItem";

export function FaqList() {
  return (
    <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
      <div className="lg:w-[380px] lg:shrink-0">
        <SectionHeading
          eyebrow="Questions"
          title="Straight answers, up front."
          description="Don't see yours? Call and ask. You'll get Percy or someone on the crew, not a script."
        />
      </div>
      <div className="flex-1">
        {faqs.map((faq) => (
          <FaqItem key={faq.id} {...faq} />
        ))}
      </div>
    </div>
  );
}
