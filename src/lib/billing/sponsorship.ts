import "server-only"
import type { Types } from "mongoose"
import { connectToDatabase } from "@/lib/db/connect"
import { CampaignModel, PaymentModel, type CampaignDocument } from "@/models/sponsorship"
import { campaignSchema, type CampaignInput } from "@/schemas/sponsorship"
import { SPONSORSHIP_CURRENCY, priceForWeeks } from "@/lib/billing/pricing"

export {
  SPONSORSHIP_PRICE_WEEKLY,
  SPONSORSHIP_PRICE_FOUR_WEEKS,
  priceForWeeks,
} from "@/lib/billing/pricing"

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export type PlainCampaign = Omit<
  CampaignDocument,
  "_id" | "createdAt" | "updatedAt" | "startDate" | "endDate"
> & {
  _id: string
  createdAt: string
  updatedAt: string
  startDate: string
  endDate: string
}

const toPlain = (campaign: CampaignDocument): PlainCampaign => {
  const { _id, createdAt, updatedAt, startDate, endDate, ...rest } = campaign
  return {
    ...rest,
    _id: String(_id),
    createdAt: new Date(createdAt).toISOString(),
    updatedAt: new Date(updatedAt).toISOString(),
    startDate: new Date(startDate).toISOString(),
    endDate: new Date(endDate).toISOString(),
  }
}

/**
 * Creates a campaign in `pending_payment`. It is deliberately not visible to
 * the sponsored rail, because the rail only reads active campaigns.
 */
export const createPendingCampaign = async (
  input: Omit<CampaignInput, "status" | "placement" | "currency" | "metrics" | "organizationId"> & {
    organizationId?: string | null
    weeks?: number
  },
): Promise<PlainCampaign> => {
  const weeks = input.weeks ?? 1
  const startDate = new Date()
  const endDate = new Date(startDate.getTime() + weeks * WEEK_MS)

  const parsed = campaignSchema.parse({
    toolId: input.toolId,
    organizationId: input.organizationId ?? null,
    placement: "explore_sponsored",
    startDate,
    endDate,
    price: priceForWeeks(weeks),
    currency: SPONSORSHIP_CURRENCY,
    status: "pending_payment",
    paymentId: null,
    metrics: { impressions: 0, clicks: 0, ctr: 0 },
    createdById: input.createdById,
  })

  await connectToDatabase()
  const created = await CampaignModel.create(parsed)
  return toPlain(created.toObject())
}

/**
 * The only path that may activate a campaign.
 *
 * Plan section 30: never activate a sponsorship because a browser returned
 * from checkout. The server side payment state is authoritative, so this takes
 * a provider payment id and looks the payment up itself. There is no argument
 * a caller can pass that says "the user came back from checkout, trust me".
 */
export const activateCampaignForPayment = async (
  providerPaymentId: string,
): Promise<PlainCampaign | null> => {
  await connectToDatabase()

  const payment = await PaymentModel.findOne({ providerPaymentId, status: "paid" }).lean<{
    _id: Types.ObjectId
    metadata: { campaignId: string | null }
  }>()

  const campaignId = payment?.metadata.campaignId
  if (!campaignId) return null

  const updated = await CampaignModel.findOneAndUpdate(
    { _id: campaignId, status: "pending_payment" },
    { $set: { status: "scheduled", paymentId: String(payment._id) } },
    { new: true },
  ).lean<CampaignDocument>()

  return updated ? toPlain(updated) : null
}

/**
 * Campaigns that are live right now. The sponsored rail calls only this, and
 * it filters on status and dates rather than on a denormalised boolean, so a
 * campaign that expires stops being served without a cron job.
 */
export const findActiveCampaigns = async (): Promise<PlainCampaign[]> => {
  const now = new Date()
  await connectToDatabase()
  const campaigns = await CampaignModel.find({
    status: "scheduled",
    startDate: { $lte: now },
    endDate: { $gt: now },
  })
    .sort({ endDate: 1 })
    .lean<CampaignDocument[]>()

  return campaigns.map(toPlain)
}

export const recordCampaignMetrics = async (
  campaignId: string,
  impressions: number,
  clicks: number,
): Promise<void> => {
  await connectToDatabase()
  const ctr = impressions > 0 ? clicks / impressions : 0
  await CampaignModel.updateOne(
    { _id: campaignId },
    { $set: { "metrics.impressions": impressions, "metrics.clicks": clicks, "metrics.ctr": ctr } },
  )
}
