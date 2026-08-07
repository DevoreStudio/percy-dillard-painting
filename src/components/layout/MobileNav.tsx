"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { estimateFormHref } from "@/lib/content/nav";
import { icons } from "@/lib/icons";
import type { NavLink } from "@/types/content";

export type MobileNavProps = {
  navLinks: NavLink[];
  phone: string | null;
};

/**
 * Disclosure-style mobile navigation (no design reference — the Figma
 * file only specifies a 1440px desktop layout). Behavior:
 *  - Escape closes the menu and returns focus to the trigger button.
 *  - Selecting any link closes the menu.
 *  - aria-expanded / aria-controls stay in sync with open state.
 * No focus-trap library, per the approved plan — this is a single-level
 * menu so native tab order is sufficient.
 */
export function MobileNav({ navLinks, phone }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const Menu = icons.menu;
  const Close = icons.close;
  const Phone = icons.phone;

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <div className="xl:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        onClick={() => setIsOpen((open) => !open)}
        className="flex size-11 items-center justify-center rounded-full text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-blue)]"
      >
        {isOpen ? (
          <Close aria-hidden="true" size={24} />
        ) : (
          <Menu aria-hidden="true" size={24} />
        )}
      </button>

      {isOpen && (
        <div
          id={panelId}
          className="absolute inset-x-0 top-full z-50 flex flex-col gap-6 border-t border-border bg-surface px-6 py-6 shadow-lg"
        >
          <nav aria-label="Mobile">
            <ul className="flex flex-col gap-4 font-ui text-base text-foreground">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={closeMenu}
                    className="block py-1"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {phone && (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, "")}`}
              onClick={closeMenu}
              className="flex items-center gap-2 font-ui text-base text-foreground"
            >
              <Phone aria-hidden="true" size={20} />
              {phone}
            </a>
          )}

          <Button
            href={estimateFormHref}
            onClick={closeMenu}
            className="w-full"
          >
            Request a Free Estimate
          </Button>
        </div>
      )}
    </div>
  );
}
