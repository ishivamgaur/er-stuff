"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { PlainSubmission } from "@/lib/db/plain-submission"
import { reviewSubmissionAction } from "@/app/admin/reviews/actions"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import { AlertIcon, InboxIcon } from "@/components/icons"

type ReviewQueueProps = {
  submissions: PlainSubmission[]
}

export const ReviewQueue = ({ submissions }: ReviewQueueProps) => {
  const router = useRouter()
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  if (submissions.length === 0) {
    return (
      <Empty className="mt-6">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <InboxIcon />
          </EmptyMedia>
          <EmptyTitle>Nothing Waiting</EmptyTitle>
          <EmptyDescription>The queue is empty.</EmptyDescription>
        </EmptyHeader>
      </Empty>
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
        <Alert variant="destructive">
          <AlertIcon />
          <AlertTitle>Review Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {submissions.map((submission) => {
        const busy = busyId === submission._id
        return (
          <Card key={submission._id}>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-body">{submission.name}</CardTitle>
                <Badge variant="secondary" className="rounded-chip font-mono font-normal">
                  {submission.pricing}
                </Badge>
                <span className="ml-auto font-mono text-micro text-ink-4">
                  {submission.categorySlugs.join(", ")}
                </span>
              </div>
              <CardDescription>
                <a
                  href={submission.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-brand hover:underline"
                >
                  {submission.websiteUrl}
                </a>
                {" · sent by "}
                {submission.submittedByEmail}
                {submission.tags.length > 0 ? ` · ${submission.tags.join(", ")}` : ""}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-small leading-relaxed text-pretty text-ink-2">
                {submission.description}
              </p>

              <Input
                value={notes[submission._id] ?? ""}
                onChange={(event) =>
                  setNotes((current) => ({ ...current, [submission._id]: event.target.value }))
                }
                placeholder="Review notes, shown to the submitter on rejection…"
                aria-label={`Review notes for ${submission.name}`}
                autoComplete="off"
                spellCheck={false}
              />
            </CardContent>

            <CardFooter>
              <Button
                type="button"
                size="sm"
                onClick={() => decide(submission._id, "approved")}
                disabled={busy}
              >
                {busy && <Spinner data-icon="inline-start" />}
                Approve
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => setConfirmId(submission._id)}
                disabled={busy}
              >
                Reject
              </Button>
            </CardFooter>

            {/*
             * Rejection notifies the submitter, so it asks first. Approval
             * publishes to the queue silently and stays one click.
             */}
            <AlertDialog
              open={confirmId === submission._id}
              onOpenChange={(open) => {
                if (!open) setConfirmId(null)
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reject This Submission?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {submission.name} stays unpublished, and the submitter sees your notes with the
                    rejection.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Reviewing</AlertDialogCancel>
                  <AlertDialogAction onClick={() => decide(submission._id, "rejected")}>
                    Reject Submission
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Card>
        )
      })}
    </div>
  )
}
