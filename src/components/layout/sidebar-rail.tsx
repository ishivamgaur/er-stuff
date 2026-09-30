"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CategoryMark,
  ChevronIcon,
  MegaphoneIcon,
  PlusIcon,
  PromptIcon,
  UserIcon,
} from "@/components/icons"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { cn } from "@/lib/utils/cn"
import type { Viewer } from "@/components/layout/viewer"

export type RailItem = {
  label: string
  href: string
  count?: number
}

type OnNavigate = (() => void) | undefined

const isActive = (pathname: string, href: string): boolean =>
  href === "/explore" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)

/**
 * 40px hit area, matching the skill's floor for a dense desktop rail. The row
 * itself is 32px so the list stays compact, so the area is extended with a
 * pseudo element rather than by making the row tall.
 */
const NavRow = ({
  item,
  onNavigate,
  isCollapsed,
  showCount,
}: {
  item: RailItem
  onNavigate: OnNavigate
  isCollapsed: boolean
  showCount: boolean
}) => {
  const pathname = usePathname()
  const active = isActive(pathname, item.href)

  return (
    <Link
      href={item.href}
      {...(onNavigate ? { onClick: onNavigate } : {})}
      {...(active ? { "aria-current": "page" as const } : {})}
      title={isCollapsed ? item.label : undefined}
      className={cn(
        "relative flex min-h-10 items-center gap-2.5 rounded-chip px-2 text-body transition-colors duration-150",
        "after:absolute after:inset-y-1.5 after:left-0 after:right-0 after:-z-10 after:content-['']",
        isCollapsed ? "justify-center px-0" : "pl-2.5",
        active ? "text-accent" : "text-ink-2 hover:text-ink",
      )}
    >
      {isCollapsed ? <CategoryMark label={item.label} /> : null}

      {!isCollapsed ? <span className="min-w-0 flex-1 truncate">{item.label}</span> : null}

      {showCount && item.count !== undefined ? (
        <span className={cn("numeric shrink-0 text-small", active ? "text-accent" : "text-ink-4")}>
          {item.count}
        </span>
      ) : null}

      {active && !isCollapsed ? (
        <span
          aria-hidden
          className="absolute top-1/2 -left-2.5 h-4 w-0.5 -translate-y-1/2 rounded-full bg-accent"
        />
      ) : null}
    </Link>
  )
}

const NavList = ({
  items,
  onNavigate,
  isCollapsed,
  showCount,
}: {
  items: RailItem[]
  onNavigate: OnNavigate
  isCollapsed: boolean
  showCount: boolean
}) => (
  <nav className="flex flex-col">
    {items.map((item) => (
      <NavRow
        key={item.href}
        item={item}
        onNavigate={onNavigate}
        isCollapsed={isCollapsed}
        showCount={showCount}
      />
    ))}
  </nav>
)

export const RailNav = ({
  navigation,
  sections,
  onNavigate,
  isCollapsed,
}: {
  navigation: RailItem[]
  sections: RailItem[]
  onNavigate?: OnNavigate
  isCollapsed: boolean
}) => (
  <>
    <NavList
      items={navigation}
      onNavigate={onNavigate}
      isCollapsed={isCollapsed}
      showCount={false}
    />
    <NavList items={sections} onNavigate={onNavigate} isCollapsed={isCollapsed} showCount />
  </>
)

const STORAGE_KEY = "erstuff:rail"

type SidebarRailProps = {
  identity: { name: string; tagline: string }
  navigation: RailItem[]
  sections: RailItem[]
  viewer: Viewer | null
}

export const SidebarRail = ({ identity, navigation, sections, viewer }: SidebarRailProps) => {
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
        "transition-[width] duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
        collapsed ? "w-14" : "w-60",
      )}
    >
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain py-4",
          collapsed ? "px-2" : "px-3",
        )}
      >
        <Link
          href="/explore"
          title={collapsed ? identity.name : undefined}
          className={cn(
            "flex min-h-9 items-center gap-2 rounded-chip text-lead font-bold text-accent",
            collapsed ? "justify-center" : "px-1.5",
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

        {!collapsed ? (
          <p className="mt-2 px-1.5 text-small leading-relaxed text-pretty text-ink-3">
            {identity.tagline}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-1">
          <RailNav navigation={navigation} sections={sections} isCollapsed={collapsed} />
        </div>

        <div className={cn("mt-auto flex flex-col gap-0.5 pt-6", collapsed && "items-stretch")}>
          {viewer ? (
            <>
              {!collapsed ? (
                <p className="truncate px-1.5 pb-1 text-micro text-ink-4">{viewer.email}</p>
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
              "mt-1 flex min-h-9 w-full items-center gap-2.5 rounded-chip px-1.5 text-small text-ink-4 transition-colors duration-150 hover:bg-field hover:text-ink-2",
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
      "flex min-h-9 items-center gap-2.5 rounded-chip px-1.5 text-small text-ink-3 transition-colors duration-150 hover:bg-field hover:text-ink",
      isCollapsed && "justify-center px-0",
    )}
  >
    {icon}
    {!isCollapsed ? <span className="truncate">{label}</span> : null}
  </Link>
)
