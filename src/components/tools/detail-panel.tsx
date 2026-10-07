import { cn } from "@/lib/utils"

type Fact = { label: string; value: React.ReactNode }

/**
 * The facts table. A definition list rather than a grid of boxes, so a row of
 * mostly unknowns still reads as data rather than as a set of empty cards.
 * Labels are mono because they are field names, not prose.
 */
export const DetailList = ({ rows, className }: { rows: Fact[]; className?: string }) => (
  <dl className={cn("max-w-[44rem] border-t border-dashed border-line", className)}>
    {rows.map((row) => (
      <div
        key={row.label}
        className="grid grid-cols-[8.5rem_minmax(0,1fr)] items-baseline gap-x-4 border-b border-dashed border-line py-2.5"
      >
        <dt className="font-mono text-micro text-ink-4">{row.label}</dt>
        <dd className="min-w-0 text-body text-ink">{row.value}</dd>
      </div>
    ))}
  </dl>
)

/** A single field pulled out, when it needs more room than a table row. */
export const FactPanel = ({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) => (
  <section className={cn("max-w-[44rem] border-t border-dashed border-line pt-2.5", className)}>
    <p className="font-mono text-micro text-ink-4">{title}</p>
    <div className="mt-1 text-small leading-relaxed whitespace-pre-wrap text-ink-2">{children}</div>
  </section>
)
