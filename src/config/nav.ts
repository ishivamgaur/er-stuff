/**
 * The information architecture the reader sees.
 *
 * Two levels, and one source of truth for both views:
 * - A nav item is a route and a sidebar entry. Its page renders every section
 *   stacked, one after another.
 * - A section is a heading on that page, an anchor, and a row in the sidebar's
 *   Sections block. The sidebar and the page are built from this same array,
 *   so they can never disagree.
 *
 * Sections reference existing subcategory slugs from `./categories`. The
 * mapping is a partition: every subcategory is claimed by exactly one
 * section, enforced by `src/test/nav-config.test.ts`. Nothing in MongoDB
 * changes — tools keep their `categoryIds`, sections are a view over them.
 *
 * Counts: a section count is the number of distinct tools in its
 * subcategories, a nav count the number of distinct tools across its sections.
 * Distinct means a Set of tool ids. Never sum — see AGENTS.md 5.3.
 */
import { CATEGORIES } from "./categories"

export type NavIcon =
  | "compass"
  | "ticket"
  | "layers"
  | "pen"
  | "modules"
  | "browser"
  | "server"
  | "database"
  | "globe"
  | "launch"
  | "spark"
  | "key"
  | "code"

export type NavSection = {
  /** Anchor id: `/{nav}#{id}`. Globally unique across all nav items. */
  id: string
  label: string
  description: string
  /** Subcategory slugs from `./categories` that this section renders. */
  subcategories: readonly string[]
}

export type NavItem = {
  /** Route slug. The default nav has slug "build" but href "/", see `href`. */
  slug: string
  label: string
  /** Default nav lives at "/", every other nav at `/{slug}`. */
  href: string
  icon: NavIcon
  /** PageHeader description and metadata description. */
  description: string
  sections: readonly NavSection[]
}

const section = (
  id: string,
  label: string,
  description: string,
  subcategories: readonly string[],
): NavSection => ({ id, label, description, subcategories })

export const NAV_ITEMS: readonly NavItem[] = [
  {
    slug: "build",
    label: "Build",
    href: "/",
    icon: "code",
    description:
      "The tools you write code with: editors, terminals, AI coding, agents, git and testing.",
    sections: [
      section(
        "editors-ides",
        "Editors & IDEs",
        "Where the code gets written: editors, IDEs, extensions and dev containers.",
        [
          "ides-editors",
          "extensions-plugins",
          "dev-containers",
          "remote-development",
          "whiteboards",
        ],
      ),
      section("terminals", "Terminals", "Terminal emulators, prompts and shell tooling.", [
        "terminals",
      ]),
      section("ai-coding", "AI Coding", "AI pair programmers and AI-first editors.", [
        "ai-coding-tools",
        "ai-ides",
      ]),
      section("agents-mcp", "Agents & MCP", "Coding agents, agent runners and MCP tooling.", [
        "ai-agents",
      ]),
      section(
        "git-review",
        "Git & Code Review",
        "Git clients, hosted git and code review workflows.",
        ["git-clients", "git-hosting", "code-review"],
      ),
      section(
        "code-search-issues",
        "Code Search & Issues",
        "Searching codebases and tracking work.",
        ["code-search", "issue-tracking"],
      ),
      section("testing-e2e", "Testing & E2E", "Unit, browser and end-to-end testing tools.", [
        "frontend-testing",
      ]),
    ],
  },
  {
    slug: "components",
    label: "Components",
    href: "/components",
    icon: "modules",
    description: "Component libraries, headless primitives, forms, charts and motion.",
    sections: [
      section(
        "component-libraries",
        "Component Libraries",
        "Drop-in component libraries per framework.",
        ["react-components", "vue-components", "svelte-components", "tailwind-components"],
      ),
      section("headless-ui", "Headless UI", "Unstyled primitives you bring your own design to.", [
        "headless-ui",
      ]),
      section("forms-tables", "Forms & Tables", "Form builders, validation and data tables.", [
        "forms",
        "tables",
      ]),
      section("charts", "Charts", "Charting and data-visualisation libraries.", ["charts"]),
      section("motion", "Motion & Animation", "Animation and motion libraries for the web.", [
        "animation-libraries",
      ]),
    ],
  },
  {
    slug: "frontend",
    label: "Frontend",
    href: "/frontend",
    icon: "browser",
    description: "Frameworks, styling and state, plus the design assets they consume.",
    sections: [
      section(
        "design-inspiration",
        "Design Inspiration",
        "Galleries and references for interface ideas.",
        ["design-inspiration", "prototyping"],
      ),
      section("design-systems", "Design Systems & UI Kits", "Design systems, tokens and UI kits.", [
        "design-systems",
        "ui-kits",
      ]),
      section(
        "fonts-icons-color",
        "Fonts, Icons & Color",
        "Typography, icon sets, palettes and illustration.",
        ["fonts-typography", "icons", "color-palettes", "illustrations-3d"],
      ),
      section(
        "frameworks",
        "Frameworks",
        "UI frameworks and metaframeworks, from React to Astro.",
        ["react", "nextjs", "vue-nuxt", "svelte-sveltekit", "astro", "angular"],
      ),
      section(
        "styling-state",
        "Styling & State",
        "CSS tooling, state management and data fetching.",
        ["styling-css", "state-management", "data-fetching"],
      ),
      section(
        "accessibility",
        "Accessibility",
        "Auditing, testing and building for assistive technology.",
        ["accessibility"],
      ),
    ],
  },
  {
    slug: "backend",
    label: "Backend",
    href: "/backend",
    icon: "server",
    description: "Servers, APIs and the services around them: auth, payments, email and jobs.",
    sections: [
      section("runtimes", "Runtimes", "Language runtimes and backend frameworks.", [
        "nodejs",
        "python",
        "go",
        "rust",
        "java-dotnet",
      ]),
      section("apis", "APIs", "REST, GraphQL, tRPC, gateways and realtime transports.", [
        "rest-apis",
        "graphql",
        "grpc-trpc",
        "websockets-realtime",
        "api-gateways",
      ]),
      section("auth", "Auth", "Sign-in, identity, roles and user management.", [
        "auth-providers",
        "oauth-social-login",
        "passkeys-magic-links",
        "rbac-permissions",
        "sso-enterprise",
        "user-management",
      ]),
      section(
        "payments",
        "Payments",
        "Gateways, subscriptions, invoicing and merchant of record.",
        ["payment-gateways", "subscriptions-billing", "invoicing-tax", "merchant-of-record"],
      ),
      section("email", "Email", "Transactional, API-driven and marketing email.", [
        "transactional-email",
        "email-apis",
        "email-marketing",
      ]),
      section("queues-jobs", "Queues & Jobs", "Background jobs, queues and schedulers.", [
        "queues-background-jobs",
      ]),
    ],
  },
  {
    slug: "data",
    label: "Data",
    href: "/data",
    icon: "database",
    description: "Databases, caches, storage and search — where the data lives.",
    sections: [
      section("sql", "SQL", "Relational databases and managed Postgres and MySQL.", [
        "sql-databases",
      ]),
      section("nosql", "NoSQL", "Document, key-value and wide-column stores.", ["nosql-databases"]),
      section("vector", "Vector", "Vector databases for embeddings and RAG.", ["vector-databases"]),
      section("cache", "Cache", "In-memory caches and key-value stores.", ["caches-key-value"]),
      section(
        "orms-migrations",
        "ORMs & Migrations",
        "Query builders, ORMs and schema migration tools.",
        ["orms", "migrations-schema"],
      ),
      section(
        "db-hosting-gui",
        "Database Hosting & GUIs",
        "Managed databases, backups and database clients.",
        ["database-hosting", "database-gui", "backups-monitoring"],
      ),
      section(
        "storage-files",
        "Storage & Files",
        "Object, file and image storage with uploads and optimisation.",
        ["object-storage", "file-storage", "image-storage", "image-optimization", "file-uploads"],
      ),
      section("search", "Search", "Site search, full-text search and autocomplete.", [
        "site-search",
        "full-text-search",
        "autocomplete",
      ]),
    ],
  },
  {
    slug: "ship",
    label: "Ship",
    href: "/ship",
    icon: "launch",
    description: "Hosting, deploying and watching it run in production.",
    sections: [
      section("hosting", "Hosting", "App and infrastructure hosts: PaaS, VPS and static.", [
        "frontend-hosting",
        "backend-hosting",
        "vps",
        "paas",
      ]),
      section("serverless-edge", "Serverless & Edge", "Functions, edge runtimes and CDNs.", [
        "serverless",
        "edge-cdn",
      ]),
      section(
        "deployment",
        "Deployment",
        "Deployment platforms, reverse proxies and process managers.",
        ["deployment-platforms", "reverse-proxies", "process-managers"],
      ),
      section("ci-cd", "CI/CD", "Pipelines, builds and release automation.", ["ci-cd"]),
      section(
        "containers-iac",
        "Containers & IaC",
        "Containers, orchestration and infrastructure as code.",
        ["docker-containers", "infrastructure-as-code"],
      ),
      section(
        "monitoring-analytics",
        "Monitoring & Analytics",
        "Errors, tracing, uptime, logs, feature flags and analytics.",
        [
          "web-analytics",
          "product-analytics",
          "session-replay",
          "feature-flags",
          "error-tracking",
          "apm-tracing",
          "uptime-monitoring",
          "incident-management",
          "logs",
        ],
      ),
    ],
  },
  {
    slug: "ai",
    label: "AI",
    href: "/ai",
    icon: "spark",
    description: "Models and the infrastructure around them: APIs, SDKs, retrieval and evaluation.",
    sections: [
      section("llm-apis", "LLM APIs & Models", "Hosted models and the APIs that serve them.", [
        "llm-apis-models",
      ]),
      section("ai-sdks", "AI SDKs", "Typed SDKs and frameworks for calling models.", ["ai-sdks"]),
      section(
        "rag-embeddings",
        "RAG & Embeddings",
        "Retrieval, embeddings and vector search for models.",
        ["rag-retrieval", "embeddings-vector-search"],
      ),
      section(
        "eval-observability",
        "Evaluation & Observability",
        "Evals, tracing and cost or latency monitoring for AI.",
        ["ai-evaluation", "ai-observability"],
      ),
      section("image-video", "Image & Video", "Generative image and video models and tools.", [
        "ai-image-video",
      ]),
    ],
  },
]

/** The nav item the homepage renders. */
export const DEFAULT_NAV: NavItem = NAV_ITEMS[0] as NavItem

/** Route files look themselves up once, at module scope. Throws on a typo. */
export const navItem = (slug: string): NavItem => {
  const found = NAV_ITEMS.find((item) => item.slug === slug)
  if (!found) throw new Error(`Unknown nav item: ${slug}`)
  return found
}

/** Every section flattened, in nav order. */
export const ALL_SECTIONS: readonly { nav: NavItem; section: NavSection }[] = NAV_ITEMS.flatMap(
  (nav) => nav.sections.map((entry) => ({ nav, section: entry })),
)

/** Exact route match: nav items own their route entirely, none has children. */
export const findNavItemByPathname = (pathname: string): NavItem | undefined =>
  NAV_ITEMS.find((nav) => nav.href === pathname)

/** `/#id` or `/{slug}#id` — a shareable link to one section. */
export const sectionHref = (nav: NavItem, sectionId: string): string => `${nav.href}#${sectionId}`

export const findSectionById = (sectionId: string): NavSection | undefined =>
  ALL_SECTIONS.find((entry) => entry.section.id === sectionId)?.section

/** Reverse lookup: which section owns this subcategory? Used by tool pages. */
export const findSectionForSubcategory = (
  subcategorySlug: string,
): { nav: NavItem; section: NavSection } | undefined =>
  ALL_SECTIONS.find((entry) => entry.section.subcategories.includes(subcategorySlug))

/**
 * Permanent redirects for the removed category routes. Each old top-level
 * category slug points at the section that now owns its subcategories — the
 * first section, in nav order, claiming any of them.
 */
export const CATEGORY_REDIRECTS: Readonly<Record<string, string>> = Object.fromEntries(
  CATEGORIES.map((category) => {
    const owner = category.subcategories
      .map((sub) => findSectionForSubcategory(sub.slug))
      .find((entry) => entry !== undefined)
    const target = owner ? sectionHref(owner.nav, owner.section.id) : "/"
    return [`/categories/${category.slug}`, target]
  }),
)
