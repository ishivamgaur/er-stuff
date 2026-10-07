import type { Metadata } from "next"
import { requireAdmin } from "@/lib/auth/session"
import { countSubmissionsByStatus, findSubmissionsByStatus } from "@/lib/db/submissions"
import { ReviewQueue } from "@/components/submissions/review-queue"
import { PageHeader } from "@/components/layout/page-header"

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
      <PageHeader
        eyebrow="Moderation"
        title="Reviews"
        description={`${counts.pending} pending, ${counts.approved} approved, ${counts.rejected} rejected.`}
      />

      <ReviewQueue submissions={pending} />
    </div>
  )
}
