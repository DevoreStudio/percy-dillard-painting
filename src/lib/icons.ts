/**
 * Lucide icon mapping — Percy Dillard Painting & Drywall
 *
 * The approved Figma design references icons from more than a dozen
 * different Iconify sets (ri, weui, material-symbols, akar-icons, uil,
 * etc.). DeVore Studio's engineering standard (see CLAUDE.md) pins
 * Lucide as the single icon library, so every icon below is the closest
 * available Lucide substitute, chosen to preserve the original icon's
 * intent and visual weight rather than to match it byte-for-byte.
 *
 * Keep this map as the single place icon choices are made — content
 * files reference icons by semantic IconName, never by importing Lucide
 * components directly, so a substitution only needs to change here.
 *
 * Mapping notes (Figma icon -> Lucide):
 *   ri:phone-fill, ic:baseline-phone       -> Phone
 *   Star (x5, hero + testimonials)         -> Star (rendered filled)
 *   uil:arrow-up (rotated 90deg)           -> ArrowRight
 *   akar-icons:calendar                    -> CalendarCheck
 *   ph:sparkle                             -> Sparkles
 *   tdesign:money                          -> Banknote
 *   material-symbols:shield-outline        -> ShieldCheck
 *   boxicons:tape                          -> Ruler (weakest match — no
 *                                              direct "tape" icon exists
 *                                              in Lucide; revisit in
 *                                              context before finalizing)
 *   lucide:handshake                       -> Handshake (already Lucide)
 *   weui:location-outlined                 -> MapPin
 *   si:quote-line                          -> Quote
 *   glyphs:chevron-bold                    -> ChevronDown
 *   majesticons:image-line                 -> ImagePlus
 *   material-symbols:check-rounded         -> Check
 *   ic:outline-email                       -> Mail
 *
 * Icons only used by the hidden/superseded "Value Cards" frame
 * (mynaui:badge, carbon:report, mynaui:home, mage:building-b) are
 * intentionally omitted — that section is not being implemented.
 *
 * `menu` / `close` are NOT from the Figma file — no mobile nav was
 * designed there. They're added here (Milestone 2) for the inferred
 * disclosure-style mobile navigation, using the same approved Lucide
 * library rather than introducing a new one.
 */

import {
  ArrowRight,
  Banknote,
  CalendarCheck,
  Check,
  ChevronDown,
  Handshake,
  ImagePlus,
  Mail,
  MapPin,
  Menu,
  Phone,
  Quote,
  Ruler,
  ShieldCheck,
  Sparkles,
  Star,
  X,
  type LucideIcon,
} from "lucide-react";

export const icons = {
  phone: Phone,
  star: Star,
  arrowRight: ArrowRight,
  calendarCheck: CalendarCheck,
  sparkles: Sparkles,
  banknote: Banknote,
  shieldCheck: ShieldCheck,
  ruler: Ruler,
  handshake: Handshake,
  mapPin: MapPin,
  quote: Quote,
  chevronDown: ChevronDown,
  imagePlus: ImagePlus,
  check: Check,
  mail: Mail,
  menu: Menu,
  close: X,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;
