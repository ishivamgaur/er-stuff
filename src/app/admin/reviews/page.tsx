import type { Metadata } from "next"
import { requireAdmin } from "@/lib/auth/session"
import { countSubmissionsByStatus, findSubmissionsByStatus } from "@/lib/db/submissions"
import { ReviewQueue } from "@/components/submissions/review-queue"
import { MdHeading } from "@/components/md/primitives"

export const metadata: Metadata = {
  title: "Review queue",
  robots: { index: false, follow: false },
}

export default async function ReviewsPage() {
  await requireAdmin()
  const [pending, counts] = await Promise.all([
    findSubmissionsByStatus("pending"),
    countSubmissionsByStatus(),
  ])

  return (
    <div className="max-w-[68ch]">
      <MdHeading level={1}>reviews</MdHeading>
      <p className="mt-2 text-body text-ink-2">
        {counts.pending} pending, {counts.approved} approved, {counts.rejected} rejected.
      </p>

      <ReviewQueue submissions={pending} />
    </div>
  )
}
