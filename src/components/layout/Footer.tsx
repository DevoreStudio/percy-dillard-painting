import { Container } from "@/components/ui/Container";
import { contact } from "@/lib/content/contact";
import { serviceAreas } from "@/lib/content/service-areas";
import { services } from "@/lib/content/services";
import { icons } from "@/lib/icons";

export function Footer() {
  const Phone = icons.phone;
  const Mail = icons.mail;
  const MapPin = icons.mapPin;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-navy-deep">
      <Container className="grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-full bg-navy font-ui text-xl font-bold text-navy-foreground">
              PD
            </span>
            <span className="font-ui text-sm font-bold text-white">
              Percy Dillard
            </span>
          </div>
          <p className="font-body text-sm text-text-inverse-muted">
            Painting &amp; drywall for homes and businesses across Waynesboro,
            Charlottesville and Central Virginia.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-ui text-sm font-bold tracking-wide text-white">
            SERVICES
          </h3>
          <ul className="flex flex-col gap-2 font-body text-sm text-text-inverse-muted">
            {services.map((service) => (
              <li key={service.id}>{service.title}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-ui text-sm font-bold tracking-wide text-white">
            SERVICE AREA
          </h3>
          <ul className="flex flex-col gap-2 font-body text-sm text-text-inverse-muted">
            {serviceAreas.map((area) => (
              <li key={area.id}>{area.name}, VA</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-ui text-sm font-bold tracking-wide text-white">
            GET IN TOUCH
          </h3>
          <ul className="flex flex-col gap-3 font-body text-sm text-text-inverse-muted">
            {contact.phone && (
              <li className="flex items-center gap-2">
                <Phone aria-hidden="true" size={18} className="text-orange" />
                <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}>
                  {contact.phone}
                </a>
              </li>
            )}
            {contact.email && (
              <li className="flex items-center gap-2">
                <Mail aria-hidden="true" size={18} className="text-orange" />
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
            )}
            <li className="flex items-center gap-2">
              <MapPin aria-hidden="true" size={18} className="text-orange" />
              Waynesboro, VA
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-border">
        <Container className="flex flex-col gap-2 py-6 font-body text-xs text-text-inverse-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} Percy Dillard Painting &amp; Drywall. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
