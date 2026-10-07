import type { MetadataRoute } from "next"
import { SITE_URL } from "@/config/site"
import { NAV_ITEMS } from "@/config/nav"
import { findPublishedToolSlugs } from "@/lib/db/tools"

/**
 * Plan section 45. Only pages with genuine content are listed. Private routes,
 * account pages and the review queue are absent, and no empty paginated or
 * filtered permutations are generated. Section anchors are fragments, not
 * pages, so the nav routes stand in for them here.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tools = await findPublishedToolSlugs()

  const now = new Date()

  const navRoutes: MetadataRoute.Sitemap = NAV_ITEMS.map((nav) => ({
    url: `${SITE_URL}${nav.href}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: nav.href === "/" ? 1 : 0.9,
  }))

  const staticRoutes: MetadataRoute.Sitemap = [
    ...navRoutes,
    { url: `${SITE_URL}/free`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/sponsors`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ]

  const toolRoutes: MetadataRoute.Sitemap = tools.map((slug) => ({
    url: `${SITE_URL}/tools/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  return [...staticRoutes, ...toolRoutes]
}
