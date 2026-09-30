"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { SidebarContent } from "@/components/layout/sidebar-content"
import type { RailItem } from "@/components/layout/tree-nav"

type MobileNavProps = {
  identity: { name: string; tagline: string }
  navigation: RailItem[]
  sections: RailItem[]
}

const Bars = ({ isOpen }: { isOpen: boolean }) => (
  <span aria-hidden className="relative flex size-3.5 flex-col items-center justify-center">
    <span
      className={`absolute h-px w-3.5 bg-current transition-transform duration-200 ${
        isOpen ? "translate-y-[3px] rotate-45" : "-translate-y-[2px]"
      }`}
    />
    <span
      className={`absolute h-px w-3.5 bg-current transition-transform duration-200 ${
        isOpen ? "-translate-y-[2px] -rotate-45" : "translate-y-[2px]"
      }`}
    />
  </span>
)

export const MobileNav = ({ identity, navigation, sections }: MobileNavProps) => {
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
        <Bars isOpen={false} />
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
                className="drawer-panel absolute inset-y-0 left-0 flex w-[17rem] max-w-[82vw] flex-col overflow-y-auto overscroll-contain border-r border-line bg-surface px-5 py-5"
              >
                <div className="mb-4 flex justify-end">
                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close navigation"
                    className="-mr-1.5 -mt-1 flex size-8 items-center justify-center rounded-chip text-ink-3 transition-colors hover:bg-field hover:text-ink"
                  >
                    <Bars isOpen />
                  </button>
                </div>

                <SidebarContent
                  identity={identity}
                  navigation={navigation}
                  sections={sections}
                  onNavigate={() => setIsOpen(false)}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
