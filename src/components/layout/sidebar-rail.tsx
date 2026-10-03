"use client"

import { useEffect, useRef, useState, type ComponentType } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BrowserIcon,
  ChevronIcon,
  CodeIcon,
  CompassIcon,
  DatabaseIcon,
  DesignPenIcon,
  GlobeIcon,
  KeyIcon,
  LaunchIcon,
  LayersIcon,
  MegaphoneIcon,
  ModulesIcon,
  PlusIcon,
  PromptIcon,
  ServerIcon,
  SparkIcon,
  TicketIcon,
  UserIcon,
} from "@/components/icons"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { cn } from "@/lib/utils/cn"
import type { Viewer } from "@/components/layout/viewer"
import type { NavGroupConfig, NavIcon } from "@/config/navigation-groups"

export type RailItem = {
  label: string
  href: string
  count?: number | undefined
  icon: NavIcon
}

type OnNavigate = (() => void) | undefined

const NAV_ICONS: Record<NavIcon, ComponentType<{ className?: string }>> = {
  compass: CompassIcon,
  ticket: TicketIcon,
  layers: LayersIcon,
  pen: DesignPenIcon,
  modules: ModulesIcon,
  browser: BrowserIcon,
  server: ServerIcon,
  database: DatabaseIcon,
  globe: GlobeIcon,
  launch: LaunchIcon,
  spark: SparkIcon,
  key: KeyIcon,
  code: CodeIcon,
}

const matches = (pathname: string, href: string): boolean =>
  href === "/explore" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)

/**
 * Only the most specific row is active.
 *
 * On /categories/backend both "Categories" and "Backend" match by prefix, which
 * lit two rows at once and left the glide pill and the active rail disagreeing
 * about which one was current. The longest matching href wins, so the pill and
 * the accent always land on the same row.
 */
const resolveActiveHref = (pathname: string, items: readonly { href: string }[]): string | null => {
  const matchesHere = items.filter((item) => matches(pathname, item.href))
  if (matchesHere.length === 0) return null
  return matchesHere.reduce((best, item) => (item.href.length > best.href.length ? item : best))
    .href
}

/**
 * One row per section, 32px tall, so thirteen of them read as a list rather than
 * as a column of cards.
 *
 * The current section is a 1px outlined box, drawn with `outline` rather than
 * `border` on purpose: a border would push the label 1px sideways and change
 * the row height every time the reader navigates, which is visible jitter. The
 * box is `line-strong`, and the label goes to full `ink`. There is no accent in
 * the rail at all, so the current row is found by a box and a brightness step
 * and nothing else.
 *
 * The 32px row is itself the hit area, which clears the 24px minimum without a
 * pseudo element, and the box is offset outward so the hit area never shrinks.
 */
const NavItem = ({
  item,
  onNavigate,
  isCollapsed,
  showCount,
  isActiveRow,
}: {
  item: RailItem
  onNavigate: OnNavigate
  isCollapsed: boolean
  showCount: boolean
  isActiveRow: boolean
}) => {
  const active = isActiveRow
  const Icon = NAV_ICONS[item.icon]

  return (
    <Link
      href={item.href}
      {...(onNavigate ? { onClick: onNavigate } : {})}
      {...(active ? { "aria-current": "page" as const } : {})}
      {...(isCollapsed ? { "aria-label": item.label, title: item.label } : {})}
      data-nav-href={item.href}
      className={cn(
        "hover-veil group relative z-10 flex min-h-7 items-center gap-2.5 rounded-chip px-2.5",
        "hover-veil-fill text-body transition-colors duration-150 ease-ui",
        "hover:hover-veil-active",
        isCollapsed && "justify-center px-0",
        active ? "text-ink" : "text-ink-2 hover:text-ink",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-5 shrink-0 place-items-center transition-colors duration-150",
          active ? "text-ink" : "text-ink-4 group-hover:text-ink-3",
        )}
      >
        <Icon />
      </span>

      {!isCollapsed ? <span className="min-w-0 flex-1 truncate">{item.label}</span> : null}

      {!isCollapsed && showCount && item.count !== undefined ? (
        <span className={cn("numeric shrink-0 text-small", active ? "text-ink-2" : "text-ink-4")}>
          {item.count}
        </span>
      ) : null}
    </Link>
  )
}

const NavGroup = ({
  heading,
  items,
  onNavigate,
  isCollapsed,
  activeHref,
}: {
  heading: string
  items: readonly RailItem[]
  onNavigate: OnNavigate
  isCollapsed: boolean
  activeHref: string | null
}) => (
  <div className="group/nav">
    {isCollapsed ? null : (
      <div className="mb-3 px-2.5">
        <p className="truncate text-small tracking-wide text-ink-4 uppercase">{heading}</p>
      </div>
    )}
    <nav className="flex flex-col gap-1">
      {items.map((item) => (
        <NavItem
          key={item.href}
          item={item}
          onNavigate={onNavigate}
          isCollapsed={isCollapsed}
          showCount={item.count !== undefined}
          isActiveRow={activeHref === item.href}
        />
      ))}
    </nav>
  </div>
)

/**
 * The rail row is 28px tall, `min-h-7`, at `px-2.5` with a `size-5` icon slot,
 * and rows are 4px apart. 40px rows and then 32px were both tried, and thirteen
 * of them read as a column of cards rather than as an index. The gap matters as
 * much as the height: without it the rows merge into one block and the ring
 * around a single row stops reading as a box.
 *
 * The current section carries no outline of its own. `NavOutline` owns the one
 * box, so there is never a second box to disagree with it, and the box can
 * travel between rows.
 */

/**
 * One outlined box that glides.
 *
 * It sits on the hovered row, or on the current section when nothing is hovered,
 * so the same mark answers "where am I looking" and "where am I". Two rules made
 * this work:
 *
 * - It is a single absolutely positioned sibling, measured from the row it is
 *   over, rather than an outline on each row. Per row outlines cannot animate
 *   between each other, they only cross fade, and they double up on the active
 *   row.
 * - `padding` and a mask are safe here, unlike a border on the rows themselves,
 *   because an absolutely positioned box is out of flow and pushes nothing when
 *   its size changes.
 */
const NavOutline = ({
  containerRef,
  targetHref,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>
  targetHref: string | null
}) => {
  const [box, setBox] = useState<{
    top: number
    left: number
    width: number
    height: number
  } | null>(null)
  // The first measurement must not animate, or the box slides in from the top of
  // the rail on every page load.
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const measure = () => {
      const row = targetHref
        ? container.querySelector<HTMLElement>(`[data-nav-href="${targetHref}"]`)
        : null
      if (!row) {
        setBox(null)
        return
      }
      // Rects, not offsetTop. Offset values are rounded to whole pixels by the
      // browser, and a box that steps one pixel at a time does not read as a
      // glide no matter how good the curve is.
      const from = container.getBoundingClientRect()
      const to = row.getBoundingClientRect()
      setBox({
        top: to.top - from.top,
        left: to.left - from.left,
        width: to.width,
        height: to.height,
      })
      setSettled(true)
    }

    // ResizeObserver fires once on observe, which covers the first measurement
    // and every collapse toggle after it.
    const observer = new ResizeObserver(measure)
    observer.observe(container)

    // The rail slides in on load, and a transform does not change any box size,
    // so ResizeObserver stays quiet while the rows are still moving. Measuring
    // on the way out of that animation is what keeps the first box from resting
    // a pixel away from its row.
    container.addEventListener("animationend", measure)
    measure()

    return () => {
      observer.disconnect()
      container.removeEventListener("animationend", measure)
    }
  }, [containerRef, targetHref])

  return (
    <span
      aria-hidden
      data-testid="rail-nav-outline"
      className={cn(
        "glass-outline pointer-events-none absolute top-0 left-0 z-0 rounded-chip",
        "transition-[transform,width,height,opacity] duration-400 ease-glide",
        !settled && "transition-none",
        box ? "opacity-100" : "opacity-0",
      )}
      style={
        box
          ? {
              transform: `translate(${box.left}px, ${box.top}px)`,
              width: box.width,
              height: box.height,
            }
          : undefined
      }
    />
  )
}

export const RailNav = ({
  groups,
  counts,
  onNavigate,
  isCollapsed,
}: {
  groups: readonly NavGroupConfig[]
  counts: ReadonlyMap<string, number>
  onNavigate?: OnNavigate
  isCollapsed: boolean
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredHref, setHoveredHref] = useState<string | null>(null)
  const pathname = usePathname()
  const allItems = groups.flatMap((group) => [...group.items])
  const activeHref = resolveActiveHref(pathname, allItems)

  /**
   * One set of handlers on the container rather than on every row. Pointer move
   * resolves whichever row is under the cursor, so the box cannot go stale in
   * the padding between rows, and focus is tracked the same way so the box
   * follows a keyboard reader too.
   */
  const rowHrefFrom = (target: EventTarget | null): string | null => {
    if (!(target instanceof Element)) return null
    return target.closest<HTMLElement>("[data-nav-href]")?.dataset.navHref ?? null
  }

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col gap-4"
      onPointerMove={(event) => {
        const href = rowHrefFrom(event.target)
        setHoveredHref((current) => (current === href ? current : href))
      }}
      onPointerLeave={() => setHoveredHref(null)}
      onFocus={(event) => setHoveredHref(rowHrefFrom(event.target))}
      onBlur={(event) => {
        if (
          event.relatedTarget instanceof Node &&
          event.currentTarget.contains(event.relatedTarget)
        ) {
          return
        }
        setHoveredHref(null)
      }}
    >
      <NavOutline containerRef={containerRef} targetHref={hoveredHref ?? activeHref} />
      {groups.map((group) => (
        <NavGroup
          key={group.id}
          heading={group.heading}
          items={group.items.map((item) => {
            const count = counts.get(item.href)
            return count === undefined ? { ...item } : { ...item, count }
          })}
          onNavigate={onNavigate}
          isCollapsed={isCollapsed}
          activeHref={activeHref}
        />
      ))}
    </div>
  )
}

const STORAGE_KEY = "erstuff:rail"

type SidebarRailProps = {
  identity: { name: string; tagline: string }
  groups: readonly NavGroupConfig[]
  counts: ReadonlyMap<string, number>
  viewer: Viewer | null
}

export const SidebarRail = ({ identity, groups, counts, viewer }: SidebarRailProps) => {
  // Read the stored preference during the first client render rather than in an
  // effect, which would be a cascading render. See AGENTS.md 5.8.
  const [isCollapsed, setIsCollapsed] = useState<boolean | null>(null)
  if (isCollapsed === null && typeof window !== "undefined") {
    setIsCollapsed(window.localStorage.getItem(STORAGE_KEY) === "collapsed")
  }
  const collapsed = isCollapsed === true

  const toggle = () => {
    setIsCollapsed((current) => {
      const next = !(current === true)
      window.localStorage.setItem(STORAGE_KEY, next ? "collapsed" : "expanded")
      return next
    })
  }

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "sticky top-0 z-20 hidden h-dvh shrink-0 flex-col border-r border-line lg:flex",
        "transition-[width] duration-250 ease-[cubic-bezier(0.2,0,0,1)]",
        collapsed ? "w-14" : "w-60",
      )}
    >
      {/*
       * The wordmark is a fixed strip at the very top of the rail, the same
       * height as the toolbar beside it and sharing its bottom hairline, so the
       * two read as one header bar rather than as a logo floating above the nav.
       * It sits outside the scroll area, so the logo cannot scroll away.
       */}
      <Link
        href="/explore"
        title={collapsed ? identity.name : undefined}
        className={cn(
          "hover-veil group flex h-14 shrink-0 items-center gap-2 border-b border-line",
          "hover-veil-fill text-body font-bold text-accent",
          "transition-colors duration-150 ease-ui hover:hover-veil-active",
          collapsed ? "justify-center px-0" : "px-3",
        )}
      >
        <PromptIcon />
        {!collapsed ? (
          <>
            <span className="truncate">{identity.name}</span>
            <span aria-hidden className="cursor-blink text-ink-4">
              |
            </span>
          </>
        ) : null}
      </Link>

      <div
        className={cn(
          "rail-body flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain py-4",
          collapsed ? "px-2" : "px-3",
        )}
        data-lenis-prevent
      >
        <div>
          <RailNav groups={groups} counts={counts} isCollapsed={collapsed} />
        </div>

        <div className={cn("mt-auto flex flex-col gap-0.5 pt-6", collapsed && "items-stretch")}>
          {viewer ? (
            <>
              {!collapsed ? (
                <p className="truncate px-2.5 pb-1.5 text-small text-ink-4">{viewer.email}</p>
              ) : null}
              <FooterLink
                href="/submit"
                label="List a product"
                isCollapsed={collapsed}
                icon={<PlusIcon />}
              />
              <FooterLink
                href="/account"
                label="Your account"
                isCollapsed={collapsed}
                icon={<UserIcon />}
              />
              <SignOutButton collapsed={collapsed} />
            </>
          ) : (
            <FooterLink
              href="/signup"
              label="List a product"
              isCollapsed={collapsed}
              icon={<PlusIcon />}
            />
          )}

          <FooterLink
            href="/sponsors"
            label="Sponsors"
            isCollapsed={collapsed}
            icon={<MegaphoneIcon />}
          />

          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "hover-veil group mt-1 flex min-h-7 w-full items-center gap-2.5 rounded-chip px-2.5",
              "hover-veil-fill text-body text-ink-4 transition-colors duration-200",
              "ease-[cubic-bezier(0.2,0,0,1)] hover:hover-veil-active hover:text-ink-2",
              collapsed && "justify-center px-0",
            )}
          >
            <ChevronIcon
              className={cn(
                "transition-transform duration-250 ease-[cubic-bezier(0.2,0,0,1)]",
                collapsed && "rotate-180",
              )}
            />
            {!collapsed ? "Collapse" : null}
          </button>
        </div>
      </div>
    </aside>
  )
}

const FooterLink = ({
  href,
  label,
  isCollapsed,
  icon,
}: {
  href: string
  label: string
  isCollapsed: boolean
  icon: React.ReactNode
}) => (
  <Link
    href={href}
    title={isCollapsed ? label : undefined}
    className={cn(
      "hover-veil group flex min-h-7 items-center gap-2.5 rounded-chip px-2.5",
      "hover-veil-fill text-body text-ink-3 transition-colors duration-150 ease-ui",
      "hover:hover-veil-active hover:text-ink",
      isCollapsed && "justify-center px-0",
    )}
  >
    <span className="grid size-5 shrink-0 place-items-center text-ink-3 transition-colors duration-150 group-hover:text-ink-2">
      {icon}
    </span>
    {!isCollapsed ? <span className="truncate">{label}</span> : null}
  </Link>
)
