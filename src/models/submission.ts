import mongoose, { Schema, type Model, type Types } from "mongoose"
import { SUBMISSION_STATUSES, type SubmissionStatus } from "@/schemas/submission"

export type SubmissionDocument = {
  _id: Types.ObjectId
  name: string
  websiteUrl: string
  description: string
  categorySlugs: string[]
  pricing: string
  tags: string[]
  bestFor: string
  status: SubmissionStatus
  reviewNotes: string
  submittedById: string
  submittedByEmail: string
  reviewedById: string | null
  reviewedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const submissionSchema = new Schema<SubmissionDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    websiteUrl: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, required: true, trim: true, maxlength: 400 },
    categorySlugs: { type: [String], required: true },
    pricing: {
      type: String,
      required: true,
      enum: ["free", "freemium", "paid", "open_source", "unknown"],
    },
    tags: { type: [String], default: [] },
    bestFor: { type: String, default: "", maxlength: 300 },
    status: { type: String, enum: SUBMISSION_STATUSES, default: "pending", index: true },
    reviewNotes: { type: String, default: "", maxlength: 1000 },
    submittedById: { type: String, required: true, index: true },
    submittedByEmail: { type: String, required: true },
    reviewedById: { type: String, default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "submissions" },
)

/**
 * Never build a unique index on websiteUrl. Two vendors can legitimately claim
 * similar URLs, and a duplicate submission from one account should be caught in
 * application code where we can give a useful message, not by an index error.
 */
submissionSchema.index({ status: 1, createdAt: -1 })

export const SubmissionModel: Model<SubmissionDocument> =
  (mongoose.models.Submission as Model<SubmissionDocument> | undefined) ??
  mongoose.model<SubmissionDocument>("Submission", submissionSchema)
