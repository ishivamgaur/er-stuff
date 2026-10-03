import { cn } from "@/lib/utils/cn"

type PageHeaderProps = {
  count?: number
  title: string
  description?: string | undefined
  aside?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export const PageHeader = ({
  count,
  title,
  description,
  aside,
  children,
  className,
}: PageHeaderProps) => (
  <header className={cn("mb-10", className)}>
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {count !== undefined ? (
        <span className="numeric text-lead leading-none font-semibold text-ink">{count}</span>
      ) : null}

      <h1 className="text-title leading-tight font-semibold tracking-[-0.01em] text-ink">
        {title}
      </h1>

      {aside ? <div className="ml-auto shrink-0">{aside}</div> : null}
    </div>

    {description ? (
      <p className="mt-3 max-w-[46ch] text-lead leading-relaxed text-pretty text-ink-2">
        {description}
      </p>
    ) : null}

    {children}
  </header>
)
