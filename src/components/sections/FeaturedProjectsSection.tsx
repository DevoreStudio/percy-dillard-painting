import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { projects } from "@/lib/content/projects";
import { isDevPreview } from "@/lib/dev-preview";
import { ProjectCard } from "./ProjectCard";

/**
 * Every project photo is currently a design placeholder, not a real
 * completed job. Per the approved plan, placeholder photography may
 * render for local/preview visual review but must never be presented as
 * Percy's real work in a production build — so production only shows
 * projects with a real (non-placeholder) photo, and the whole section
 * disappears if none exist yet.
 */
export function FeaturedProjectsSection() {
  const visibleProjects = projects.filter(
    (project) => !project.image.isPlaceholder || isDevPreview,
  );

  if (visibleProjects.length === 0) {
    return null;
  }

  return (
    <section id="gallery" className="bg-background py-16 lg:py-24">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow="Featured Projects"
          title="Recent work around the Valley"
          titleClassName="font-bold text-foreground"
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
      </Container>
    </section>
  );
}
