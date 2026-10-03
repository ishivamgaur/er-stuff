/**
 * How the sidebar is organised.
 *
 * One heading, one list, every section with a count where the count is real.
 * The rule is that a reader should be able to answer "where do I look for the
 * kind of tool I need" without opening any single tool. Subgroup headings were
 * tried and removed: they added structure without adding information, and the
 * summed group totals could exceed the tool total because one tool can belong
 * to more than one category. Only per-category counts are shown.
 */
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

export const NAV_GROUPS = [
  {
    id: "navigation",
    heading: "Navigation",
    items: [
      { label: "Explore", href: "/explore", icon: "compass" },
      { label: "Free", href: "/free", icon: "ticket" },
      { label: "Categories", href: "/categories", icon: "layers" },
      { label: "Design", href: "/categories/design", icon: "pen" },
      { label: "UI Components", href: "/categories/ui-components", icon: "modules" },
      { label: "Frontend", href: "/categories/frontend", icon: "browser" },
      { label: "Backend", href: "/categories/backend", icon: "server" },
      { label: "Database", href: "/categories/database", icon: "database" },
      { label: "Authentication", href: "/categories/authentication", icon: "key" },
      { label: "Hosting", href: "/categories/hosting", icon: "globe" },
      { label: "Deployment", href: "/categories/deployment", icon: "launch" },
      { label: "AI", href: "/categories/ai", icon: "spark" },
      { label: "Developer Tools", href: "/categories/developer-tools", icon: "code" },
    ],
  },
] as const

export type NavGroupConfig = (typeof NAV_GROUPS)[number]
