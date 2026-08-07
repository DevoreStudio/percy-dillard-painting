import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

// Starter sitemap — only the routes that exist today. Add an entry per
// real route as pages are built out for a project.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
