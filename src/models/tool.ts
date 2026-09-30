import mongoose, { Schema, type Model, type Types } from "mongoose"
import {
  BILLING_PERIODS,
  PRICING_TYPES,
  type FreeTier,
  type FreeTierLimit,
  type Pricing,
} from "@/schemas/pricing"
import {
  TOOL_KINDS,
  TOOL_STATUSES,
  VERIFICATION_STATUSES,
  type Capabilities,
  type OpenSource,
  type ToolKind,
  type ToolStatus,
  type Verification,
} from "@/schemas/tool"

export type ToolDocument = {
  _id: Types.ObjectId
  name: string
  slug: string
  description: string
  websiteUrl: string
  logoUrl: string | null
  previewImageUrl: string | null
  kind: ToolKind
  categoryIds: string[]
  tags: string[]
  technologies: string[]
  integrations: string[]
  bestFor: string[]
  alternatives: string[]
  relatedTools: string[]
  featured: boolean
  sponsored: boolean
  status: ToolStatus
  pricing: Pricing
  openSource: OpenSource
  capabilities: Capabilities
  verification: Verification
  stats: { views: number; outboundClicks: number; bookmarks: number }
  createdAt: Date
  updatedAt: Date
}

const freeTierLimitSchema = new Schema<FreeTierLimit>(
  {
    metric: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false },
)

const freeTierSchema = new Schema<FreeTier>(
  {
    available: { type: Boolean, required: true },
    description: { type: String, default: null },
    creditCardRequired: { type: Boolean, default: null },
    limits: { type: [freeTierLimitSchema], default: [] },
  },
  { _id: false },
)

const pricingSchemaDefinition = new Schema<Pricing>(
  {
    type: { type: String, enum: PRICING_TYPES, required: true },
    hasFreeTier: { type: Boolean, required: true },
    freeTier: { type: freeTierSchema, default: null },
    startingPrice: { type: Number, default: null, min: 0 },
    currency: { type: String, default: null, maxlength: 3 },
    billingPeriod: { type: String, enum: BILLING_PERIODS, default: null },
  },
  { _id: false },
)

const openSourceSchemaDefinition = new Schema<OpenSource>(
  {
    isOpenSource: { type: Boolean, default: null },
    githubUrl: { type: String, default: null },
    license: { type: String, default: null, maxlength: 64 },
  },
  { _id: false },
)

const capabilitiesSchemaDefinition = new Schema<Capabilities>(
  {
    apiAvailable: { type: Boolean, default: null },
    selfHostable: { type: Boolean, default: null },
    commercialUse: { type: Boolean, default: null },
    mobile: { type: Boolean, default: null },
    web: { type: Boolean, default: null },
    desktop: { type: Boolean, default: null },
    cli: { type: Boolean, default: null },
  },
  { _id: false },
)

const verificationSchemaDefinition = new Schema<Verification>(
  {
    status: { type: String, enum: VERIFICATION_STATUSES, required: true, default: "unverified" },
    lastCheckedAt: { type: Date, default: null },
    lastVerifiedAt: { type: Date, default: null },
    verifiedBy: { type: String, default: null },
  },
  { _id: false },
)

const toolSchema = new Schema<ToolDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, maxlength: 140 },
    description: { type: String, required: true, maxlength: 1000 },
    websiteUrl: { type: String, required: true },
    logoUrl: { type: String, default: null },
    previewImageUrl: { type: String, default: null },
    kind: { type: String, enum: TOOL_KINDS, required: true, default: "product" },
    categoryIds: { type: [String], required: true },
    tags: { type: [String], default: [] },
    technologies: { type: [String], default: [] },
    integrations: { type: [String], default: [] },
    bestFor: { type: [String], default: [] },
    alternatives: { type: [String], default: [] },
    relatedTools: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    sponsored: { type: Boolean, default: false },
    status: { type: String, enum: TOOL_STATUSES, required: true, default: "draft" },
    pricing: { type: pricingSchemaDefinition, required: true },
    openSource: { type: openSourceSchemaDefinition, required: true },
    capabilities: { type: capabilitiesSchemaDefinition, required: true },
    verification: { type: verificationSchemaDefinition, required: true },
    stats: {
      views: { type: Number, default: 0, min: 0 },
      outboundClicks: { type: Number, default: 0, min: 0 },
      bookmarks: { type: Number, default: 0, min: 0 },
    },
  },
  { timestamps: true, versionKey: false },
)

toolSchema.index({ kind: 1, status: 1 })
toolSchema.index({ categoryIds: 1, status: 1, createdAt: -1 })
toolSchema.index({ categoryIds: 1, status: 1, "stats.views": -1 })
toolSchema.index({ tags: 1, status: 1 })
toolSchema.index({ alternatives: 1 })
toolSchema.index({ relatedTools: 1 })
toolSchema.index({ featured: 1, status: 1 })
toolSchema.index({ "verification.lastVerifiedAt": 1, status: 1 })
toolSchema.index({ "openSource.isOpenSource": 1, status: 1 })
toolSchema.index({ "capabilities.selfHostable": 1, status: 1 })
toolSchema.index({ kind: 1, status: 1, updatedAt: -1 })

export const ToolModel: Model<ToolDocument> =
  (mongoose.models.Tool as Model<ToolDocument> | undefined) ??
  mongoose.model<ToolDocument>("Tool", toolSchema)
