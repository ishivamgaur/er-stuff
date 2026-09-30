import { cn } from "@/lib/utils/cn"

type PageHeaderProps = {
  count?: number
  title: string
  description?: string | undefined
  /** Rendered on the right, usually links or a status. */
  aside?: React.ReactNode
  /** Optional content below the description, such as a category summary. */
  children?: React.ReactNode
  className?: string
}

/**
 * Every page opens the same way, like the top of a markdown file: a title with
 * its `#`, an optional count, then a description. The count leads because it
 * is the most scannable thing on the line.
 */
export const PageHeader = ({
  count,
  title,
  description,
  aside,
  children,
  className,
}: PageHeaderProps) => (
  <header className={cn("mb-6", className)}>
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      {count !== undefined ? (
        <span className="text-lead leading-tight font-bold tabular-nums text-ink">{count}</span>
      ) : null}

      <h1 className="flex min-w-0 items-baseline gap-2 text-lead leading-tight font-bold tracking-tight text-ink">
        <span aria-hidden className="shrink-0 select-none text-ink-4">
          #
        </span>
        <span className="min-w-0 truncate">{title}</span>
      </h1>

      {aside ? <div className="ml-auto shrink-0">{aside}</div> : null}
    </div>

    {description ? (
      <p className="mt-2 max-w-[68ch] text-body leading-relaxed text-pretty text-ink-2">
        {description}
      </p>
    ) : null}

    {children}
  </header>
)
