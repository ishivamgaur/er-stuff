import mongoose, { Schema, type Model } from "mongoose"
import { TAG_TYPES, type TagType } from "@/schemas/tag"

export type TagDocument = {
  _id: string
  name: string
  slug: string
  type: TagType
  createdAt: Date
  updatedAt: Date
}

const tagSchema = new Schema<TagDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 64 },
    slug: { type: String, required: true, unique: true, lowercase: true, maxlength: 80 },
    type: { type: String, enum: TAG_TYPES, required: true },
  },
  { timestamps: true, versionKey: false },
)

export const TagModel: Model<TagDocument> =
  (mongoose.models.Tag as Model<TagDocument> | undefined) ??
  mongoose.model<TagDocument>("Tag", tagSchema)
