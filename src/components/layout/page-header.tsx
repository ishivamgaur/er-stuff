type PageHeaderProps = {
  count?: number | undefined
  title: string
  description?: string | undefined
  children?: React.ReactNode | undefined
}

export const PageHeader = ({ count, title, description, children }: PageHeaderProps) => (
  <section className="border-b border-line py-6">
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      {count !== undefined ? (
        <span className="text-lead leading-tight font-bold tabular-nums text-ink">{count}</span>
      ) : null}
      <h1 className="text-lead leading-tight font-bold tracking-tight text-ink">{title}</h1>
      {description ? (
        <p className="w-full min-w-0 text-small text-pretty text-ink-3 sm:w-auto sm:flex-1 sm:truncate">
          {description}
        </p>
      ) : null}
    </div>
    {children ? <div className="mt-3">{children}</div> : null}
  </section>
)
