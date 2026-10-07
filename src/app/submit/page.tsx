import type { Metadata } from "next"
import { SubmitForm } from "@/components/submissions/submit-form"
import { PageHeader } from "@/components/layout/page-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { InfoIcon } from "@/components/icons"
import { requireUser } from "@/lib/auth/session"
import { canSubmitMore, findSubmissionsForAccount } from "@/lib/db/submissions"

export const metadata: Metadata = {
  title: "List your product",
  alternates: { canonical: "/submit" },
}

export default async function SubmitPage() {
  const user = await requireUser()
  const [allowed, submissions] = await Promise.all([
    canSubmitMore(user.id),
    findSubmissionsForAccount(user.id),
  ])

  return (
    <div className="max-w-[62ch]">
      <PageHeader
        eyebrow="List your product"
        title="Submit"
        description="Your listing goes into a review queue. Nothing you write appears publicly, and nothing you write is marked verified, until a person checks it."
      />

      {submissions.length > 0 ? (
        <section className="rule py-6">
          <h2 className="label text-ink-4">Your Submissions</h2>
          <ul className="rule mt-2">
            {submissions.map((submission) => (
              <li
                key={submission._id}
                className="flex items-center gap-3 border-b border-dashed border-line py-2 last:border-b-0"
              >
                <span className="min-w-0 flex-1 truncate text-body font-medium text-ink">
                  {submission.name}
                </span>
                <Badge
                  variant={
                    submission.status === "approved"
                      ? "default"
                      : submission.status === "rejected"
                        ? "destructive"
                        : "secondary"
                  }
                  className="rounded-chip font-mono font-normal"
                >
                  {submission.status}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rule py-6">
        <h2 className="label text-ink-4">New Submission</h2>

        {allowed ? (
          <SubmitForm />
        ) : (
          <Alert className="mt-3">
            <InfoIcon />
            <AlertTitle>Queue Full</AlertTitle>
            <AlertDescription>
              You have five submissions waiting for review. Wait for a decision before sending more,
              so we are not reviewing the same thing twice.
            </AlertDescription>
          </Alert>
        )}
      </section>
    </div>
  )
}
