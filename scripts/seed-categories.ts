import mongoose from "mongoose"
import { CATEGORIES } from "../src/config/categories.ts"
import { buildCategoryPath } from "../src/schemas/category.ts"
import { getMongoUri } from "../src/lib/db/connect.ts"
import { CategoryModel } from "../src/models/category.ts"
import type { CategoryDocument } from "../src/models/category.ts"

type CategoryUpsert = Pick<
  CategoryDocument,
  "name" | "slug" | "description" | "parentId" | "path" | "order" | "status"
>

const buildCategoryUpserts = (): CategoryUpsert[] => {
  const upserts: CategoryUpsert[] = []

  for (const category of CATEGORIES) {
    upserts.push({
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: null,
      path: buildCategoryPath(category.slug, null),
      order: category.order,
      status: "active",
    })
  }

  for (const category of CATEGORIES) {
    for (const [index, subcategory] of category.subcategories.entries()) {
      upserts.push({
        name: subcategory.name,
        slug: subcategory.slug,
        description: "",
        parentId: null,
        path: buildCategoryPath(subcategory.slug, category.slug),
        order: index,
        status: "active",
      })
    }
  }

  return upserts
}

const main = async (): Promise<void> => {
  await mongoose.connect(getMongoUri(), { bufferCommands: false })

  const upserts = buildCategoryUpserts()
  const slugs = upserts.map((item) => item.slug)

  const existing = await CategoryModel.find({ slug: { $in: slugs } })
    .select({ slug: 1, _id: 1 })
    .lean<Array<{ slug: string; _id: mongoose.Types.ObjectId }>>()

  const idBySlug = new Map(existing.map((item) => [item.slug, item._id.toString()]))

  for (const upsert of upserts) {
    const parentSlug = upsert.path.includes(".")
      ? upsert.path.slice(0, upsert.path.lastIndexOf("."))
      : null

    const document = {
      ...upsert,
      parentId: parentSlug ? (idBySlug.get(parentSlug) ?? null) : null,
    }

    await CategoryModel.updateOne({ slug: upsert.slug }, { $set: document }, { upsert: true })
  }

  const total = await CategoryModel.countDocuments({ slug: { $in: slugs } })
  process.stdout.write(`Seeded ${total} categories\n`)

  await mongoose.disconnect()
}

await main()
