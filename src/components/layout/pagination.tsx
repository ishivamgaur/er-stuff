import Link from "next/link"
import { cn } from "@/lib/utils/cn"

type PaginationProps = {
  page: number
  totalPages: number
  basePath: string
  searchParams: Record<string, string | string[] | undefined>
}

const buildHref = (
  basePath: string,
  searchParams: Record<string, string | string[] | undefined>,
  page: number,
): string => {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page") continue
    const values = Array.isArray(value) ? value : [value]
    for (const entry of values) {
      if (entry) params.append(key, entry)
    }
  }

  if (page > 1) params.set("page", String(page))

  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

const StepLink = ({
  href,
  disabled,
  children,
}: {
  href: string
  disabled: boolean
  children: string
}) => (
  <Link
    href={href}
    scroll={false}
    aria-disabled={disabled}
    tabIndex={disabled ? -1 : undefined}
    className={cn(
      "rounded-control border border-dashed border-line px-2.5 py-1 text-small transition-colors",
      disabled
        ? "pointer-events-none text-ink-3 opacity-50"
        : "text-ink-2 hover:border-line-strong hover:text-ink",
    )}
  >
    {children}
  </Link>
)

export const Pagination = ({ page, totalPages, basePath, searchParams }: PaginationProps) => {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between py-6">
      <StepLink
        href={buildHref(basePath, searchParams, Math.max(1, page - 1))}
        disabled={page === 1}
      >
        Previous
      </StepLink>

      <span className="font-mono text-micro tabular-nums text-ink-3">
        Page {page} of {totalPages}
      </span>

      <StepLink
        href={buildHref(basePath, searchParams, Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
      >
        Next
      </StepLink>
    </nav>
  )
}
