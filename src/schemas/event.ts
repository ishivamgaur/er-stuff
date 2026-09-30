import { z } from "zod"

export const EVENT_TYPES = [
  "tool.view",
  "tool.outbound",
  "search.query",
  "search.click",
  "category.view",
  "bookmark.create",
  "bookmark.remove",
  "collection.create",
  "stack.generate",
  "stack.save",
  "stack.share",
  "submission.create",
  "report.create",
  "utility.open",
  "utility.action",
] as const

export type EventType = (typeof EVENT_TYPES)[number]

export const eventSchema = z.object({
  type: z.enum(EVENT_TYPES),
  toolId: z.string().nullable(),
  categoryId: z.string().nullable(),
  utilitySlug: z.string().nullable(),
  query: z.string().max(200).nullable(),
  destination: z.string().max(32).nullable(),
  reportType: z.string().max(48).nullable(),
  resultCount: z.number().int().nonnegative().nullable(),
})

export type AnalyticsEvent = z.infer<typeof eventSchema>
