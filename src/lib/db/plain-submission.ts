import type { SubmissionDocument } from "@/models/submission"

export type PlainSubmission = Omit<
  SubmissionDocument,
  "_id" | "createdAt" | "updatedAt" | "reviewedAt"
> & {
  _id: string
  createdAt: string
  updatedAt: string
  reviewedAt: string | null
}

export const toPlainSubmission = (submission: SubmissionDocument): PlainSubmission => {
  const { _id, createdAt, updatedAt, reviewedAt, ...rest } = submission

  return {
    ...rest,
    _id: String(_id),
    createdAt: new Date(createdAt).toISOString(),
    updatedAt: new Date(updatedAt).toISOString(),
    reviewedAt: reviewedAt ? new Date(reviewedAt).toISOString() : null,
  }
}

export const toPlainSubmissions = (submissions: SubmissionDocument[]): PlainSubmission[] =>
  submissions.map(toPlainSubmission)
