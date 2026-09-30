import { cn } from "@/lib/utils/cn"

type VerifiedStateProps = {
  value: boolean | null
  trueLabel: string
  falseLabel: string
  className?: string
}

export const VerifiedState = ({ value, trueLabel, falseLabel, className }: VerifiedStateProps) => {
  if (value === null) {
    return (
      <span className={cn("text-ink-3", className)} title="This has not been verified yet">
        Not verified
      </span>
    )
  }

  return (
    <span className={cn(value ? "text-ink" : "text-ink-3", className)}>
      {value ? trueLabel : falseLabel}
    </span>
  )
}
