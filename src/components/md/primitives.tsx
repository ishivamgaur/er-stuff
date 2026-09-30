import { cn } from "@/lib/utils/cn"

/**
 * Markdown reads because the syntax is visible. `## heading` and `- item` tell
 * the reader what kind of thing they are looking at before they read it, and
 * the whole interface is one monospace column so nothing competes.
 */

type HeadingProps = {
  children: React.ReactNode
  level?: 1 | 2 | 3
  id?: string
  className?: string
}

const SIZES = {
  1: "text-title",
  2: "text-lead",
  3: "text-body",
} as const

const MARKS = {
  1: "#",
  2: "##",
  3: "###",
} as const

export const MdHeading = ({ children, level = 2, id, className }: HeadingProps) => {
  const Tag = (level === 1 ? "h1" : level === 2 ? "h2" : "h3") as "h1" | "h2" | "h3"

  return (
    <Tag
      id={id}
      className={cn(
        "flex items-baseline gap-2 font-bold text-ink",
        SIZES[level],
        level === 1 ? "tracking-tight" : "tracking-tight",
        className,
      )}
    >
      <span aria-hidden className="shrink-0 select-none text-ink-4">
        {MARKS[level]}
      </span>
      <span className="min-w-0">{children}</span>
    </Tag>
  )
}

type RuleProps = {
  /** `---` is a thematic break in markdown, so it gets a literal marker. */
  label?: string
  className?: string
}

export const MdRule = ({ label, className }: RuleProps) => (
  <div className={cn("flex items-center gap-2", className)} role="separator">
    <span aria-hidden className="h-px flex-1 bg-line" />
    {label ? (
      <span aria-hidden className="shrink-0 text-micro text-ink-4">
        {label}
      </span>
    ) : null}
    <span aria-hidden className="h-px flex-1 bg-line" />
  </div>
)

type FenceProps = {
  title?: string
  children: React.ReactNode
  className?: string
}

/**
 * A fenced code block. Used for structured data we want to read as data, not as
 * prose. Tool facts live here instead of in a table, because a table of
 * mostly unknowns reads as filler.
 */
export const MdFence = ({ title, children, className }: FenceProps) => (
  <div className={cn("border border-line bg-field", className)}>
    {title ? (
      <div className="flex items-center gap-1.5 border-b border-line px-3 py-1.5">
        <span aria-hidden className="text-micro text-ink-4">
          ```
        </span>
        <span className="truncate text-micro text-ink-3">{title}</span>
      </div>
    ) : null}
    <div className="px-3 py-2.5 text-small leading-relaxed whitespace-pre-wrap text-ink-2">
      {children}
    </div>
  </div>
)

type MdListProps = {
  items: React.ReactNode[]
  ordered?: boolean
  className?: string
}

export const MdList = ({ items, ordered = false, className }: MdListProps) => (
  <ul className={cn("space-y-1.5", className)}>
    {items.map((item, index) => (
      <li key={index} className="flex gap-2">
        <span aria-hidden className="shrink-0 select-none text-ink-4">
          {ordered ? `${index + 1}.` : "-"}
        </span>
        <span className="min-w-0 flex-1 text-body leading-relaxed text-pretty text-ink-2">
          {item}
        </span>
      </li>
    ))}
  </ul>
)

type MdNoteProps = {
  children: React.ReactNode
  tone?: "neutral" | "warning"
  className?: string
}

/** A blockquote. Used for the things we are saying rather than describing. */
export const MdNote = ({ children, tone = "neutral", className }: MdNoteProps) => (
  <blockquote
    className={cn(
      "border-l-2 py-0.5 pl-4 text-body leading-relaxed text-pretty text-ink-2",
      tone === "warning" ? "border-destructive" : "border-line-strong",
      className,
    )}
  >
    {children}
  </blockquote>
)

type KeyValueProps = {
  rows: Array<{ term: string; value: React.ReactNode }>
  className?: string
}

/** The markdown definition list. Reads as `term: value` without the table rules. */
export const MdKeyValue = ({ rows, className }: KeyValueProps) => (
  <dl className={cn("divide-y divide-line border-y border-line", className)}>
    {rows.map((row) => (
      <div
        key={row.term}
        className="grid grid-cols-1 gap-x-4 gap-y-0.5 py-2 sm:grid-cols-[11rem_minmax(0,1fr)]"
      >
        <dt className="text-small text-ink-3">
          <span aria-hidden className="mr-1.5 text-ink-4">
            ·
          </span>
          {row.term}
        </dt>
        <dd className="min-w-0 text-small leading-relaxed text-pretty text-ink">{row.value}</dd>
      </div>
    ))}
  </dl>
)
