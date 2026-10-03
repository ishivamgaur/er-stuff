"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { CATEGORIES } from "@/config/categories"
import { PRIMARY_NAVIGATION } from "@/config/navigation"
import { SearchIcon } from "@/components/icons"
import { cn } from "@/lib/utils/cn"

type PaletteItem = {
  href: string
  label: string
  group: "Pages" | "Categories" | "Tools"
}

const STATIC_ITEMS: PaletteItem[] = [
  ...PRIMARY_NAVIGATION.map((item) => ({
    href: item.href,
    label: item.label,
    group: "Pages" as const,
  })),
  ...CATEGORIES.map((category) => ({
    href: `/categories/${category.slug}`,
    label: category.name,
    group: "Categories" as const,
  })),
]

const scoreItem = (item: PaletteItem, query: string): number => {
  const label = item.label.toLowerCase()
  if (label === query) return 100
  if (label.startsWith(query)) return 50
  if (label.includes(query)) return 25
  return 0
}

export const CommandPalette = () => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [toolItems, setToolItems] = useState<PaletteItem[]>([])
  const [fetchedFor, setFetchedFor] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const close = () => {
    setIsOpen(false)
    setQuery("")
    setToolItems([])
    setFetchedFor("")
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setIsOpen((open) => !open)
        return
      }

      if (event.key === "Escape") close()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    inputRef.current?.focus()
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const normalized = query.trim().toLowerCase()

  useEffect(() => {
    if (!isOpen || normalized.length < 2) return
    if (normalized === fetchedFor) return

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search/autocomplete?q=${encodeURIComponent(normalized)}`,
          { signal: controller.signal },
        )
        const payload = (await response.json()) as {
          data: { suggestions: Array<{ slug: string; label: string; kind: string }> }
        }

        setToolItems(
          payload.data.suggestions
            .filter((suggestion) => suggestion.kind === "tool")
            .map((suggestion) => ({
              href: `/tools/${suggestion.slug}`,
              label: suggestion.label,
              group: "Tools" as const,
            })),
        )
        setFetchedFor(normalized)
      } catch {
        setToolItems([])
      }
    }, 120)

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [isOpen, normalized, fetchedFor])

  const visibleTools = normalized.length < 2 ? [] : toolItems

  const items = [
    ...STATIC_ITEMS.map((item) => ({ item, score: normalized ? scoreItem(item, normalized) : 1 })),
    ...visibleTools.map((item) => ({ item, score: scoreItem(item, normalized) + 10 })),
  ]
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 12)
    .map(({ item }) => item)

  const [syncedQuery, setSyncedQuery] = useState(query)
  if (query !== syncedQuery) {
    setSyncedQuery(query)
    setActiveIndex(0)
  }

  const commit = (href: string) => {
    close()
    router.push(href)
  }

  const onInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, Math.max(items.length - 1, 0)))
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
      return
    }

    if (event.key === "Enter") {
      event.preventDefault()
      const target = items[activeIndex]
      if (target) commit(target.href)
    }
  }

  useEffect(() => {
    const active = listRef.current?.children[activeIndex] as HTMLElement | undefined
    active?.scrollIntoView({ block: "nearest" })
  }, [activeIndex])

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Search"
        className={cn(
          "hover-veil group flex h-8 items-center gap-1.5 rounded-chip pr-1.5 pl-2",
          "hover-veil-fill text-ink-3 transition-colors duration-200",
          "ease-[cubic-bezier(0.2,0,0,1)] hover:hover-veil-active hover:text-ink",
          "active:scale-[0.98]",
        )}
      >
        <SearchIcon className="transition-transform duration-200 group-hover:-translate-y-px" />
        <span className="hidden text-small sm:inline">Search</span>
        <span className="kbd hidden sm:inline-flex">Ctrl K</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh]">
      <button
        type="button"
        aria-label="Close search"
        onClick={close}
        className="palette-overlay absolute inset-0 bg-overlay"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search erstuff"
        className="palette-dialog relative w-full max-w-[26rem] overflow-hidden rounded-control border border-line-strong bg-surface shadow-[0_24px_64px_rgb(0_0_0/0.55)]"
      >
        <div className="flex items-center gap-2 border-b border-line-strong bg-field px-3 py-2.5">
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="size-3.5 shrink-0 text-ink-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5 14 14" strokeLinecap="round" />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Search tools, categories and pages"
            aria-label="Search"
            className="w-full bg-transparent text-body text-ink outline-none placeholder:text-ink-4"
          />

          <span className="kbd shrink-0">Esc</span>
        </div>

        <ul ref={listRef} className="max-h-[46vh] overflow-y-auto p-1">
          {items.length === 0 ? (
            <li className="px-2 py-6 text-center text-small text-ink-3">
              {normalized.length === 0 ? "Type to search" : "No matches"}
            </li>
          ) : (
            items.map((item, index) => (
              <li key={item.href}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => commit(item.href)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-chip px-2 py-1 text-left text-body transition-colors",
                    index === activeIndex ? "bg-field text-ink" : "text-ink-2 hover:text-ink",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  <span className="shrink-0 text-micro text-ink-3">{item.group}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
