import type { MetadataRoute } from "next"
import { SITE_URL } from "@/config/site"
import { CATEGORIES } from "@/config/categories"
import { findPublishedToolSlugs } from "@/lib/db/tools"

/**
 * Plan section 45. Only pages with genuine content are listed. Private routes,
 * account pages and the review queue are absent, and no empty paginated or
 * filtered permutations are generated.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tools = await findPublishedToolSlugs()

  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/explore`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/free`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/sponsors`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ]

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${SITE_URL}/categories/${category.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  const toolRoutes: MetadataRoute.Sitemap = tools.map((slug) => ({
    url: `${SITE_URL}/tools/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  return [...staticRoutes, ...categoryRoutes, ...toolRoutes]
}
