import { z } from "zod"

export const CATEGORY_STATUSES = ["active", "planned"] as const

export type CategoryStatus = (typeof CATEGORY_STATUSES)[number]

export const categorySchema = z.object({
  name: z.string().min(1).max(80),
  slug: z
    .string()
    .min(1)
    .max(90)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
  description: z.string().max(600),
  icon: z.string().max(64).nullable(),
  parentId: z.string().nullable(),
  path: z.string().min(1).max(400),
  order: z.number().int().nonnegative(),
  status: z.enum(CATEGORY_STATUSES),
})

export type Category = z.infer<typeof categorySchema>

export const buildCategoryPath = (slug: string, parentPath: string | null): string =>
  parentPath ? `${parentPath}.${slug}` : slug
