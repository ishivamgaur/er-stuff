import { z } from "zod"

export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const CAMPAIGN_STATUSES = [
  "pending_payment",
  "scheduled",
  "active",
  "completed",
  "cancelled",
] as const
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number]

export const PLACEMENTS = ["explore_sponsored"] as const
export type Placement = (typeof PLACEMENTS)[number]

/**
 * Plan section 27 and 30. A sponsorship is a finite campaign, not a
 * subscription: it has a start, an end, and it expires on its own.
 *
 * `status` starts at `pending_payment` and only the server-side webhook may
 * move it. A browser returning from checkout must never activate anything,
 * see D29.
 */
export const campaignSchema = z
  .object({
    toolId: z.string().min(1),
    organizationId: z.string().nullable().default(null),

    placement: z.enum(PLACEMENTS),
    startDate: z.date(),
    endDate: z.date(),

    price: z.number().nonnegative(),
    currency: z.string().length(3).default("USD"),

    status: z.enum(CAMPAIGN_STATUSES).default("pending_payment"),

    paymentId: z.string().nullable().default(null),

    metrics: z
      .object({
        impressions: z.number().int().nonnegative().default(0),
        clicks: z.number().int().nonnegative().default(0),
        ctr: z.number().nonnegative().default(0),
      })
      .default({ impressions: 0, clicks: 0, ctr: 0 }),

    createdById: z.string().min(1),
  })
  .refine((campaign) => campaign.endDate > campaign.startDate, {
    message: "A campaign must end after it starts",
  })

export type CampaignInput = z.infer<typeof campaignSchema>

/**
 * Provider specific fields live behind a payment service so nothing outside
 * `lib/payments` knows what Dodo's ids are called. See plan section 30.
 */
export const paymentSchema = z.object({
  userId: z.string().min(1),
  organizationId: z.string().nullable().default(null),

  provider: z.literal("dodo"),
  providerPaymentId: z.string().min(1),

  type: z.literal("sponsorship"),
  amount: z.number().nonnegative(),
  currency: z.string().length(3).default("USD"),

  status: z.enum(PAYMENT_STATUSES).default("pending"),

  metadata: z
    .object({
      campaignId: z.string().nullable().default(null),
    })
    .default({ campaignId: null }),
})

export type PaymentInput = z.infer<typeof paymentSchema>
