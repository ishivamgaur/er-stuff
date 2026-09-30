import { z } from "zod"

export const SUBMISSION_STATUSES = ["pending", "approved", "rejected"] as const
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number]

export const pricingSchema = z.enum(["free", "freemium", "paid", "open_source", "unknown"])

/**
 * A submission is a vendor's claim about their own product. It is not verified
 * data. Nothing here may be promoted into the tool collection without a person
 * reviewing it, and while pending it must never be shown as verified.
 */
export const submissionSchema = z.object({
  name: z.string().min(2).max(80),
  websiteUrl: z.url().max(300),
  description: z.string().min(30).max(400),
  categorySlugs: z.array(z.string().min(1)).min(1).max(4),
  pricing: pricingSchema,
  tags: z.array(z.string().min(1).max(32)).max(10).default([]),
  bestFor: z.string().max(300).default(""),

  status: z.enum(SUBMISSION_STATUSES).default("pending"),
  reviewNotes: z.string().max(1000).default(""),

  submittedById: z.string().min(1),
  submittedByEmail: z.email(),
  reviewedById: z.string().nullable().default(null),
  reviewedAt: z.date().nullable().default(null),
})

export type SubmissionInput = z.infer<typeof submissionSchema>
