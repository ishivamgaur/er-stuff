import { FallbackSearchProvider } from "./fallback-provider"
import type { SearchProvider } from "./types"

const VALID_PROVIDERS = ["fallback", "atlas"] as const
type ProviderName = (typeof VALID_PROVIDERS)[number]

const resolveProviderName = (): ProviderName => {
  const configured = process.env.SEARCH_PROVIDER
  return VALID_PROVIDERS.includes(configured as ProviderName)
    ? (configured as ProviderName)
    : "fallback"
}

let instance: SearchProvider | null = null

export const getSearchProvider = (): SearchProvider => {
  const name = resolveProviderName()

  if (name === "atlas") {
    throw new Error(
      "SEARCH_PROVIDER=atlas is not implemented yet. Use the fallback provider until the Atlas search index is configured.",
    )
  }

  instance ??= new FallbackSearchProvider()

  return instance
}
