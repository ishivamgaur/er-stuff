"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { RailNav, type RailItem } from "@/components/layout/sidebar-rail"
import { SignOutButton } from "@/components/auth/sign-out-button"
import Link from "next/link"
import type { Viewer } from "@/components/layout/viewer"
import { CloseIcon, MenuIcon, PromptIcon } from "@/components/icons"

type MobileNavProps = {
  identity: { name: string; tagline: string }
  navigation: RailItem[]
  sections: RailItem[]
  viewer: Viewer | null
}

export const MobileNav = ({ identity, navigation, sections, viewer }: MobileNavProps) => {
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
                    className="flex items-center gap-1.5 text-lead font-bold text-accent"
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
                  <p className="px-2 text-small leading-relaxed text-ink-3">{identity.tagline}</p>

                  <div className="mt-5 flex flex-col gap-5">
                    <div>
                      <p className="px-2 text-micro font-medium text-ink-4">Browse</p>
                      <div className="mt-1.5">
                        <RailNav
                          navigation={navigation}
                          sections={sections}
                          isCollapsed={false}
                          onNavigate={() => setIsOpen(false)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-1 border-t border-line pt-4">
                    {viewer ? (
                      <>
                        <p className="truncate px-2 pb-1 text-micro text-ink-4">{viewer.email}</p>
                        <DrawerLink href="/submit" label="List a product" />
                        <DrawerLink href="/account" label="Your account" />
                        <SignOutButton />
                      </>
                    ) : (
                      <DrawerLink href="/signup" label="List a product" />
                    )}
                    <DrawerLink href="/sponsors" label="Sponsors" />
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

const DrawerLink = ({ href, label }: { href: string; label: string }) => (
  <Link
    href={href}
    className="rounded-chip px-2 py-1.5 text-small text-ink-2 transition-colors hover:bg-field hover:text-ink"
  >
    {label}
  </Link>
)
