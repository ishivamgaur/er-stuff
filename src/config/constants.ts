export const STALE_VERIFICATION_DAYS = 90

export const PAGINATION_DEFAULT_LIMIT = 24
export const PAGINATION_MAX_LIMIT = 96
export const COMPARE_MIN_TOOLS = 2
export const COMPARE_MAX_TOOLS = 5

export const RATE_LIMITS = {
  publicRead: { limit: 60, windowMs: 60_000 },
  search: { limit: 30, windowMs: 60_000 },
  autocomplete: { limit: 20, windowMs: 60_000 },
  write: { limit: 5, windowMs: 3_600_000 },
} as const

export const SEARCH_LIMITS = {
  results: 50,
  suggestions: 8,
} as const

export const STACK_BUDGETS = ["free", "low", "flexible", "enterprise"] as const
export type StackBudget = (typeof STACK_BUDGETS)[number]

export const STACK_PROJECT_TYPES = [
  "saas",
  "portfolio",
  "ecommerce",
  "ai-app",
  "mobile-app",
  "blog",
  "marketplace",
  "api",
  "internal-tool",
] as const
export type StackProjectType = (typeof STACK_PROJECT_TYPES)[number]

export const STACK_REQUIREMENTS = [
  "authentication",
  "storage",
  "email",
  "payments",
  "analytics",
  "monitoring",
  "search",
] as const
export type StackRequirement = (typeof STACK_REQUIREMENTS)[number]
