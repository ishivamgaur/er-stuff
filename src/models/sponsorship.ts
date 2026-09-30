import mongoose, { Schema, type Model, type Types } from "mongoose"
import {
  CAMPAIGN_STATUSES,
  PAYMENT_STATUSES,
  PLACEMENTS,
  type CampaignStatus,
  type PaymentStatus,
  type Placement,
} from "@/schemas/sponsorship"

export type CampaignDocument = {
  _id: Types.ObjectId
  toolId: string
  organizationId: string | null
  placement: Placement
  startDate: Date
  endDate: Date
  price: number
  currency: string
  status: CampaignStatus
  paymentId: string | null
  metrics: { impressions: number; clicks: number; ctr: number }
  createdById: string
  createdAt: Date
  updatedAt: Date
}

const campaignSchema = new Schema<CampaignDocument>(
  {
    toolId: { type: String, required: true },
    organizationId: { type: String, default: null },
    placement: { type: String, enum: PLACEMENTS, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    status: { type: String, enum: CAMPAIGN_STATUSES, default: "pending_payment" },
    paymentId: { type: String, default: null },
    metrics: {
      impressions: { type: Number, default: 0, min: 0 },
      clicks: { type: Number, default: 0, min: 0 },
      ctr: { type: Number, default: 0, min: 0 },
    },
    createdById: { type: String, required: true },
  },
  { timestamps: true, collection: "sponsorshipCampaigns" },
)

/**
 * Only the explore rail queries campaigns, and only those that are active
 * right now. D10: the organic query must never reach this collection.
 */
campaignSchema.index({ status: 1, startDate: 1, endDate: 1 })

export const CampaignModel: Model<CampaignDocument> =
  (mongoose.models.SponsorshipCampaign as Model<CampaignDocument> | undefined) ??
  mongoose.model<CampaignDocument>("SponsorshipCampaign", campaignSchema)

export type PaymentDocument = {
  _id: Types.ObjectId
  userId: string
  organizationId: string | null
  provider: "dodo"
  providerPaymentId: string
  type: "sponsorship"
  amount: number
  currency: string
  status: PaymentStatus
  metadata: { campaignId: string | null }
  createdAt: Date
  updatedAt: Date
}

const paymentSchema = new Schema<PaymentDocument>(
  {
    userId: { type: String, required: true },
    organizationId: { type: String, default: null },
    provider: { type: String, enum: ["dodo"], required: true },
    providerPaymentId: { type: String, required: true },
    type: { type: String, enum: ["sponsorship"], default: "sponsorship" },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    status: { type: String, enum: PAYMENT_STATUSES, default: "pending" },
    metadata: {
      campaignId: { type: String, default: null },
    },
  },
  { timestamps: true, collection: "payments" },
)

paymentSchema.index({ provider: 1, providerPaymentId: 1 }, { unique: true })

export const PaymentModel: Model<PaymentDocument> =
  (mongoose.models.Payment as Model<PaymentDocument> | undefined) ??
  mongoose.model<PaymentDocument>("Payment", paymentSchema)
