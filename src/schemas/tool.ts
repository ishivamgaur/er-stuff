import { z } from "zod"
import { pricingSchema } from "./pricing"

export const TOOL_KINDS = ["product", "resource"] as const
export const TOOL_STATUSES = ["draft", "published", "archived"] as const
export const VERIFICATION_STATUSES = ["verified", "needs_review", "unverified"] as const
export const VERIFICATION_FIELDS = [
  "website",
  "pricing",
  "free_tier",
  "open_source",
  "github",
  "features",
  "license",
] as const

export type ToolKind = (typeof TOOL_KINDS)[number]
export type ToolStatus = (typeof TOOL_STATUSES)[number]
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number]
export type VerificationField = (typeof VERIFICATION_FIELDS)[number]

export const toolKindSchema = z.enum(TOOL_KINDS)
export const toolStatusSchema = z.enum(TOOL_STATUSES)
export const verificationStatusSchema = z.enum(VERIFICATION_STATUSES)
export const verificationFieldSchema = z.enum(VERIFICATION_FIELDS)

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid object id")

export const openSourceSchema = z.object({
  isOpenSource: z.boolean().nullable(),
  githubUrl: z.url().nullable(),
  license: z.string().min(1).max(64).nullable(),
})

export type OpenSource = z.infer<typeof openSourceSchema>

export const capabilitiesSchema = z.object({
  apiAvailable: z.boolean().nullable(),
  selfHostable: z.boolean().nullable(),
  commercialUse: z.boolean().nullable(),
  mobile: z.boolean().nullable(),
  web: z.boolean().nullable(),
  desktop: z.boolean().nullable(),
  cli: z.boolean().nullable(),
})

export type Capabilities = z.infer<typeof capabilitiesSchema>

export const verificationSchema = z.object({
  status: verificationStatusSchema,
  lastCheckedAt: z.coerce.date().nullable(),
  lastVerifiedAt: z.coerce.date().nullable(),
  verifiedBy: z.string().nullable(),
})

export type Verification = z.infer<typeof verificationSchema>

export const toolStatsSchema = z.object({
  views: z.number().int().nonnegative(),
  outboundClicks: z.number().int().nonnegative(),
  bookmarks: z.number().int().nonnegative(),
})

export type ToolStats = z.infer<typeof toolStatsSchema>

export const toolSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z
    .string()
    .min(1)
    .max(140)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
  description: z.string().min(1).max(1000),
  websiteUrl: z.url(),
  logoUrl: z.url().nullable(),
  previewImageUrl: z.url().nullable(),
  kind: toolKindSchema,
  categoryIds: z.array(objectIdSchema).min(1).max(5),
  tags: z.array(z.string().min(1).max(64)).max(40),
  technologies: z.array(z.string().min(1).max(64)).max(60),
  integrations: z.array(z.string().min(1).max(64)).max(60),
  bestFor: z.array(z.string().min(1).max(64)).max(20),
  alternatives: z.array(objectIdSchema).max(20),
  relatedTools: z.array(objectIdSchema).max(20),
  featured: z.boolean(),
  sponsored: z.boolean(),
  status: toolStatusSchema,
  verification: verificationSchema,
})

export const toolWithPricingSchema = toolSchema.extend({
  pricing: pricingSchema,
  openSource: openSourceSchema,
  capabilities: capabilitiesSchema,
  stats: toolStatsSchema,
})

export type Tool = z.infer<typeof toolSchema>
export type ToolWithPricing = z.infer<typeof toolWithPricingSchema>
