import type { MetadataRoute } from "next";
import { posts } from "@/content/blog/posts";
import { docMetas } from "@/content/docs/registry";
import { SITE_URL } from "@/lib/seo";

type StaticRoute = {
  path: string;
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
};

const staticRoutes: StaticRoute[] = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/features", changeFrequency: "monthly", priority: 0.9 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.9 },
  { path: "/docs", changeFrequency: "weekly", priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/about", changeFrequency: "yearly", priority: 0.7 },
  { path: "/security", changeFrequency: "monthly", priority: 0.7 },
  { path: "/careers", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
  { path: "/register", changeFrequency: "yearly", priority: 0.6 },
  { path: "/login", changeFrequency: "yearly", priority: 0.5 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/dpa", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const docs: MetadataRoute.Sitemap = docMetas
    .filter((doc) => doc.slug !== "")
    .map((doc) => ({
      url: `${SITE_URL}${doc.path}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const blog: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...routes, ...docs, ...blog];
}
