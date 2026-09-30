import { cn } from "@/lib/utils/cn"
import type { PricingType } from "@/schemas/pricing"

const LABELS: Record<PricingType, string> = {
  free: "free",
  freemium: "freemium",
  paid: "paid",
  open_source: "open source",
  free_trial: "free trial",
  contact_sales: "contact",
}

const TONES: Record<PricingType, string> = {
  free: "text-[#3fb950]",
  freemium: "text-ink-2",
  paid: "text-ink-3",
  open_source: "text-[#a371f7]",
  free_trial: "text-[#d29922]",
  contact_sales: "text-ink-3",
}

type PricingBadgeProps = {
  type: PricingType
  className?: string
}

export const PricingBadge = ({ type, className }: PricingBadgeProps) => (
  <span
    className={cn(
      "inline-flex shrink-0 items-center text-micro whitespace-nowrap",
      TONES[type],
      className,
    )}
  >
    [{LABELS[type]}]
  </span>
)
