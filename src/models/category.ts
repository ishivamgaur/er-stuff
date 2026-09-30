import mongoose, { Schema, type Model } from "mongoose"
import { CATEGORY_STATUSES, type CategoryStatus } from "@/schemas/category"

export type CategoryDocument = {
  _id: string
  name: string
  slug: string
  description: string
  icon: string | null
  parentId: string | null
  path: string
  order: number
  status: CategoryStatus
  createdAt: Date
  updatedAt: Date
}

const categorySchema = new Schema<CategoryDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, maxlength: 90 },
    description: { type: String, default: "", maxlength: 600 },
    icon: { type: String, default: null, maxlength: 64 },
    parentId: { type: String, default: null },
    path: { type: String, required: true, unique: true, maxlength: 400 },
    order: { type: Number, required: true, default: 0, min: 0 },
    status: { type: String, enum: CATEGORY_STATUSES, required: true, default: "active" },
  },
  { timestamps: true, versionKey: false },
)

categorySchema.index({ parentId: 1, order: 1 })
categorySchema.index({ status: 1, order: 1 })

export const CategoryModel: Model<CategoryDocument> =
  (mongoose.models.Category as Model<CategoryDocument> | undefined) ??
  mongoose.model<CategoryDocument>("Category", categorySchema)
