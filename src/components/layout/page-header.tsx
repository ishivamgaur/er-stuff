import { cn } from "@/lib/utils"

type PageHeaderProps = {
  count?: number
  eyebrow?: string | undefined
  title: string
  description?: string | undefined
  aside?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

/*
 * Every page header: the count in bright mono, then the title, then the
 * description. The count leads because the directory's promise is coverage,
 * and coverage is a number before it is anything else.
 */
export const PageHeader = ({
  count,
  eyebrow,
  title,
  description,
  aside,
  children,
  className,
}: PageHeaderProps) => (
  <header className={cn("rise mb-5", className)}>
    {eyebrow ? <p className="label mb-2 text-brand">{eyebrow}</p> : null}

    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      {count !== undefined ? (
        <span className="numeric text-title leading-none font-semibold text-brand">{count}</span>
      ) : null}

      <h1 className="text-title leading-tight font-semibold tracking-tight text-balance text-ink">
        {title}
      </h1>

      {aside ? <div className="ml-auto shrink-0">{aside}</div> : null}
    </div>

    {description ? (
      <p className="mt-2 max-w-[60ch] text-body leading-relaxed text-pretty text-ink-2">
        {description}
      </p>
    ) : null}

    {children}
  </header>
)
