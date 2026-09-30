import { z } from "zod"

export const PRICING_TYPES = [
  "free",
  "freemium",
  "paid",
  "open_source",
  "free_trial",
  "contact_sales",
] as const

export const BILLING_PERIODS = ["monthly", "yearly", "one_time"] as const

export type PricingType = (typeof PRICING_TYPES)[number]
export type BillingPeriod = (typeof BILLING_PERIODS)[number]

export const pricingTypeSchema = z.enum(PRICING_TYPES)
export const billingPeriodSchema = z.enum(BILLING_PERIODS)

export const verifiedBooleanSchema = z.boolean().nullable()

export const freeTierLimitSchema = z.object({
  metric: z.string().min(1).max(120),
  value: z.string().min(1).max(120),
})

export type FreeTierLimit = z.infer<typeof freeTierLimitSchema>

export const freeTierSchema = z.object({
  available: z.boolean(),
  description: z.string().max(2000).nullable(),
  creditCardRequired: verifiedBooleanSchema,
  limits: z.array(freeTierLimitSchema).max(50),
})

export type FreeTier = z.infer<typeof freeTierSchema>

export const pricingSchema = z.object({
  type: pricingTypeSchema,
  hasFreeTier: z.boolean(),
  freeTier: freeTierSchema.nullable(),
  startingPrice: z.number().nonnegative().nullable(),
  currency: z.string().length(3).nullable(),
  billingPeriod: billingPeriodSchema.nullable(),
})

export type Pricing = z.infer<typeof pricingSchema>

export const isFreeAccess = (pricing: Pricing): boolean =>
  pricing.type === "free" ||
  pricing.type === "open_source" ||
  (pricing.type === "freemium" && pricing.hasFreeTier)
