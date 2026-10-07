"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ALL_SECTIONS, NAV_ITEMS, sectionHref } from "@/config/nav"
import { SearchIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

type PaletteItem = {
  href: string
  label: string
  group: "Pages" | "Sections" | "Tools"
}

const STATIC_ITEMS: PaletteItem[] = [
  ...NAV_ITEMS.map((item) => ({
    href: item.href,
    label: item.label,
    group: "Pages" as const,
  })),
  ...ALL_SECTIONS.map((entry) => ({
    href: sectionHref(entry.nav, entry.section.id),
    label: entry.section.label,
    group: "Sections" as const,
  })),
]

const scoreItem = (item: PaletteItem, query: string): number => {
  const label = item.label.toLowerCase()
  if (label === query) return 100
  if (label.startsWith(query)) return 50
  if (label.includes(query)) return 25
  return 0
}

/*
 * Search, behind Ctrl/Cmd+K. Filtering stays in this component rather than in
 * cmdk so pages and tools share one ranking, and the autocomplete endpoint
 * only ever fires for real tool queries of two characters or more.
 */
export const CommandPalette = () => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [toolItems, setToolItems] = useState<PaletteItem[]>([])
  const [fetchedFor, setFetchedFor] = useState("")

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
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

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

  const matches = [
    ...STATIC_ITEMS.map((item) => ({ item, score: normalized ? scoreItem(item, normalized) : 1 })),
    ...visibleTools.map((item) => ({ item, score: scoreItem(item, normalized) + 10 })),
  ]
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 12)
    .map(({ item }) => item)

  const commit = (href: string) => {
    close()
    router.push(href)
  }

  const groups: Array<{ name: PaletteItem["group"]; items: PaletteItem[] }> = [
    { name: "Tools", items: matches.filter((item) => item.group === "Tools") },
    { name: "Sections", items: matches.filter((item) => item.group === "Sections") },
    { name: "Pages", items: matches.filter((item) => item.group === "Pages") },
  ]

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        aria-label="Search"
        className="gap-1.5 text-ink-3"
      >
        <SearchIcon />
        <span className="hidden sm:inline">Search</span>
        <span className="kbd hidden sm:inline-flex">Ctrl K</span>
      </Button>

      <CommandDialog
        open={isOpen}
        onOpenChange={(open) => (open ? setIsOpen(true) : close())}
        title="Search erstuff"
        description="Search tools, sections and pages"
      >
        <CommandInput
          placeholder="Search tools, sections and pages…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>{normalized.length === 0 ? "Type to search" : "No matches"}</CommandEmpty>
          {groups.map((group) =>
            group.items.length === 0 ? null : (
              <CommandGroup key={group.name} heading={group.name}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.href}
                    value={item.href}
                    onSelect={() => commit(item.href)}
                    className="cursor-pointer data-selected:bg-brand-tint data-selected:text-ink"
                  >
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    <span className="shrink-0 font-mono text-micro text-ink-4">
                      {group.name === "Tools"
                        ? "tool"
                        : group.name === "Pages"
                          ? "page"
                          : "section"}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ),
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
