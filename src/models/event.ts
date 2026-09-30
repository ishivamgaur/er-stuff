import mongoose, { Schema, type Model } from "mongoose"
import { EVENT_TYPES, type EventType } from "@/schemas/event"

export type EventDocument = {
  _id: string
  type: EventType
  toolId: string | null
  categoryId: string | null
  utilitySlug: string | null
  query: string | null
  destination: string | null
  reportType: string | null
  resultCount: number | null
  createdAt: Date
}

const eventSchema = new Schema<EventDocument>(
  {
    type: { type: String, enum: EVENT_TYPES, required: true },
    toolId: { type: String, default: null },
    categoryId: { type: String, default: null },
    utilitySlug: { type: String, default: null },
    query: { type: String, default: null, maxlength: 200 },
    destination: { type: String, default: null, maxlength: 32 },
    reportType: { type: String, default: null, maxlength: 48 },
    resultCount: { type: Number, default: null, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
)

eventSchema.index({ type: 1, createdAt: -1 })
eventSchema.index({ toolId: 1, type: 1, createdAt: -1 })

export const EventModel: Model<EventDocument> =
  (mongoose.models.Event as Model<EventDocument> | undefined) ??
  mongoose.model<EventDocument>("Event", eventSchema)
