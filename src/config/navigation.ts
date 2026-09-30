export type NavigationItem = {
  label: string
  href: string
}

export const PRIMARY_NAVIGATION: readonly NavigationItem[] = [
  { label: "Explore", href: "/explore" },
  { label: "Free", href: "/free" },
  { label: "Stacks", href: "/stacks" },
  { label: "Compare", href: "/compare" },
  { label: "Utilities", href: "/utilities" },
]

export const UTILITY_GROUPS = [
  { slug: "data", name: "Data" },
  { slug: "security", name: "Security" },
  { slug: "web", name: "Web" },
  { slug: "developer", name: "Developer" },
] as const

export type UtilityGroupSlug = (typeof UTILITY_GROUPS)[number]["slug"]
