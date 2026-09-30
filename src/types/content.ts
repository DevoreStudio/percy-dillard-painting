/**
 * Shared content types — Percy Dillard Painting & Drywall
 *
 * These types back the centralized content files in src/lib/content/.
 * Keep page/section components free of hardcoded copy: components should
 * accept this shaped data as props, and content files are the only place
 * real business content is authored.
 */

import type { IconName } from "@/lib/icons";

export type NavLink = {
  label: string;
  /** Anchor href, e.g. "#services". */
  href: string;
};

export type Service = {
  id: string;
  /** Display index as shown in the design, e.g. "01". */
  number: string;
  title: string;
  description: string;
};

export type Feature = {
  id: string;
  icon: IconName;
  title: string;
  description: string;
};

export type ProjectImage = {
  src: string;
  alt: string;
  /**
   * True until a real photo of this specific completed job replaces the
   * design placeholder. Must never be presented as real project work
   * while true — see docs/SEO-CHECKLIST.md on fabricated content.
   */
  isPlaceholder: boolean;
  /**
   * CSS `object-position` value (e.g. "center 35%") used to crop this
   * specific photo within the fixed-height gallery card. Optional:
   * ProjectCard falls back to a sane default when omitted. Exists
   * per-image rather than as one card-wide constant because the
   * gallery mixes landscape and portrait source photos — a single
   * crop position doesn't suit both.
   */
  objectPosition?: string;
};

export type Project = {
  id: string;
  title: string;
  /**
   * Null unless a specific town has been explicitly confirmed for this
   * project's photo. Do not infer a location from the general service
   * area — a real photo without a confirmed location should ship with
   * `location: null` and a generic title (e.g. "Exterior Painting" /
   * "Residential") rather than a guessed town.
   */
  location: string | null;
  category: string;
  image: ProjectImage;
};

export type Testimonial = {
  id: string;
  /** Full, verbatim quote as supplied by the customer/review source. */
  quote: string;
  /**
   * A verbatim leading excerpt of `quote`, used when the full review is
   * long enough that showing it in full would break the card grid. Must
   * be a real substring of `quote`, never a rewritten/shortened
   * paraphrase. Omit for reviews short enough to show in full.
   */
  excerpt?: string;
  authorName: string;
  authorLocation: string | null;
  /** Review platform, e.g. "Angi", "Nextdoor". */
  source: string;
  /** Attribution line for the source, e.g. "Verified Angi Review", "Nextdoor Recommendation". */
  sourceLabel: string;
  /** Display date as given by the source, e.g. "May 2022". */
  date: string;
  /**
   * Null when the source does not establish a star rating for this
   * specific review (e.g. a Nextdoor recommendation with no rating
   * widget) — never default this to a number when the source doesn't
   * show one.
   */
  rating: number | null;
  /**
   * True only once explicitly confirmed as real customer feedback.
   * Unverified testimonials may be shown as illustrative design content
   * in local/preview builds only, and must never be included in
   * structured data (JSON-LD) or referenced as real customer claims.
   */
  isVerified: boolean;
};

export type Faq = {
  id: string;
  question: string;
  /** Null until real answer copy is supplied — never fabricate. */
  answer: string | null;
};

export type ServiceArea = {
  id: string;
  name: string;
};

/**
 * Confirmed business contact details only. Any field DeVore Studio has
 * not explicitly received from Percy stays null — never fabricate a
 * value here, including by reusing placeholder text from the Figma file
 * (the phone numbers shown there, for example, both turned out to be
 * wrong).
 */
export type ContactInfo = {
  phone: string | null;
  email: string | null;
  hours: string | null;
  address: string | null;
  licenseNumber: string | null;
  insuranceDetails: string | null;
};
