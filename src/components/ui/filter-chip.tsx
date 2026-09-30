import Link from "next/link"
import { cn } from "@/lib/utils/cn"

type FilterChipProps = {
  href: string
  active: boolean
  children: string
}

export const FilterChip = ({ href, active, children }: FilterChipProps) => (
  <Link
    href={href}
    scroll={false}
    aria-current={active ? "true" : undefined}
    className={cn(
      "rounded-chip px-2 py-0.5 text-small whitespace-nowrap transition-colors",
      active ? "bg-accent text-white" : "text-ink-2 hover:bg-field hover:text-ink",
    )}
  >
    {children}
  </Link>
)
