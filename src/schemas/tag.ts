import { z } from "zod"

export const TAG_TYPES = ["technology", "use_case", "feature", "platform"] as const

export type TagType = (typeof TAG_TYPES)[number]

export const tagSchema = z.object({
  name: z.string().min(1).max(64),
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
  type: z.enum(TAG_TYPES),
})

export type Tag = z.infer<typeof tagSchema>
