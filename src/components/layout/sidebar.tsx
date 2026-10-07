"use client"

import { useEffect, useRef, useState, type ComponentType } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BotIcon,
  ChevronIcon,
  CloudIcon,
  ComponentIcon,
  DatabaseZapIcon,
  FrameIcon,
  GiftIcon,
  MegaphoneIcon,
  PaletteIcon,
  PlusIcon,
  ServerCogIcon,
  ShapesIcon,
  ShieldIcon,
  ShipIcon,
  TelescopeIcon,
  TerminalIcon,
  UserIcon,
} from "@/components/icons"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { glideToAnchor } from "@/components/layout/smooth-scroll"
import { cn } from "@/lib/utils"
import type { Viewer } from "@/components/layout/viewer"
import { NAV_ITEMS, findNavItemByPathname, type NavIcon, type NavSection } from "@/config/nav"

type OnNavigate = (() => void) | undefined

const NAV_ICONS: Record<NavIcon, ComponentType<{ className?: string }>> = {
  compass: TelescopeIcon,
  ticket: GiftIcon,
  layers: ShapesIcon,
  pen: PaletteIcon,
  modules: ComponentIcon,
  browser: FrameIcon,
  server: ServerCogIcon,
  database: DatabaseZapIcon,
  globe: CloudIcon,
  launch: ShipIcon,
  spark: BotIcon,
  key: ShieldIcon,
  code: TerminalIcon,
}

/*
 * One nav row, 24px tall at 12px. Small and quiet on purpose: seven rows at
 * 32px read as a column of cards, and this list is an index, not a menu of
 * features. 12px is the sidebar's clickable size; the 10px mono treatment
 * belongs to what annotates a row — counts, block headings, the account
 * email. Nav rows carry no fill: the one floating fill is the GlideBox,
 * which rests on the active section instead.
 */
const NavLink = ({
  href,
  label,
  icon,
  count,
  onNavigate,
  isCollapsed,
  isActive,
}: {
  href: string
  label: string
  icon: NavIcon
  count: number | undefined
  onNavigate: OnNavigate
  isCollapsed: boolean
  isActive: boolean
}) => {
  const Icon = NAV_ICONS[icon]

  return (
    <Link
      href={href}
      {...(onNavigate ? { onClick: onNavigate } : {})}
      {...(isActive ? { "aria-current": "page" as const } : {})}
      {...(isCollapsed ? { "aria-label": label, title: label } : {})}
      data-nav-href={href}
      className={cn(
        "group relative flex h-6 items-center gap-1.5 rounded-control px-2 text-small transition-colors duration-150 ease-ui",
        isActive ? "font-medium text-ink" : "text-ink-2 hover:text-ink",
        isCollapsed && "justify-center px-0",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-4 shrink-0 place-items-center transition-colors duration-150",
          isActive ? "text-brand" : "text-ink-3 group-hover:text-brand",
        )}
      >
        <Icon className="size-3.5" />
      </span>

      {!isCollapsed ? <span className="min-w-0 flex-1 truncate">{label}</span> : null}

      {!isCollapsed && count !== undefined ? (
        <span className="numeric shrink-0 text-ink-4">{count}</span>
      ) : null}
    </Link>
  )
}

/*
 * One section row: a pure hash anchor on the page the reader is already on.
 * No icon — the label starts in the nav label column (8px row padding + 16px
 * icon + 6px gap = 30px), so sections read as a level of the same list rather
 * than a second list beside it.
 *
 * Desktop: the default anchor navigation runs through Lenis, which glides to
 * `#id`, reads `scroll-margin-top` for the sticky toolbar and lets the browser
 * set the hash, so the link is shareable.
 *
 * Drawer: body scroll is locked, so a native jump would land nowhere. Stop the
 * event before Lenis's window handler sees it, close the drawer, and scroll
 * once the lock has released.
 */
const SectionLink = ({
  entry,
  count,
  isActive,
  onNavigate,
}: {
  entry: NavSection
  count: number | undefined
  isActive: boolean
  onNavigate: OnNavigate
}) => (
  <a
    href={`#${entry.id}`}
    data-nav-href={`#${entry.id}`}
    {...(isActive ? { "aria-current": "location" as const } : {})}
    {...(onNavigate
      ? {
          onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault()
            event.stopPropagation()
            onNavigate()
            window.setTimeout(() => glideToAnchor(entry.id), 350)
          },
        }
      : {})}
    className={cn(
      "group relative flex h-6 items-center rounded-control pl-[30px] pr-2 text-small transition-colors duration-150 ease-ui",
      isActive ? "font-medium text-ink" : "text-ink-2 hover:text-ink",
    )}
  >
    <span className="min-w-0 flex-1 truncate">{entry.label}</span>
    {count !== undefined ? <span className="numeric shrink-0 text-ink-4">{count}</span> : null}
  </a>
)

/*
 * One floating fill that glides between rows.
 *
 * It sits on the hovered row, or on the current section when nothing is
 * hovered, so the same mark answers "where am I looking" and "where am I".
 * It is a single absolutely positioned sibling, measured from the row it is
 * over, rather than a fill on each row: per-row fills cannot travel between
 * each other, they only cross-fade, and they double up on the active row.
 * The rows therefore carry no fill of their own. Measure with rects, not
 * offsetTop: offset values are rounded to whole pixels and a box that steps
 * one pixel at a time does not read as a glide.
 */
const GlideBox = ({
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
  // The first measurement must not animate, or the box slides in from the top
  // of the rail on every page load.
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
    measure()

    return () => observer.disconnect()
  }, [containerRef, targetHref])

  return (
    <span
      aria-hidden
      data-testid="sidebar-glide"
      className={cn(
        // Glass: a translucent tint of the accent over the rail, an inset line
        // of light along the top edge and a small drop, so the mark reads as a
        // pane resting on the rows rather than a flat swatch painted under
        // them. The ring is the accent at low alpha in both themes; the two
        // shadow recipes differ only in how much lift the dark page needs.
        "pointer-events-none absolute top-0 left-0 z-0 rounded-control bg-brand-tint/75 ring-1 ring-brand/30",
        "shadow-[inset_0_1px_0_rgb(255_255_255/0.45),0_1px_2px_rgb(0_0_0/0.10)]",
        "dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.07),0_1px_3px_rgb(0_0_0/0.45)]",
        "transition-[transform,width,height,opacity] duration-300 ease-[cubic-bezier(0.34,1.25,0.64,1)]",
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

/*
 * The nav itself, shared by the desktop rail and the mobile drawer so the two
 * can never disagree about labels, counts or the active row.
 *
 * Two blocks, both from `src/config/nav.ts`, the same array the pages are
 * built from:
 * - Navigation: the seven routes, always shown.
 * - Sections: the sections of the route the reader is on, shown directly
 *   beneath. On a section anchor row the glide box rests, so the mark answers
 *   both "where am I" (the section) and, through aria-current, which route
 *   owns it.
 *
 * Count rule (AGENTS.md 5.3): counts arrive deduped from `findNavCounts` —
 * a section is a Set of tools, a nav row the union of its sections. Never sum.
 */
export const SidebarNav = ({
  counts,
  onNavigate,
  isCollapsed,
}: {
  counts: ReadonlyMap<string, number>
  onNavigate?: OnNavigate
  isCollapsed: boolean
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredHref, setHoveredHref] = useState<string | null>(null)
  const pathname = usePathname()
  const activeNav = findNavItemByPathname(pathname)
  const sections = activeNav?.sections ?? []

  /*
   * Scroll-spy: which section is under the reader. The observer fires its
   * callbacks asynchronously, so setting state inside them is not the
   * setState-in-an-effect violation of AGENTS.md 5.8. The initial null means
   * "rest on the first section" until the observer reports.
   */
  const [activeSection, setActiveSection] = useState<string | null>(null)

  /* Switching routes clears the old section via the render-phase adjustment. */
  const [syncedPath, setSyncedPath] = useState(pathname)
  if (pathname !== syncedPath) {
    setSyncedPath(pathname)
    setActiveSection(null)
  }

  useEffect(() => {
    if (!activeNav) return
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"))
    if (nodes.length === 0) return

    /*
     * Active = the last section whose top has crossed the reading line, a bit
     * below the sticky toolbar. A band of intersecting sections is not enough:
     * on a short page the tail sections never reach the band at maximum scroll,
     * and the last section would stay inactive forever. The observer is only
     * the trigger — it fires as section edges cross the band — and the answer
     * is always recomputed from the rects. At the foot of the page the last
     * section owns it, which is where the reader has arrived.
     */
    const atBottom = () =>
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
    const pick = () => {
      const line = window.innerHeight * 0.4
      const next = atBottom()
        ? nodes[nodes.length - 1]?.id
        : (nodes.filter((node) => node.getBoundingClientRect().top <= line).pop()?.id ??
          nodes[0]?.id)
      if (next) setActiveSection((current) => (current === next ? current : next))
    }

    const observer = new IntersectionObserver(() => pick(), {
      rootMargin: "-72px 0px -55% 0px",
    })
    nodes.forEach((node) => observer.observe(node))

    return () => observer.disconnect()
  }, [activeNav])

  const restingSectionId =
    sections.find((entry) => entry.id === activeSection)?.id ?? sections[0]?.id ?? null

  const activeTarget = hoveredHref ?? (restingSectionId ? `#${restingSectionId}` : null)

  /*
   * One set of handlers on the container rather than on every row. Pointer
   * position resolves to the nearest row by Y, not to the element under the
   * cursor: the rows have gaps between them and the two blocks have a margin,
   * and inside those dead zones the element under the cursor is the container
   * itself, which used to clear the hover and spring the box back to the
   * resting section mid-move. Nearest-row keeps the box travelling with the
   * pointer — it holds the row it was on through the gap and flips at the
   * midpoint, which is where the eye expects a travelling mark to change.
   * Focus keeps the target-based resolution: a focused row is always the
   * element itself, never a gap, and keyboard readers step row by row.
   */
  const rowHrefFrom = (target: EventTarget | null): string | null => {
    if (!(target instanceof Element)) return null
    return target.closest<HTMLElement>("[data-nav-href]")?.dataset.navHref ?? null
  }

  const rowFromPointer = (clientY: number): string | null => {
    const container = containerRef.current
    if (!container) return null
    let best: string | null = null
    let bestDistance = Number.POSITIVE_INFINITY
    for (const row of container.querySelectorAll<HTMLElement>("[data-nav-href]")) {
      const rect = row.getBoundingClientRect()
      const distance =
        clientY < rect.top ? rect.top - clientY : clientY > rect.bottom ? clientY - rect.bottom : 0
      if (distance < bestDistance) {
        bestDistance = distance
        best = row.dataset.navHref ?? null
      }
    }
    return best
  }

  const containerHandlers = {
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => {
      const href = rowFromPointer(event.clientY)
      setHoveredHref((current) => (current === href ? current : href))
    },
    onPointerLeave: () => setHoveredHref(null),
    onFocus: (event: React.FocusEvent<HTMLDivElement>) => setHoveredHref(rowHrefFrom(event.target)),
    onBlur: (event: React.FocusEvent<HTMLDivElement>) => {
      if (
        event.relatedTarget instanceof Node &&
        event.currentTarget.contains(event.relatedTarget)
      ) {
        return
      }
      setHoveredHref(null)
    },
  }

  /*
   * Collapsed, the rail is icons only and there is no room for sections: the
   * seven routes remain, sections come back on expand. (The old rail flattened
   * its tree here; forty-three sections cannot flatten into a rail.)
   */
  if (isCollapsed) {
    return (
      <div ref={containerRef} className="relative flex flex-col gap-1" {...containerHandlers}>
        <GlideBox
          containerRef={containerRef}
          targetHref={hoveredHref ?? (activeNav ? activeNav.href : null)}
        />
        <nav aria-label="Navigation" className="relative z-10 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              count={undefined}
              onNavigate={onNavigate}
              isCollapsed
              isActive={activeNav?.href === item.href}
            />
          ))}
        </nav>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-2" {...containerHandlers}>
      <GlideBox containerRef={containerRef} targetHref={activeTarget} />

      <nav aria-label="Navigation" className="relative z-10 flex flex-col gap-1">
        <p className="px-2 pb-1 font-mono text-micro text-ink-4">Navigation</p>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            count={counts.get(item.href)}
            onNavigate={onNavigate}
            isCollapsed={false}
            isActive={activeNav?.href === item.href}
          />
        ))}
      </nav>

      {activeNav && sections.length > 0 ? (
        <nav aria-label="Sections" className="relative z-10 flex flex-col gap-1">
          <p className="px-2 pt-2 pb-1 font-mono text-micro text-ink-4">Sections</p>
          {sections.map((entry) => (
            <SectionLink
              key={entry.id}
              entry={entry}
              count={counts.get(`#${entry.id}`)}
              isActive={restingSectionId === entry.id}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      ) : null}
    </div>
  )
}

const STORAGE_KEY = "erstuff:rail"

type SidebarProps = {
  identity: { name: string; tagline: string }
  counts: ReadonlyMap<string, number>
  viewer: Viewer | null
}

export const Sidebar = ({ identity, counts, viewer }: SidebarProps) => {
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
        "sticky top-0 z-20 hidden h-dvh shrink-0 flex-col border-r border-line bg-page/85 backdrop-blur-md glass-edge lg:flex",
        "transition-[width] duration-200 ease-ui",
        collapsed ? "w-14" : "w-56",
      )}
    >
      {/*
       * The wordmark is a fixed strip at the top of the rail, the same height
       * as the toolbar beside it and sharing its bottom hairline, so the two
       * read as one header bar.
       */}
      <Link
        href="/"
        title={collapsed ? identity.name : undefined}
        className={cn(
          "flex h-14 shrink-0 items-center gap-2 border-b border-line text-lead font-semibold tracking-tight text-ink",
          collapsed ? "justify-center px-0" : "px-4",
        )}
      >
        <span aria-hidden className="size-2 shrink-0 rounded-[2px] bg-brand" />
        {!collapsed ? (
          <span translate="no" className="truncate">
            {identity.name}
          </span>
        ) : null}
      </Link>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-2 py-2">
        <SidebarNav counts={counts} isCollapsed={collapsed} />

        <div className={cn("mt-auto flex flex-col gap-1 pt-4", collapsed && "items-stretch")}>
          {viewer ? (
            <>
              {!collapsed ? (
                <p className="truncate px-2.5 pb-1.5 font-mono text-micro text-ink-4">
                  {viewer.email}
                </p>
              ) : null}
              <FooterLink
                href="/submit"
                label="Submit Tool"
                isCollapsed={collapsed}
                icon={<PlusIcon />}
              />
              <FooterLink
                href="/account"
                label="Account"
                isCollapsed={collapsed}
                icon={<UserIcon />}
              />
              <SignOutButton collapsed={collapsed} />
            </>
          ) : (
            <FooterLink
              href="/signup"
              label="Submit Tool"
              isCollapsed={collapsed}
              icon={<PlusIcon />}
            />
          )}

          <FooterLink href="/free" label="Free" isCollapsed={collapsed} icon={<GiftIcon />} />
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
              "mt-1 flex h-6 w-full items-center gap-1.5 rounded-control px-2 text-small text-ink-4 transition-colors duration-150 ease-ui hover:bg-accent hover:text-ink-2",
              collapsed && "justify-center px-0",
            )}
          >
            <ChevronIcon
              className={cn("transition-transform duration-200", collapsed && "rotate-180")}
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
      "group flex h-6 items-center gap-1.5 rounded-control px-2 text-small text-ink-3 transition-colors duration-150 ease-ui hover:bg-accent hover:text-ink",
      isCollapsed && "justify-center px-0",
    )}
  >
    <span className="grid size-4 shrink-0 place-items-center text-ink-4 transition-colors duration-150 group-hover:text-ink-3 [&_svg]:size-3.5">
      {icon}
    </span>
    {!isCollapsed ? <span className="truncate">{label}</span> : null}
  </Link>
)
