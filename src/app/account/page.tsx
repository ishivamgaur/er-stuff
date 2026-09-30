import type { Metadata } from "next"
import Link from "next/link"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { requireUser, isAdmin } from "@/lib/auth/session"
import { countSubmissionsByStatus, findSubmissionsForAccount } from "@/lib/db/submissions"
import { MdHeading, MdKeyValue, MdRule } from "@/components/md/primitives"

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
      <MdHeading level={1}>account</MdHeading>

      <MdKeyValue
        className="mt-5"
        rows={[
          { term: "email", value: user.email },
          {
            term: "name",
            value: user.displayName ?? user.name ?? "not set",
          },
          { term: "role", value: user.role ?? "not set" },
          {
            term: "pending",
            value: String(submissions.filter((s) => s.status === "pending").length),
          },
        ]}
      />

      <MdRule className="my-7" />

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
