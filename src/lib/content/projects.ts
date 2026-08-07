import type { Project } from "@/types/content";

/**
 * "Featured Projects" gallery. The design's photos read as stock/
 * lifestyle photography rather than photos of Percy's actual completed
 * jobs, so every entry ships with `image.isPlaceholder: true` and a
 * locally-generated placeholder graphic (see public/images/projects/).
 * Swap `image.src` / `image.alt` / `image.isPlaceholder` per project
 * once real job photos are supplied — no other changes needed.
 */
export const projects: Project[] = [
  {
    id: "whole-home-interior-repaint",
    title: "Whole-home interior repaint",
    location: "Crozet, VA",
    category: "Interior",
    image: {
      src: "/images/projects/whole-home-interior-repaint.svg",
      alt: "Placeholder image for the whole-home interior repaint project in Crozet, VA",
      isPlaceholder: true,
    },
  },
  {
    id: "exterior-siding-and-trim",
    title: "Exterior siding and trim",
    location: "Waynesboro, VA",
    category: "Exterior",
    image: {
      src: "/images/projects/exterior-siding-and-trim.svg",
      alt: "Placeholder image for the exterior siding and trim project in Waynesboro, VA",
      isPlaceholder: true,
    },
  },
  {
    id: "drywall-repair-and-finish",
    title: "Drywall repair and finish",
    location: "Fishersville, VA",
    category: "Drywall",
    image: {
      src: "/images/projects/drywall-repair-and-finish.svg",
      alt: "Placeholder image for the drywall repair and finish project in Fishersville, VA",
      isPlaceholder: true,
    },
  },
  {
    id: "cabinet-refinishing",
    title: "Cabinet refinishing",
    location: "Charlottesville, VA",
    category: "Cabinets",
    image: {
      src: "/images/projects/cabinet-refinishing.svg",
      alt: "Placeholder image for the cabinet refinishing project in Charlottesville, VA",
      isPlaceholder: true,
    },
  },
  {
    id: "storefront-repaint",
    title: "Storefront repaint",
    location: "Staunton, VA",
    category: "Commercial",
    image: {
      src: "/images/projects/storefront-repaint.svg",
      alt: "Placeholder image for the storefront repaint project in Staunton, VA",
      isPlaceholder: true,
    },
  },
  {
    id: "trim-and-detail-work",
    title: "Trim and detail work",
    location: "Stuarts Draft, VA",
    category: "Interior",
    image: {
      src: "/images/projects/trim-and-detail-work.svg",
      alt: "Placeholder image for the trim and detail work project in Stuarts Draft, VA",
      isPlaceholder: true,
    },
  },
];
