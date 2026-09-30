"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { PlainSubmission } from "@/lib/db/plain-submission"
import { reviewSubmissionAction } from "@/app/admin/reviews/actions"

type ReviewQueueProps = {
  submissions: PlainSubmission[]
}

export const ReviewQueue = ({ submissions }: ReviewQueueProps) => {
  const router = useRouter()
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  if (submissions.length === 0) {
    return (
      <p className="mt-6 border border-line bg-field px-4 py-6 text-center text-body text-ink-3">
        Nothing waiting. The queue is empty.
      </p>
    )
  }

  const decide = async (id: string, decision: "approved" | "rejected") => {
    setBusyId(id)
    setError(null)
    const result = await reviewSubmissionAction(id, decision, notes[id] ?? "")
    if (result.error) {
      setError(result.error)
      setBusyId(null)
      return
    }
    router.refresh()
  }

  return (
    <div className="mt-6 space-y-4">
      {error ? (
        <p role="alert" className="border-l-2 border-destructive bg-field px-3 py-2 text-small">
          {error}
        </p>
      ) : null}

      {submissions.map((submission) => (
        <article key={submission._id} className="border border-line">
          <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line px-4 py-2.5">
            <h2 className="text-body font-bold text-ink">{submission.name}</h2>
            <span className="text-micro text-ink-4">[{submission.pricing}]</span>
            <span className="ml-auto text-micro text-ink-4">
              {submission.categorySlugs.join(", ")}
            </span>
          </header>

          <div className="space-y-3 px-4 py-3">
            <p className="text-small leading-relaxed text-pretty text-ink-2">
              {submission.description}
            </p>

            <dl className="grid grid-cols-1 gap-x-4 gap-y-1 text-micro sm:grid-cols-[7rem_minmax(0,1fr)]">
              <dt className="text-ink-4">url</dt>
              <dd className="min-w-0 truncate text-ink-3">
                <a
                  href={submission.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="hover:text-accent"
                >
                  {submission.websiteUrl}
                </a>
              </dd>

              <dt className="text-ink-4">sent by</dt>
              <dd className="truncate text-ink-3">{submission.submittedByEmail}</dd>

              {submission.tags.length > 0 ? (
                <>
                  <dt className="text-ink-4">tags</dt>
                  <dd className="truncate text-ink-3">{submission.tags.join(", ")}</dd>
                </>
              ) : null}
            </dl>

            <label className="block">
              <span className="sr-only">Review notes for {submission.name}</span>
              <input
                value={notes[submission._id] ?? ""}
                onChange={(event) =>
                  setNotes((current) => ({ ...current, [submission._id]: event.target.value }))
                }
                placeholder="review notes, shown to the submitter on rejection"
                className="w-full border border-line bg-field px-3 py-2 text-small text-ink outline-none transition-colors placeholder:text-ink-4 focus:border-accent"
              />
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => decide(submission._id, "approved")}
                disabled={busyId === submission._id}
                className="border border-line px-3 py-1.5 text-small text-accent transition-colors hover:bg-field disabled:opacity-50"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => decide(submission._id, "rejected")}
                disabled={busyId === submission._id}
                className="border border-line px-3 py-1.5 text-small text-destructive transition-colors hover:bg-field disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
