import type { Metadata } from "next"
import Link from "next/link"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { requireUser, isAdmin } from "@/lib/auth/session"
import { DetailList } from "@/components/tools/detail-panel"
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

  return (
    <div className="max-w-[62ch]">
      <h1 className="text-title font-bold tracking-tight text-ink">account</h1>

      <DetailList
        className="mt-5"
        rows={[
          { label: "email", value: user.email },
          {
            label: "name",
            value: user.displayName ?? user.name ?? "not set",
          },
          { label: "role", value: user.role ?? "not set" },
          {
            label: "pending",
            value: String(submissions.filter((s) => s.status === "pending").length),
          },
        ]}
      />

      <hr className="my-7" />

      <div className="space-y-2">
        <Link
          href="/submit"
          className="block text-body text-accent underline decoration-transparent decoration-from-font underline-offset-[0.3em] hover:decoration-current"
        >
          [+] List another product
        </Link>

        {isAdmin(user) ? (
          <Link
            href="/admin/reviews"
            className="block text-body text-accent underline decoration-transparent decoration-from-font underline-offset-[0.3em] hover:decoration-current"
          >
            [+] Review queue ({counts?.pending ?? 0} pending)
          </Link>
        ) : null}

        <SignOutButton />
      </div>
    </div>
  )
}
