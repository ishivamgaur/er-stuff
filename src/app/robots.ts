import type { MetadataRoute } from "next"
import { SITE_URL } from "@/config/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Account and moderation surfaces have no business in an index, and
        // the API is consumed by our own front end, not by crawlers.
        disallow: ["/api/", "/account", "/admin/", "/signin", "/signup", "/submit", "/search"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
