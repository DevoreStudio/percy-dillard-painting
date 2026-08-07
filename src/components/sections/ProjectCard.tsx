import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import type { Project } from "@/types/content";

export function ProjectCard({ title, location, category, image }: Project) {
  return (
    <div className="flex flex-col overflow-hidden rounded-card border border-border bg-surface shadow-sm">
      {/* Fixed-height crop by design (400x216 in Figma), so this uses
          `fill` on a sized/positioned wrapper rather than width+height
          props — with width+height, forcing both a fluid width (w-full)
          and a fixed height independent of the image's intrinsic aspect
          ratio is exactly what triggers Next.js's image aspect-ratio
          warning. `fill` sidesteps that: the image always fills this
          box and object-cover governs the crop, no intrinsic ratio to
          preserve or violate. */}
      <div className="relative h-[216px] w-full">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        {image.isPlaceholder && (
          <span
            data-dev-indicator="placeholder-photo"
            className="absolute left-3 top-3 rounded-full bg-orange/90 px-2 py-0.5 font-ui text-[10px] font-bold uppercase tracking-wide text-orange-foreground"
          >
            Placeholder (dev)
          </span>
        )}
      </div>
      <div className="flex items-start justify-between gap-4 px-6 py-6">
        <div className="flex flex-col gap-2">
          <h3 className="font-display text-xl text-foreground">{title}</h3>
          <p className="font-body text-sm text-text-muted">{location}</p>
        </div>
        <Badge>{category}</Badge>
      </div>
    </div>
  );
}
