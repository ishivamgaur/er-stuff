import type { NextRequest } from "next/server"
import { getSearchProvider } from "@/lib/search"
import { apiSuccess } from "@/lib/api/response"
import { SEARCH_LIMITS } from "@/config/constants"

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const prefix = (params.get("q") ?? "").trim()

  if (prefix.length < 2) {
    return apiSuccess({ suggestions: [] })
  }

  try {
    const suggestions = await getSearchProvider().suggest(prefix, SEARCH_LIMITS.suggestions)

    return apiSuccess({ suggestions })
  } catch (error) {
    console.error("autocomplete failed", error)
    return apiSuccess({ suggestions: [] })
  }
}
