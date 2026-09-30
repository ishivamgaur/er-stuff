import type { Metadata } from "next"
import { MdHeading, MdNote } from "@/components/md/primitives"
import { SubmitForm } from "@/components/submissions/submit-form"
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
      <MdHeading level={1}>submit</MdHeading>

      <MdNote className="mt-3">
        Your listing goes into a review queue. Nothing you write appears publicly, and nothing you
        write is marked verified, until a person checks it. That is the whole point of the site, so
        please do not ask us to skip it.
      </MdNote>

      {submissions.length > 0 ? (
        <section className="mt-6">
          <MdHeading level={3}>Your submissions</MdHeading>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {submissions.map((submission) => (
              <li key={submission._id} className="flex items-baseline gap-3 py-2">
                <span className="min-w-0 flex-1 truncate text-body text-ink">
                  {submission.name}
                </span>
                <span
                  className={`shrink-0 text-micro ${
                    submission.status === "approved"
                      ? "text-accent"
                      : submission.status === "rejected"
                        ? "text-destructive"
                        : "text-ink-4"
                  }`}
                >
                  [{submission.status}]
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-7">
        <MdHeading level={2}>New submission</MdHeading>

        {allowed ? (
          <SubmitForm />
        ) : (
          <MdNote tone="warning" className="mt-3">
            You have five submissions waiting for review. Wait for a decision before sending more,
            so we are not reviewing the same thing twice.
          </MdNote>
        )}
      </section>
    </div>
  )
}
