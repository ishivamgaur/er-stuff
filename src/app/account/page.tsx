import type { Metadata } from "next"
import Link from "next/link"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { requireUser, isAdmin } from "@/lib/auth/session"
import { DetailList } from "@/components/tools/detail-panel"
import { PageHeader } from "@/components/layout/page-header"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlusIcon } from "@/components/icons"
import { countSubmissionsByStatus, findSubmissionsForAccount } from "@/lib/db/submissions"

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
}

export default async function AccountPage() {
  const user = await requireUser()
  const [submissions, counts] = await Promise.all([
    findSubmissionsForAccount(user.id),
    isAdmin(user) ? countSubmissionsByStatus() : Promise.resolve(null),
  ])
  const pending = submissions.filter((s) => s.status === "pending").length

  return (
    <div className="max-w-[62ch]">
      <PageHeader eyebrow="Account" title="Your Account" />

      <DetailList
        rows={[
          { label: "email", value: user.email },
          {
            label: "name",
            value: user.displayName ?? user.name ?? "not set",
          },
          { label: "role", value: user.role ?? "not set" },
          { label: "pending", value: String(pending) },
        ]}
      />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Link href="/submit" className={buttonVariants()}>
          <PlusIcon data-icon="inline-start" />
          List Another Product
        </Link>

        {isAdmin(user) ? (
          <Link href="/admin/reviews" className={buttonVariants({ variant: "outline" })}>
            Review Queue
            <Badge className="ml-1 rounded-chip">{counts?.pending ?? 0} pending</Badge>
          </Link>
        ) : null}

        <SignOutButton />
      </div>
    </div>
  )
}
