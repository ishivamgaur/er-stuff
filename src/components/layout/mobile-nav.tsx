"use client"

import { useState } from "react"
import Link from "next/link"
import { SidebarNav } from "@/components/layout/sidebar"
import type { Viewer } from "@/components/layout/viewer"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import {
  CloseIcon,
  GiftIcon,
  MegaphoneIcon,
  MenuIcon,
  PlusIcon,
  UserIcon,
} from "@/components/icons"

type MobileNavProps = {
  identity: { name: string; tagline: string }
  counts: ReadonlyMap<string, number>
  viewer: Viewer | null
}

/*
 * The drawer. It renders the same SidebarNav as the desktop rail, so the two
 * can never disagree about labels, counts or the active row, and the checks
 * rely on it: drawer links and rail links share a size because they are one
 * component.
 *
 * The panel is 16rem wide at a 390px viewport, which leaves a full-height
 * backdrop strip on the right for the tap-to-close assertion.
 */
export const MobileNav = ({ identity, counts, viewer }: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const close = () => setIsOpen(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation"
        aria-expanded={isOpen}
        aria-controls="mobile-nav-drawer"
        className="-ml-1.5 lg:hidden"
      >
        <MenuIcon />
      </Button>

      <SheetContent
        side="left"
        id="mobile-nav-drawer"
        aria-label="Navigation"
        aria-modal="true"
        showCloseButton={false}
        style={{ width: "16rem" }}
        className="gap-0 border-line bg-page p-0 glass-edge lg:hidden"
      >
        <SheetTitle className="sr-only">Navigation</SheetTitle>

        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
          <Link
            href="/"
            onClick={close}
            className="flex items-center gap-2 text-lead font-semibold tracking-tight text-ink"
          >
            <span aria-hidden className="size-2 shrink-0 rounded-[2px] bg-brand" />
            <span>{identity.name}</span>
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={close}
            aria-label="Close navigation"
          >
            <CloseIcon />
          </Button>
        </div>

        <div
          data-lenis-prevent
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2"
        >
          <SidebarNav counts={counts} onNavigate={close} isCollapsed={false} />

          <div className="mt-4 flex flex-col gap-1 border-t border-line pt-3">
            {viewer ? (
              <>
                <p className="truncate px-2.5 pb-1 font-mono text-micro text-ink-4">
                  {viewer.email}
                </p>
                <DrawerLink
                  href="/submit"
                  label="Submit Tool"
                  icon={<PlusIcon />}
                  onNavigate={close}
                />
                <DrawerLink
                  href="/account"
                  label="Account"
                  icon={<UserIcon />}
                  onNavigate={close}
                />
                <SignOutButton />
              </>
            ) : (
              <DrawerLink
                href="/signup"
                label="Submit Tool"
                icon={<PlusIcon />}
                onNavigate={close}
              />
            )}
            <DrawerLink href="/free" label="Free" icon={<GiftIcon />} onNavigate={close} />
            <DrawerLink
              href="/sponsors"
              label="Sponsors"
              icon={<MegaphoneIcon />}
              onNavigate={close}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

const DrawerLink = ({
  href,
  label,
  icon,
  onNavigate,
}: {
  href: string
  label: string
  icon: React.ReactNode
  onNavigate: () => void
}) => (
  <Link
    href={href}
    onClick={onNavigate}
    className="group flex h-6 items-center gap-1.5 rounded-control px-2 text-small text-ink-2 transition-colors duration-150 ease-ui hover:text-ink"
  >
    <span
      aria-hidden
      className="grid size-4 shrink-0 place-items-center text-ink-4 transition-colors duration-150 group-hover:text-ink-3"
    >
      {icon}
    </span>
    <span className="min-w-0 flex-1 truncate">{label}</span>
  </Link>
)
