"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { GridIcon, ListIcon } from "@/components/icons"
import { DEFAULT_VIEW, VIEW_COOKIE, type ListView } from "@/lib/view"

const STORAGE_KEY = "erstuff:view"
const CHANGE_EVENT = "erstuff:viewchange"

/*
 * The list layout preference, persisted two places at once: a cookie the
 * server reads so the first paint already shows the stored view (no flash,
 * no hydration mismatch), and localStorage the client reads for live updates
 * and other tabs. The two are written together on every toggle, so they only
 * disagree if the cookie was cleared by hand — and then both sides fall back
 * to the list.
 */
export const readView = (): ListView => {
  if (typeof window === "undefined") return DEFAULT_VIEW
  return window.localStorage.getItem(STORAGE_KEY) === "cards" ? "cards" : DEFAULT_VIEW
}

const writeView = (view: ListView) => {
  window.localStorage.setItem(STORAGE_KEY, view)
  document.cookie = `${VIEW_COOKIE}=${view}; path=/; max-age=31536000; SameSite=Lax`
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

const subscribeView = (onChange: () => void) => {
  window.addEventListener("storage", onChange)
  window.addEventListener(CHANGE_EVENT, onChange)

  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

export const useListView = (initial: ListView = DEFAULT_VIEW): ListView => {
  // Initialised from the server-read cookie, so the first client render
  // matches the server HTML exactly. Live changes arrive through the event.
  const [view, setView] = useState<ListView>(initial)

  useEffect(() => subscribeView(() => setView(readView())), [])

  return view
}

export const ViewToggle = ({ initialView = DEFAULT_VIEW }: { initialView?: ListView }) => {
  const view = useListView(initialView)
  const next: ListView = view === "list" ? "cards" : "list"
  const label = next === "cards" ? "Show as cards" : "Show as list"
  const Icon = next === "cards" ? GridIcon : ListIcon

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={() => writeView(next)}
      aria-label={label}
      title={label}
      className="shrink-0 text-ink-4"
    >
      <Icon />
    </Button>
  )
}
