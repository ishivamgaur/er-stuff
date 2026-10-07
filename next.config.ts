import path from "node:path"
import type { NextConfig } from "next"
import { CATEGORY_REDIRECTS } from "./src/config/nav"

/*
 * The category and explore routes were replaced by the nav pages. Old URLs
 * keep working: `/categories/<slug>` lands on the section that now owns that
 * category's subcategories, hash and all, so inbound links do not break.
 */
const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve("."),
  },
  redirects: async () => [
    { source: "/explore", destination: "/", permanent: true },
    { source: "/categories", destination: "/", permanent: true },
    ...Object.entries(CATEGORY_REDIRECTS).map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    })),
  ],
}

export default nextConfig
