import type { Metadata } from "next";

/** Canonical production origin — every absolute metadata URL resolves from it. */
export const SITE_URL = "https://runbolt.dev";
export const SITE_NAME = "Runbolt";
export const SITE_TITLE = "Runbolt — Automate workflows. Ship faster.";
export const SITE_DESCRIPTION =
  "Runbolt is a workflow automation platform for engineers. Build, run, and observe complex workflows with nodes, triggers, background workers, and full execution observability.";

export const OG_IMAGE_ALT = `${SITE_NAME} — workflow automation platform`;

/**
 * Served by the `opengraph-image.tsx` / `twitter-image.tsx` file conventions.
 * Referencing it explicitly keeps the card image on every route that defines
 * its own `openGraph` object (file-based images only apply to the segment
 * that declares them).
 */
export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: OG_IMAGE_ALT,
};

export interface PageMetadataInput {
  /**
   * Bare page title — the root layout template appends " — Runbolt".
   * Omit it to keep the root default (the home page).
   */
  title?: string;
  description?: string;
  /** Site-relative path, e.g. "/pricing". Used for og:url and the canonical link. */
  path?: string;
  type?: "website" | "article";
  /** Search engines must not index authenticated app routes. */
  noIndex?: boolean;
}

/** Resolves the share-title a crawler should see for a page. */
export function shareTitle(title?: string): string {
  if (!title) return SITE_TITLE;
  return title.endsWith(`— ${SITE_NAME}`) ? title : `${title} — ${SITE_NAME}`;
}

/**
 * Builds the metadata object for a route: the templated document title,
 * description, Open Graph / Twitter card fields, and (for indexable pages)
 * a canonical URL.
 */
export function pageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
  type = "website",
  noIndex = false,
}: PageMetadataInput = {}): Metadata {
  const socialTitle = shareTitle(title);
  const metadata: Metadata = {
    description,
    openGraph: {
      type,
      siteName: SITE_NAME,
      locale: "en_US",
      title: socialTitle,
      description,
      images: [OG_IMAGE],
      ...(path ? { url: path } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
    },
  };
  if (title) metadata.title = title;
  if (noIndex) metadata.robots = { index: false, follow: false };
  else if (path) metadata.alternates = { canonical: path };
  return metadata;
}
