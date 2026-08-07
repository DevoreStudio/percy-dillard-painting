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
};

export type Project = {
  id: string;
  title: string;
  location: string;
  category: string;
  image: ProjectImage;
};

export type Testimonial = {
  id: string;
  quote: string;
  authorName: string;
  authorLocation: string;
  rating: number;
  /**
   * True only once explicitly confirmed as real customer feedback.
   * Unverified testimonials may be shown as illustrative design content
   * but must never be included in structured data (JSON-LD) or referenced
   * as real customer claims.
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
