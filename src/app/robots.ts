import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

// Only the real production deployment should be crawlable. Vercel preview
// deployments (VERCEL_ENV === "preview") and local development (VERCEL_ENV
// unset) are disallowed so they don't get indexed ahead of launch.
const isProduction = process.env.VERCEL_ENV === "production";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: isProduction ? "/" : undefined,
      disallow: isProduction ? undefined : "/",
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
