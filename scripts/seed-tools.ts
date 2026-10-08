import mongoose from "mongoose"
import { TOOL_SEEDS, type ToolSeed } from "./data/tool-seeds.ts"
import { getMongoUri } from "../src/lib/db/connect.ts"
import { CategoryModel } from "../src/models/category.ts"
import { ToolModel } from "../src/models/tool.ts"

const resolveIdBySlug = async (): Promise<Map<string, string>> => {
  const all = await CategoryModel.find({})
    .select({ _id: 1, path: 1, slug: 1 })
    .lean<Array<{ _id: mongoose.Types.ObjectId; path: string; slug: string }>>()

  const idBySlug = new Map<string, string>()
  for (const category of all) {
    idBySlug.set(category.slug, category._id.toString())
    const name = category.path.slice(category.path.lastIndexOf(".") + 1)
    if (!idBySlug.has(name)) idBySlug.set(name, category._id.toString())
  }
  return idBySlug
}

const toDocument = (seed: ToolSeed, categoryIds: string[]) => ({
  name: seed.name,
  slug: seed.slug,
  description: seed.description,
  websiteUrl: seed.websiteUrl,
  // logoUrl is captured by `db:capture-previews` and lives outside the seeds.
  // It is deliberately absent from this $set: a reseed must never clobber the
  // captured favicons back to null (that wiped all 47 once already).
  kind: "product" as const,
  categoryIds,
  tags: seed.tags,
  technologies: seed.technologies,
  integrations: [],
  bestFor: seed.bestFor,
  alternatives: [],
  relatedTools: [],
  featured: false,
  // `sponsored` keeps its schema default (false) on insert and is never
  // touched here: it is runtime state, and a reseed must not end a live
  // placement the way it once wiped the captured favicons.
  status: "published" as const,
  pricing: {
    type: seed.pricingType,
    hasFreeTier: seed.hasFreeTier,
    freeTier: seed.hasFreeTier
      ? {
          available: true,
          description: seed.freeTierDescription,
          creditCardRequired: null,
          limits: [],
        }
      : null,
    startingPrice: seed.startingPrice,
    currency: seed.currency,
    billingPeriod: seed.billingPeriod,
  },
  openSource: {
    isOpenSource: seed.isOpenSource,
    githubUrl: seed.githubUrl,
    license: seed.license,
  },
  capabilities: {
    apiAvailable: seed.apiAvailable,
    selfHostable: seed.selfHostable,
    commercialUse: seed.commercialUse,
    mobile: null,
    web: null,
    desktop: null,
    cli: null,
  },
  verification: {
    status: "unverified" as const,
    lastCheckedAt: null,
    lastVerifiedAt: null,
    verifiedBy: null,
  },
  stats: { views: 0, outboundClicks: 0, bookmarks: 0 },
})

const main = async (): Promise<void> => {
  await mongoose.connect(getMongoUri(), { bufferCommands: false })

  const idBySlug = await resolveIdBySlug()

  const operations = TOOL_SEEDS.map((seed) => {
    const ownCategoryIds = seed.categorySlugs
      .map((slug) => idBySlug.get(slug))
      .filter((id): id is string => Boolean(id))
    const document = toDocument(seed, ownCategoryIds)

    return {
      updateOne: {
        filter: { slug: seed.slug },
        update: { $set: document },
        upsert: true,
      },
    }
  })

  await ToolModel.bulkWrite(operations, { ordered: false })

  const allTools = await ToolModel.find({})
    .select({ slug: 1, _id: 1 })
    .lean<Array<{ slug: string; _id: mongoose.Types.ObjectId }>>()
  const toolIdBySlug = new Map(allTools.map((tool) => [tool.slug, tool._id.toString()]))

  const alternativeOps = TOOL_SEEDS.map((seed) => ({
    updateOne: {
      filter: { slug: seed.slug },
      update: {
        $set: {
          alternatives: seed.alternatives
            .map((slug) => toolIdBySlug.get(slug))
            .filter((id): id is string => Boolean(id)),
        },
      },
    },
  }))

  await ToolModel.bulkWrite(alternativeOps, { ordered: false })

  const total = await ToolModel.countDocuments()
  const uncategorised = await ToolModel.countDocuments({ categoryIds: { $size: 0 } })
  const verified = await ToolModel.countDocuments({ "verification.status": "verified" })
  const linked = await ToolModel.countDocuments({ alternatives: { $ne: [] } })

  process.stdout.write(
    `Seeded tools total=${total} uncategorised=${uncategorised} verified=${verified} withAlternatives=${linked}\n`,
  )

  await mongoose.disconnect()
}

await main()
