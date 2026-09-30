import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { contact } from "@/lib/content/contact";
import { estimateFormHref } from "@/lib/content/nav";

export function Hero() {
  return (
    <section id="top" className="bg-background">
      <Container
        // py-24 is reserved for xl+ (true desktop, matching the approved
        // 1280px design). At lg (tablet, 1024px) the two-column layout
        // already shows a fairly tall image next to a shorter text
        // column, so keeping the full desktop vertical padding on top of
        // that stacked up to a lot of empty space before "What We Do" —
        // dropping back to py-16 through the tablet band removes that
        // without touching the 1280px+ look.
        className="grid grid-cols-1 items-center gap-12 py-16 lg:grid-cols-2 xl:py-24"
      >
        <div className="flex min-w-0 flex-col gap-6">
          <h1 className="font-display text-[40px] leading-[1.05] tracking-tight text-foreground sm:text-[54px]">
            Painting &amp; drywall done the right way.
          </h1>
          <p className="max-w-[500px] font-body text-base text-foreground">
            Thirty-plus years of interior and exterior painting, drywall repair
            and finish work for homes and businesses across Waynesboro,
            Charlottesville and the Shenandoah Valley. Careful prep, clean
            lines, honest pricing.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button href={estimateFormHref} className="w-full sm:w-auto">
              Request a Free Estimate
            </Button>
            {contact.phone && (
              <Button
                href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                variant="outline"
                className="w-full sm:w-auto"
              >
                {contact.phone}
              </Button>
            )}
          </div>

          {/*
            No numeric aggregate rating (e.g. "5.0") is shown here: the
            individual real reviews below are 5-star where their source
            shows a rating, but that doesn't establish an overall
            aggregate rating for the business, so this stays a truthful,
            non-numeric statement instead.
          */}
          <p className="font-ui text-sm font-medium text-foreground">
            Recommended by homeowners across Central Virginia
            <span className="font-extralight"> · Free written estimates</span>
          </p>
        </div>

        <div className="relative min-w-0">
          {/*
            `fill` on a fixed-aspect-ratio wrapper (matching the original
            580x540 design ratio) rather than fixed width/height props,
            since the real supplied photo isn't natively that ratio —
            this keeps the same rounded container/footprint from the
            approved design while actually cropping the photo via
            object-cover. Same pattern used in ProjectCard for
            intentional crops.
          */}
          <div className="relative aspect-[580/540] w-full overflow-hidden rounded-[32px]">
            <Image
              src="/images/hero/hero-exterior-painting.jpg"
              alt="Freshly painted white portico columns and trim on a brick home, exterior painting by Percy Dillard Painting & Drywall"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-[center_30%]"
              priority
            />
          </div>
          <div className="relative mt-6 inline-flex flex-col gap-2 self-start rounded-[44px] bg-surface px-8 py-6 shadow-lg sm:absolute sm:-bottom-6 sm:right-6 sm:mt-0 sm:h-[93px] sm:w-[302px]">
            <p className="font-display text-[32px] font-bold leading-[27px] tracking-[-0.96px] text-foreground">
              30+
            </p>
            <p className="font-body text-sm font-light uppercase tracking-[0.32px] text-foreground">
              Years of hands-on experience
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
