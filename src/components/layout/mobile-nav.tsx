"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { RailNav } from "@/components/layout/sidebar-rail"
import type { NavGroupConfig } from "@/config/navigation-groups"
import { SignOutButton } from "@/components/auth/sign-out-button"
import Link from "next/link"
import type { Viewer } from "@/components/layout/viewer"
import {
  CloseIcon,
  MegaphoneIcon,
  MenuIcon,
  PlusIcon,
  PromptIcon,
  UserIcon,
} from "@/components/icons"

type MobileNavProps = {
  identity: { name: string; tagline: string }
  groups: readonly NavGroupConfig[]
  counts: ReadonlyMap<string, number>
  viewer: Viewer | null
}

export const MobileNav = ({ identity, groups, counts, viewer }: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const trigger = triggerRef.current
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
      trigger?.focus()
    }
  }, [isOpen])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation"
        aria-expanded={isOpen}
        aria-controls="mobile-nav-drawer"
        className="-ml-1.5 flex size-8 items-center justify-center rounded-chip text-ink-2 transition-colors hover:bg-field hover:text-ink lg:hidden"
      >
        <MenuIcon />
      </button>

      {isOpen
        ? createPortal(
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                type="button"
                aria-label="Close navigation"
                tabIndex={-1}
                onClick={() => setIsOpen(false)}
                className="drawer-backdrop absolute inset-0 bg-overlay"
              />

              <div
                id="mobile-nav-drawer"
                role="dialog"
                aria-modal="true"
                aria-label="Navigation"
                className="drawer-panel absolute inset-y-0 left-0 flex w-[16rem] max-w-[84vw] flex-col border-r border-line bg-page"
              >
                <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
                  <Link
                    href="/explore"
                    className="flex items-center gap-1.5 text-body font-bold text-accent"
                  >
                    <PromptIcon />
                    <span>{identity.name}</span>
                    <span aria-hidden className="cursor-blink text-ink-4">
                      |
                    </span>
                  </Link>
                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close navigation"
                    className="-mr-1.5 flex size-8 items-center justify-center rounded-chip text-ink-3 transition-colors hover:bg-field hover:text-ink"
                  >
                    <CloseIcon />
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
                  <div className="flex flex-col gap-5">
                    <div>
                      <div className="mt-1.5">
                        <RailNav
                          groups={groups}
                          counts={counts}
                          isCollapsed={false}
                          onNavigate={() => setIsOpen(false)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-1 border-t border-line pt-4">
                    {viewer ? (
                      <>
                        <p className="truncate px-2.5 pb-1 text-small text-ink-4">{viewer.email}</p>
                        <DrawerLink href="/submit" label="List a product" icon={<PlusIcon />} />
                        <DrawerLink href="/account" label="Your account" icon={<UserIcon />} />
                        <SignOutButton />
                      </>
                    ) : (
                      <DrawerLink href="/signup" label="List a product" icon={<PlusIcon />} />
                    )}
                    <DrawerLink href="/sponsors" label="Sponsors" icon={<MegaphoneIcon />} />
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

const DrawerLink = ({
  href,
  label,
  icon,
}: {
  href: string
  label: string
  icon: React.ReactNode
}) => (
  <Link
    href={href}
    className="hover-veil group flex min-h-7 items-center gap-2.5 rounded-chip px-2.5 hover-veil-fill text-body text-ink-2 transition-colors duration-150 ease-ui hover:hover-veil-active hover:text-ink"
  >
    <span
      aria-hidden
      className="grid size-5 shrink-0 place-items-center text-ink-3 transition-colors duration-150 group-hover:text-ink-2"
    >
      {icon}
    </span>
    <span className="min-w-0 flex-1 truncate">{label}</span>
  </Link>
)
