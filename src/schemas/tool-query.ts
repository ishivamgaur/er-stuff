import { z } from "zod"

export const TOOL_SORTS = ["popular", "newest", "updated", "name"] as const

export type ToolSort = (typeof TOOL_SORTS)[number]

export const toolSortSchema = z.enum(TOOL_SORTS)

const booleanParam = z
  .union([z.enum(["true", "false"]), z.boolean()])
  .transform((value) => value === true || value === "true")
  .optional()

const splitList = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)

const stringListParam = z
  .union([z.string(), z.array(z.string())])
  .transform((value) => (Array.isArray(value) ? value.flatMap(splitList) : splitList(value)))
  .optional()

export const toolQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(96).default(24),
  q: z.string().trim().max(200).optional(),
  kind: z.enum(["product", "resource"]).optional(),
  category: stringListParam,
  subcategory: stringListParam,
  tag: stringListParam,
  pricing: stringListParam,
  freeTier: booleanParam,
  openSource: booleanParam,
  selfHostable: booleanParam,
  api: booleanParam,
  commercialUse: booleanParam,
  sort: toolSortSchema.default("popular"),
})

export type ToolQuery = z.infer<typeof toolQuerySchema>

export type PaginatedResult<T> = {
  items: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}
