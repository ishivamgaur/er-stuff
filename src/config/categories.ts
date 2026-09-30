export type SubcategorySeed = {
  slug: string
  name: string
}

export type CategorySeed = {
  order: number
  name: string
  slug: string
  description: string
  subcategories: readonly SubcategorySeed[]
}

const subcategory = (slug: string, name: string): SubcategorySeed => ({ slug, name })

export const CATEGORIES: readonly CategorySeed[] = [
  {
    order: 1,
    name: "Design",
    slug: "design",
    description:
      "Tools for designing interfaces: inspiration, design systems, fonts, icons and colour.",
    subcategories: [
      subcategory("design-inspiration", "Design Inspiration"),
      subcategory("design-systems", "Design Systems"),
      subcategory("ui-kits", "UI Kits"),
      subcategory("fonts-typography", "Fonts"),
      subcategory("icons", "Icons"),
      subcategory("color-palettes", "Colors"),
      subcategory("illustrations-3d", "Illustrations & 3D"),
      subcategory("prototyping", "Prototyping"),
    ],
  },
  {
    order: 2,
    name: "UI Components",
    slug: "ui-components",
    description:
      "Ready-made interface pieces you drop in, including component libraries and headless primitives.",
    subcategories: [
      subcategory("react-components", "React Components"),
      subcategory("vue-components", "Vue Components"),
      subcategory("svelte-components", "Svelte Components"),
      subcategory("headless-ui", "Headless UI"),
      subcategory("tailwind-components", "Tailwind Components"),
      subcategory("forms", "Forms"),
      subcategory("tables", "Tables"),
      subcategory("charts", "Charts"),
      subcategory("animation-libraries", "Animation Libraries"),
    ],
  },
  {
    order: 3,
    name: "Frontend",
    slug: "frontend",
    description: "Frameworks and libraries for building what users see, from routing to styling.",
    subcategories: [
      subcategory("react", "React"),
      subcategory("nextjs", "Next.js"),
      subcategory("vue-nuxt", "Vue & Nuxt"),
      subcategory("svelte-sveltekit", "Svelte & SvelteKit"),
      subcategory("astro", "Astro"),
      subcategory("angular", "Angular"),
      subcategory("state-management", "State Management"),
      subcategory("data-fetching", "Data Fetching"),
      subcategory("styling-css", "Styling & CSS"),
      subcategory("accessibility", "Accessibility"),
      subcategory("frontend-testing", "Frontend Testing"),
    ],
  },
  {
    order: 4,
    name: "Backend",
    slug: "backend",
    description:
      "The server side: runtimes, frameworks, APIs, queues, email, payments and observability.",
    subcategories: [
      subcategory("nodejs", "Node.js"),
      subcategory("python", "Python"),
      subcategory("go", "Go"),
      subcategory("rust", "Rust"),
      subcategory("java-dotnet", "Java & .NET"),
      subcategory("rest-apis", "REST"),
      subcategory("graphql", "GraphQL"),
      subcategory("grpc-trpc", "gRPC & tRPC"),
      subcategory("websockets-realtime", "WebSockets"),
      subcategory("queues-background-jobs", "Queues & Background Jobs"),
      subcategory("api-gateways", "API Gateways"),
      subcategory("transactional-email", "Transactional Email"),
      subcategory("email-apis", "Email APIs"),
      subcategory("email-marketing", "Email Marketing"),
      subcategory("payment-gateways", "Payment Gateways"),
      subcategory("subscriptions-billing", "Subscriptions & Billing"),
      subcategory("invoicing-tax", "Invoicing & Tax"),
      subcategory("merchant-of-record", "Merchant of Record"),
      subcategory("web-analytics", "Web Analytics"),
      subcategory("product-analytics", "Product Analytics"),
      subcategory("session-replay", "Session Replay"),
      subcategory("feature-flags", "Feature Flags"),
      subcategory("error-tracking", "Error Tracking"),
      subcategory("apm-tracing", "APM & Tracing"),
      subcategory("uptime-monitoring", "Uptime Monitoring"),
      subcategory("incident-management", "Incident Management"),
      subcategory("logs", "Logs"),
      subcategory("object-storage", "Object Storage"),
      subcategory("file-storage", "File Storage"),
      subcategory("image-storage", "Image Storage"),
      subcategory("image-optimization", "Image Optimization"),
      subcategory("file-uploads", "File Uploads"),
      subcategory("site-search", "Site Search"),
      subcategory("full-text-search", "Full Text Search"),
      subcategory("autocomplete", "Autocomplete"),
    ],
  },
  {
    order: 5,
    name: "Database",
    slug: "database",
    description: "Where data lives, plus the tools to query, migrate, cache and inspect it.",
    subcategories: [
      subcategory("sql-databases", "SQL"),
      subcategory("nosql-databases", "NoSQL"),
      subcategory("vector-databases", "Vector Databases"),
      subcategory("caches-key-value", "Cache & Key Value"),
      subcategory("orms", "ORMs"),
      subcategory("migrations-schema", "Migrations"),
      subcategory("database-hosting", "Database Hosting"),
      subcategory("database-gui", "Database GUI"),
      subcategory("backups-monitoring", "Backups & Monitoring"),
    ],
  },
  {
    order: 6,
    name: "Authentication",
    slug: "authentication",
    description: "Signing users in and out, plus roles, permissions and identity management.",
    subcategories: [
      subcategory("auth-providers", "Auth Providers"),
      subcategory("oauth-social-login", "OAuth & Social Login"),
      subcategory("passkeys-magic-links", "Passkeys & Magic Links"),
      subcategory("rbac-permissions", "RBAC & Permissions"),
      subcategory("sso-enterprise", "SSO"),
      subcategory("user-management", "User Management"),
    ],
  },
  {
    order: 7,
    name: "Hosting",
    slug: "hosting",
    description: "Frontend and backend hosting, VPS, serverless, edge platforms and PaaS.",
    subcategories: [
      subcategory("frontend-hosting", "Frontend Hosting"),
      subcategory("backend-hosting", "Backend Hosting"),
      subcategory("vps", "VPS"),
      subcategory("serverless", "Serverless"),
      subcategory("edge-cdn", "Edge & CDN"),
      subcategory("paas", "PaaS"),
    ],
  },
  {
    order: 8,
    name: "Deployment",
    slug: "deployment",
    description:
      "Shipping code: containers, CI/CD, infrastructure as code, reverse proxies and registries.",
    subcategories: [
      subcategory("docker-containers", "Containers"),
      subcategory("ci-cd", "CI/CD"),
      subcategory("infrastructure-as-code", "Infrastructure as Code"),
      subcategory("reverse-proxies", "Reverse Proxies"),
      subcategory("process-managers", "Process Managers"),
      subcategory("deployment-platforms", "Deployment Platforms"),
    ],
  },
  {
    order: 9,
    name: "AI",
    slug: "ai",
    description:
      "Language models and the tooling around them: APIs, SDKs, coding assistants, agents and RAG.",
    subcategories: [
      subcategory("llm-apis-models", "LLM APIs & Models"),
      subcategory("ai-sdks", "AI SDKs"),
      subcategory("ai-coding-tools", "AI Coding Tools"),
      subcategory("ai-ides", "AI IDEs"),
      subcategory("ai-agents", "AI Agents"),
      subcategory("rag-retrieval", "RAG"),
      subcategory("embeddings-vector-search", "Embeddings & Vector Search"),
      subcategory("ai-evaluation", "AI Evaluation"),
      subcategory("ai-observability", "AI Observability"),
      subcategory("ai-image-video", "AI Image & Video"),
    ],
  },
  {
    order: 10,
    name: "Developer Tools",
    slug: "developer-tools",
    description:
      "The tools you work in: editors, terminals, git clients, extensions and dev containers.",
    subcategories: [
      subcategory("ides-editors", "IDEs & Editors"),
      subcategory("terminals", "Terminals"),
      subcategory("git-clients", "Git Clients"),
      subcategory("git-hosting", "Git Hosting"),
      subcategory("code-review", "Code Review"),
      subcategory("issue-tracking", "Issue Tracking"),
      subcategory("code-search", "Code Search"),
      subcategory("extensions-plugins", "Extensions"),
      subcategory("dev-containers", "Dev Containers"),
      subcategory("remote-development", "Remote Development"),
      subcategory("whiteboards", "Whiteboards"),
    ],
  },
]

export const CATEGORY_SLUGS: readonly string[] = CATEGORIES.map((category) => category.slug)

export const SUBCATEGORY_SLUGS: readonly string[] = CATEGORIES.flatMap((category) =>
  category.subcategories.map((item) => item.slug),
)

export const findCategorySeed = (slug: string): CategorySeed | undefined =>
  CATEGORIES.find((category) => category.slug === slug)
