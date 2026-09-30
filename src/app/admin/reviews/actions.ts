"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth/session"
import { reviewSubmission } from "@/lib/db/submissions"

export type ReviewResult = { error: string | null }

export const reviewSubmissionAction = async (
  id: string,
  decision: "approved" | "rejected",
  reviewNotes: string,
): Promise<ReviewResult> => {
  const admin = await requireAdmin()

  if (decision !== "approved" && decision !== "rejected") {
    return { error: "Unknown decision." }
  }

  const updated = await reviewSubmission(id, decision, admin.id, reviewNotes.slice(0, 1000))

  if (!updated) {
    return { error: "That submission no longer exists." }
  }

  revalidatePath("/admin/reviews")
  return { error: null }
}
