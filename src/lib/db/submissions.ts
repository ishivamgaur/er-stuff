import { connectToDatabase } from "@/lib/db/connect"
import { SubmissionModel, type SubmissionDocument } from "@/models/submission"
import {
  toPlainSubmission,
  toPlainSubmissions,
  type PlainSubmission,
} from "@/lib/db/plain-submission"
import type { SubmissionStatus } from "@/schemas/submission"

const MAX_SUBMISSIONS_PER_ACCOUNT = 5

/**
 * AGENTS.md: capabilities are boolean | null, never boolean. The same applies to
 * submissions: an account gets a bounded number of pending entries so a spam
 * account cannot fill the review queue, and the cap is per account not per IP
 * so a shared office IP does not punish everyone behind it.
 */
export const countPendingForAccount = async (submittedById: string): Promise<number> => {
  await connectToDatabase()
  return SubmissionModel.countDocuments({ submittedById, status: "pending" })
}

export const canSubmitMore = async (submittedById: string): Promise<boolean> =>
  (await countPendingForAccount(submittedById)) < MAX_SUBMISSIONS_PER_ACCOUNT

export const findSubmissionByWebsite = async (
  websiteUrl: string,
  submittedById: string,
): Promise<PlainSubmission | null> => {
  await connectToDatabase()
  const existing = await SubmissionModel.findOne({
    websiteUrl,
    submittedById,
  }).lean<SubmissionDocument>()
  return existing ? toPlainSubmission(existing) : null
}

export const createSubmission = async (
  input: Omit<
    PlainSubmission,
    "_id" | "createdAt" | "updatedAt" | "reviewedAt" | "status" | "reviewNotes" | "reviewedById"
  >,
): Promise<PlainSubmission> => {
  await connectToDatabase()
  const created = await SubmissionModel.create({ ...input, status: "pending" })
  return toPlainSubmission(created.toObject())
}

export const findSubmissionsForAccount = async (
  submittedById: string,
): Promise<PlainSubmission[]> => {
  await connectToDatabase()
  const submissions = await SubmissionModel.find({ submittedById })
    .sort({ createdAt: -1 })
    .lean<SubmissionDocument[]>()
  return toPlainSubmissions(submissions)
}

export const findSubmissionsByStatus = async (
  status: SubmissionStatus,
  limit = 50,
): Promise<PlainSubmission[]> => {
  await connectToDatabase()
  const submissions = await SubmissionModel.find({ status })
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean<SubmissionDocument[]>()
  return toPlainSubmissions(submissions)
}

export const countSubmissionsByStatus = async (): Promise<Record<SubmissionStatus, number>> => {
  await connectToDatabase()
  const counts = await SubmissionModel.aggregate<{ _id: SubmissionStatus; total: number }>([
    { $group: { _id: "$status", total: { $sum: 1 } } },
  ])

  const result: Record<SubmissionStatus, number> = { pending: 0, approved: 0, rejected: 0 }
  for (const entry of counts) {
    if (entry._id in result) result[entry._id] = entry.total
  }
  return result
}

export const reviewSubmission = async (
  id: string,
  decision: Extract<SubmissionStatus, "approved" | "rejected">,
  reviewedById: string,
  reviewNotes: string,
): Promise<PlainSubmission | null> => {
  await connectToDatabase()
  const updated = await SubmissionModel.findByIdAndUpdate(
    id,
    { $set: { status: decision, reviewedById, reviewedAt: new Date(), reviewNotes } },
    { new: true },
  ).lean<SubmissionDocument>()

  return updated ? toPlainSubmission(updated) : null
}
