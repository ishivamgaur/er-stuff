"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils/cn"

export type RailItem = {
  label: string
  href: string
  count?: number
}

type OnNavigate = (() => void) | undefined

const isActive = (pathname: string, href: string): boolean =>
  pathname === href || pathname.startsWith(`${href}/`)

const ROW_CLASS =
  "flex items-center gap-2 rounded-chip py-1.5 pr-2 pl-2 text-body transition-colors hover:bg-field"

const ACTIVE_CLASS = "font-bold text-accent"
const IDLE_CLASS = "text-ink-2"

const TreeRow = ({
  item,
  isLast,
  pathname,
  onNavigate,
}: {
  item: RailItem
  isLast: boolean
  pathname: string
  onNavigate: OnNavigate
}) => {
  const active = isActive(pathname, item.href)

  return (
    <Link
      href={item.href}
      {...(onNavigate ? { onClick: onNavigate } : {})}
      {...(active ? { "aria-current": "page" as const } : {})}
      className={cn(ROW_CLASS, active ? ACTIVE_CLASS : IDLE_CLASS)}
    >
      <span aria-hidden className="w-6 shrink-0 select-none text-ink-4">
        {isLast ? "└──" : "├──"}
      </span>
      <span className="min-w-0 flex-1 truncate">[{item.label}]</span>
    </Link>
  )
}

export const TreeNav = ({ items, onNavigate }: { items: RailItem[]; onNavigate?: OnNavigate }) => {
  const pathname = usePathname()

  return (
    <nav>
      {items.map((item, index) => (
        <TreeRow
          key={item.href}
          item={item}
          isLast={index === items.length - 1}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  )
}

const CountRow = ({
  item,
  isLast,
  pathname,
  onNavigate,
}: {
  item: RailItem
  isLast: boolean
  pathname: string
  onNavigate: OnNavigate
}) => {
  const active = isActive(pathname, item.href)

  return (
    <Link
      href={item.href}
      {...(onNavigate ? { onClick: onNavigate } : {})}
      {...(active ? { "aria-current": "page" as const } : {})}
      className={cn(ROW_CLASS, active ? ACTIVE_CLASS : IDLE_CLASS)}
    >
      <span aria-hidden className="w-6 shrink-0 select-none text-ink-4">
        {isLast ? "└──" : "├──"}
      </span>
      <span className="min-w-0 flex-1 truncate">[{item.label}]</span>
      <span className={cn("shrink-0 tabular-nums", active ? "text-accent" : "text-ink-4")}>
        {item.count ?? 0}
      </span>
    </Link>
  )
}

export const CountNav = ({ items, onNavigate }: { items: RailItem[]; onNavigate?: OnNavigate }) => {
  const pathname = usePathname()

  return (
    <nav>
      {items.map((item, index) => (
        <CountRow
          key={item.href}
          item={item}
          isLast={index === items.length - 1}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  )
}
