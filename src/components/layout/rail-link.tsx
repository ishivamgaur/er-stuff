"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export type RailItem = {
  label: string
  href: string
  count?: number
}

const isActive = (pathname: string, href: string): boolean =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)

const RailItemLink = ({ item, pathname }: { item: RailItem; pathname: string }) => {
  const active = isActive(pathname, item.href)

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-2 rounded-chip px-2 py-1.5 text-body transition-colors active:scale-[0.98] ${
        active ? "font-medium text-ink" : "text-ink-2 hover:text-ink"
      }`}
    >
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.count !== undefined ? (
        <span className="ml-auto font-mono text-micro tabular-nums text-ink-3">{item.count}</span>
      ) : null}
    </Link>
  )
}

export const RailLink = ({ items }: { items: RailItem[] }) => {
  const pathname = usePathname()

  return (
    <div className="flex flex-col">
      {items.map((item) => (
        <RailItemLink key={item.href} item={item} pathname={pathname} />
      ))}
    </div>
  )
}
