"use server"

import { CATEGORIES } from "@/config/categories"
import { requireUser } from "@/lib/auth/session"
import { canSubmitMore, createSubmission, findSubmissionByWebsite } from "@/lib/db/submissions"

const CATEGORY_SLUGS = new Set(CATEGORIES.map((category) => category.slug))

const normaliseUrl = (raw: string): string | null => {
  try {
    const url = new URL(raw)
    if (url.protocol !== "https:" && url.protocol !== "http:") return null
    return url.toString()
  } catch {
    return null
  }
}

export type SubmitResult = { error: string | null; ok: boolean }

export const submitToolAction = async (formData: FormData): Promise<SubmitResult> => {
  const user = await requireUser()

  const name = String(formData.get("name") ?? "").trim()
  const rawUrl = String(formData.get("websiteUrl") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const pricing = String(formData.get("pricing") ?? "unknown")
  const tagsRaw = String(formData.get("tags") ?? "")
  const categorySlugs = formData
    .getAll("categorySlugs")
    .map((value) => String(value))
    .filter((slug) => CATEGORY_SLUGS.has(slug))

  const websiteUrl = normaliseUrl(rawUrl)

  if (name.length < 2) return { error: "Give the product a name.", ok: false }
  if (!websiteUrl) return { error: "That does not look like a valid website URL.", ok: false }
  if (description.length < 30) {
    return { error: "The description needs at least 30 characters.", ok: false }
  }
  if (categorySlugs.length === 0) {
    return { error: "Pick at least one category.", ok: false }
  }

  if (!(await canSubmitMore(user.id))) {
    return {
      error: "You have five submissions waiting for review. Wait for a decision.",
      ok: false,
    }
  }

  const duplicate = await findSubmissionByWebsite(websiteUrl, user.id)
  if (duplicate) {
    return {
      error: `You already sent ${websiteUrl} for review, it is currently ${duplicate.status}.`,
      ok: false,
    }
  }

  await createSubmission({
    name,
    websiteUrl,
    description,
    categorySlugs,
    pricing,
    tags: tagsRaw
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 10),
    bestFor: "",
    submittedById: user.id,
    submittedByEmail: user.email,
  })

  return { error: null, ok: true }
}
