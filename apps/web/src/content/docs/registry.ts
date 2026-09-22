/**
 * Documentation registry — the single source of truth for navigation,
 * search, and page metadata. Today it is static content; replacing it
 * with a real docs source later only means filling this registry from
 * that source.
 */

export type DocCategory =
  | "INTRODUCTION"
  | "CORE CONCEPTS"
  | "BUILD"
  | "DEVELOP"
  | "OPERATE"
  | "RESOURCES";

export interface DocMeta {
  slug: string; // "" = /docs home
  path: string;
  title: string;
  description: string;
  category: DocCategory;
  section: string; // breadcrumb segment, e.g. "Build"
}

export interface DocSectionNav {
  category: DocCategory;
  items: { slug: string; title: string }[];
}

export const docSections: DocSectionNav[] = [
  {
    category: "INTRODUCTION",
    items: [
      { slug: "", title: "Overview" },
      { slug: "getting-started", title: "Getting Started" },
    ],
  },
  {
    category: "CORE CONCEPTS",
    items: [
      { slug: "core-concepts", title: "Core Concepts" },
      { slug: "workflows", title: "Workflows" },
      { slug: "nodes", title: "Nodes" },
      { slug: "executions", title: "Executions" },
    ],
  },
  {
    category: "BUILD",
    items: [
      { slug: "workers", title: "Workers" },
      { slug: "webhooks", title: "Webhooks" },
      { slug: "integrations", title: "Integrations" },
    ],
  },
  {
    category: "DEVELOP",
    items: [
      { slug: "api", title: "API" },
      { slug: "sdks", title: "SDKs" },
    ],
  },
  {
    category: "OPERATE",
    items: [{ slug: "deployment", title: "Deployment" }],
  },
  {
    category: "RESOURCES",
    items: [{ slug: "troubleshooting", title: "Troubleshooting" }],
  },
];

export const docMetas: DocMeta[] = [
  { slug: "", path: "/docs", title: "Overview", description: "Start here — an introduction to Runbolt.", category: "INTRODUCTION", section: "Introduction" },
  { slug: "getting-started", path: "/docs/getting-started", title: "Getting Started", description: "Build your first Runbolt workflow in a few minutes.", category: "INTRODUCTION", section: "Introduction" },
  { slug: "core-concepts", path: "/docs/core-concepts", title: "Core Concepts", description: "Workflows, nodes, triggers, executions, and workers.", category: "CORE CONCEPTS", section: "Core Concepts" },
  { slug: "workflows", path: "/docs/workflows", title: "Workflows", description: "Design, version, and organize workflows.", category: "CORE CONCEPTS", section: "Core Concepts" },
  { slug: "nodes", path: "/docs/nodes", title: "Nodes", description: "The building blocks of every workflow.", category: "CORE CONCEPTS", section: "Core Concepts" },
  { slug: "executions", path: "/docs/executions", title: "Executions", description: "How runs are scheduled, executed, and recorded.", category: "CORE CONCEPTS", section: "Core Concepts" },
  { slug: "workers", path: "/docs/workers", title: "Workers", description: "Run long-running jobs reliably in the background.", category: "BUILD", section: "Build" },
  { slug: "webhooks", path: "/docs/webhooks", title: "Webhooks", description: "Receive events from external services in real time.", category: "BUILD", section: "Build" },
  { slug: "integrations", path: "/docs/integrations", title: "Integrations", description: "Connect Runbolt with the tools you already use.", category: "BUILD", section: "Build" },
  { slug: "api", path: "/docs/api", title: "API", description: "Control Runbolt programmatically over REST.", category: "DEVELOP", section: "Develop" },
  { slug: "sdks", path: "/docs/sdks", title: "SDKs", description: "Typed clients for TypeScript, Go, and Python.", category: "DEVELOP", section: "Develop" },
  { slug: "deployment", path: "/docs/deployment", title: "Deployment", description: "Ship workflows to environments safely.", category: "OPERATE", section: "Operate" },
  { slug: "troubleshooting", path: "/docs/troubleshooting", title: "Troubleshooting", description: "Diagnose failing executions and common errors.", category: "RESOURCES", section: "Resources" },
];

/** Flat order used for previous / next article navigation. */
export const docOrder: string[] = [
  "",
  "getting-started",
  "core-concepts",
  "workflows",
  "nodes",
  "executions",
  "workers",
  "webhooks",
  "integrations",
  "api",
  "sdks",
  "deployment",
  "troubleshooting",
];

export function getDocMeta(slug: string): DocMeta | undefined {
  return docMetas.find((m) => m.slug === slug);
}

export function getNeighbors(slug: string): { prev?: DocMeta; next?: DocMeta } {
  const index = docOrder.indexOf(slug);
  if (index === -1) return {};
  return {
    prev: index > 0 ? getDocMeta(docOrder[index - 1]) : undefined,
    next: index < docOrder.length - 1 ? getDocMeta(docOrder[index + 1]) : undefined,
  };
}

export interface SearchEntry {
  title: string;
  path: string;
  category: string;
}

/** Flat index used by the docs search palette. */
export const searchIndex: SearchEntry[] = docMetas.map((meta) => ({
  title: meta.title,
  path: meta.path,
  category: meta.category,
}));
