import type { Project } from "@/types/content";

/**
 * "Featured Projects" gallery — real photos of Percy's completed work,
 * supplied directly by Corey.
 *
 * Expanded from 3 to 6 projects to show a more balanced mix of
 * residential exterior, residential interior, commercial interior, and
 * trim/detail work (previously every card was exterior, which made the
 * business look narrower than it is). The 3 new photos (interior room,
 * commercial interior, exterior siding/window) are real completed-job
 * photos; two other supplied photos (an active jobsite still mid-
 * project, and an exterior shot of a painted fence) were deliberately
 * NOT used here per instruction, since neither reads as a finished,
 * presentable project shot.
 *
 * None of these photos came with a confirmed street address or town, so
 * `location` is deliberately `null` and titles stay generic ("Exterior
 * Painting" / "Residential") rather than guessing a place. Do not
 * assign a location to any of these without explicit confirmation.
 *
 * `image.objectPosition`: the 3 new source photos are portrait-oriented
 * (interior/commercial room shots and a vertical siding-and-window
 * shot), cropped into this gallery's landscape card shape. Each value
 * below was chosen to keep the specific detail called out for that
 * photo in frame — see the comment on each project.
 */
export const projects: Project[] = [
  {
    id: "exterior-trim-and-portico-painting",
    title: "Exterior Trim & Portico Painting",
    location: null,
    category: "Exterior",
    image: {
      src: "/images/projects/exterior-trim-painting-1.jpg",
      alt: "Painted exterior trim and portico on a brick home",
      isPlaceholder: false,
    },
  },
  {
    id: "commercial-interior-painting",
    title: "Commercial Interior Painting",
    location: null,
    category: "Commercial",
    image: {
      src: "/images/projects/commercial-interior-painting.jpg",
      alt: "Finished commercial interior with painted walls and white trim",
      isPlaceholder: false,
      // Source photo is a portrait shot of a wide commercial room.
      // Biased toward the top of the frame to keep the painted walls,
      // trim, and open room in view rather than letting the (much less
      // interesting) foreground floor dominate the crop.
      objectPosition: "center 20%",
    },
  },
  {
    id: "interior-painting-trim",
    title: "Interior Painting & Trim",
    location: null,
    category: "Interior",
    image: {
      src: "/images/projects/interior-painting-trim.jpg",
      alt: "Interior room with freshly painted walls and white trim",
      isPlaceholder: false,
      // Source photo is a portrait shot of a room corner. Biased
      // toward the lower half of the frame to keep the painted wall,
      // corner line, baseboard, and floor transition in view, rather
      // than the window/outdoor view visible at the very top.
      objectPosition: "center 65%",
    },
  },
  {
    id: "residential-exterior-repaint",
    title: "Residential Exterior Repaint",
    location: null,
    category: "Exterior",
    image: {
      src: "/images/projects/exterior-painting-2.jpg",
      alt: "Repainted two-story residential exterior and porch",
      isPlaceholder: false,
    },
  },
  {
    id: "entry-and-trim-repair",
    title: "Entry & Trim Repair",
    location: null,
    category: "Exterior",
    image: {
      src: "/images/projects/exterior-trim-repair.jpg",
      alt: "Exterior entry and trim repair project",
      isPlaceholder: false,
    },
  },
  {
    id: "exterior-siding-trim-painting",
    title: "Exterior Siding & Trim Painting",
    location: null,
    category: "Exterior",
    image: {
      src: "/images/projects/exterior-siding-trim.jpg",
      alt: "Painted exterior siding with white window trim",
      isPlaceholder: false,
      // Source photo already reads as landscape once correctly
      // oriented; nudged slightly above true center so the window's
      // full trim stays clearly visible rather than being cut at the
      // bottom of the card.
      objectPosition: "center 45%",
    },
  },
];
