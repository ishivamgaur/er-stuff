import { cn } from "@/lib/utils"

type VerifiedStateProps = {
  value: boolean | null
  trueLabel: string
  falseLabel: string
  className?: string
}

/*
 * A capability value. Unknown stays visibly unknown: "Not verified" in muted
 * text, never a confident yes or no we have no basis for.
 */
export const VerifiedState = ({ value, trueLabel, falseLabel, className }: VerifiedStateProps) => {
  if (value === null) {
    return (
      <span className={cn("text-ink-3", className)} title="This has not been verified yet">
        Not verified
      </span>
    )
  }

  return (
    <span className={cn(value ? "font-medium text-ink" : "text-ink-3", className)}>
      {value ? trueLabel : falseLabel}
    </span>
  )
}
