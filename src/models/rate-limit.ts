import mongoose, { Schema, type Model } from "mongoose"

export type RateLimitDocument = {
  _id: string
  key: string
  count: number
  resetAt: Date
}

const rateLimitSchema = new Schema<RateLimitDocument>(
  {
    key: { type: String, required: true, unique: true },
    count: { type: Number, required: true, default: 0, min: 0 },
    resetAt: { type: Date, required: true },
  },
  { versionKey: false },
)

rateLimitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 })

export const RateLimitModel: Model<RateLimitDocument> =
  (mongoose.models.RateLimit as Model<RateLimitDocument> | undefined) ??
  mongoose.model<RateLimitDocument>("RateLimit", rateLimitSchema)
