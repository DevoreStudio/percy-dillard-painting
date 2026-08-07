import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { contact } from "@/lib/content/contact";
import { estimateFormHref, navLinks } from "@/lib/content/nav";
import { icons } from "@/lib/icons";
import { MobileNav } from "./MobileNav";

export function Header() {
  const Phone = icons.phone;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <Container className="relative flex items-center justify-between py-4">
        <a href="#top" className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-navy font-ui text-xl font-bold text-navy-foreground">
            PD
          </span>
          <span className="flex flex-col font-ui text-sm">
            <span className="font-bold text-text-heading">Percy Dillard</span>
            <span className="tracking-[1.68px] text-text-subtle">
              PAINTING &amp; DRYWALL
            </span>
          </span>
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-8 font-ui text-sm text-foreground">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="hover:text-navy">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          {contact.phone && (
            <a
              href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
              className="flex items-center gap-2 font-ui text-sm text-foreground"
            >
              <Phone aria-hidden="true" size={20} />
              {contact.phone}
            </a>
          )}
          <Button href={estimateFormHref}>Request a Free Estimate</Button>
        </div>

        <MobileNav navLinks={navLinks} phone={contact.phone} />
      </Container>
    </header>
  );
}
