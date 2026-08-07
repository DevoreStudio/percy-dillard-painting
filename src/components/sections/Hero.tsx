import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { StarRating } from "@/components/ui/StarRating";
import { contact } from "@/lib/content/contact";
import { estimateFormHref } from "@/lib/content/nav";
import { testimonials } from "@/lib/content/testimonials";
import { isDevPreview } from "@/lib/dev-preview";

/**
 * The design's hero rating line ("5.0 from local homeowners...") is a
 * specific numeric business claim. Rather than ship it as static copy,
 * it's derived from verified testimonials only — with none verified yet,
 * it's hidden in production and shown with a dev tag in preview so the
 * layout can still be reviewed. See milestone report for detail.
 */
function getHeroRating() {
  const verified = testimonials.filter((t) => t.isVerified);
  if (verified.length > 0) {
    const average =
      verified.reduce((sum, t) => sum + t.rating, 0) / verified.length;
    return { rating: average, count: verified.length, isReal: true };
  }
  if (isDevPreview) {
    const average =
      testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length;
    return { rating: average, count: testimonials.length, isReal: false };
  }
  return null;
}

export function Hero() {
  const heroRating = getHeroRating();

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

          {heroRating && (
            <div className="flex items-center gap-3">
              <StarRating rating={heroRating.rating} />
              <p className="font-ui text-sm font-medium text-foreground">
                {heroRating.rating.toFixed(1)}{" "}
                <span className="font-extralight">
                  from local homeowners · free written estimates
                </span>
                {!heroRating.isReal && (
                  <span
                    data-dev-indicator="unverified-rating"
                    className="ml-2 rounded-full bg-orange/10 px-2 py-0.5 font-ui text-[10px] font-bold uppercase tracking-wide text-orange"
                  >
                    Unverified (dev)
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        <div className="relative min-w-0">
          <Image
            src="/images/hero/hero-placeholder.svg"
            alt="Placeholder hero photo — pending the approved Figma house photo asset"
            width={580}
            height={540}
            className="h-auto w-full rounded-[32px] object-cover"
            priority
          />
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
