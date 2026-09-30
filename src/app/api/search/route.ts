import type { NextRequest } from "next/server"
import { getSearchProvider } from "@/lib/search"
import { apiSuccess, validationFailure } from "@/lib/api/response"
import { SEARCH_LIMITS } from "@/config/constants"

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const query = (params.get("q") ?? "").trim()

  if (query.length === 0) {
    return apiSuccess({ hits: [] })
  }

  if (query.length > 200) {
    return validationFailure("Query is too long")
  }

  const limitParam = Number(params.get("limit"))
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), SEARCH_LIMITS.results)
    : SEARCH_LIMITS.results

  try {
    const hits = await getSearchProvider().search({ query, limit })

    return apiSuccess({ hits, query })
  } catch (error) {
    console.error("search failed", error)
    return apiSuccess({ hits: [], query })
  }
}
