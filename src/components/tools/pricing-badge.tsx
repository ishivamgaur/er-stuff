import { cn } from "@/lib/utils"
import type { PricingType } from "@/schemas/pricing"

const LABELS: Record<PricingType, string> = {
  free: "Free",
  freemium: "Freemium",
  paid: "Paid",
  open_source: "Open Source",
  free_trial: "Free Trial",
  contact_sales: "Contact",
}

/*
 * Pricing as a dot plus a word, not a pill. The dot carries the one
 * meaningful state in the list — sky blue for free, gray for everything else —
 * and the word carries the detail. `free` also goes medium because it is the
 * answer most readers are scanning for.
 */
const DOT: Record<PricingType, string> = {
  free: "bg-brand",
  freemium: "bg-ink-4",
  paid: "bg-ink-4",
  open_source: "bg-ink-4",
  free_trial: "bg-ink-4",
  contact_sales: "bg-ink-4",
}

type PricingBadgeProps = {
  type: PricingType
  className?: string
}

export const PricingBadge = ({ type, className }: PricingBadgeProps) => (
  <span
    className={cn(
      "inline-flex shrink-0 items-center gap-1.5 font-mono text-micro whitespace-nowrap",
      type === "free" ? "font-medium text-ink" : "text-ink-3",
      className,
    )}
  >
    <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", DOT[type])} />
    {LABELS[type]}
  </span>
)
