import { cn } from "@/lib/utils"
import type { VerificationStatus } from "@/schemas/tool"

const LABELS: Record<VerificationStatus, string> = {
  verified: "Verified by an editor",
  needs_review: "Needs review",
  unverified: "Not verified",
}

type VerificationMarkProps = {
  status: VerificationStatus
  className?: string
}

export const VerificationMark = ({ status, className }: VerificationMarkProps) => (
  <span
    title={LABELS[status]}
    aria-label={LABELS[status]}
    className={cn(
      "size-[7px] shrink-0 rounded-full border",
      status === "verified" && "border-[#3fb950] bg-[#3fb950]",
      status === "needs_review" && "border-[#d29922] bg-[#d29922]/40",
      status === "unverified" && "border-input",
      className,
    )}
  />
)
