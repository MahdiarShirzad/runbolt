import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Authenticated app routes are also marked `noindex` in their layouts —
 * the crawler directives here keep them out of the index as well.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/workflows",
        "/executions",
        "/credentials",
        "/integrations",
        "/templates",
        "/webhooks",
        "/settings",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
