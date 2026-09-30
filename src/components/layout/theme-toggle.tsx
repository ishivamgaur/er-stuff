"use client"

import { useSyncExternalStore } from "react"

const STORAGE_KEY = "theme"
const CHANGE_EVENT = "erstuff:themechange"

type Theme = "dark" | "light"

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange)
  window.addEventListener(CHANGE_EVENT, onChange)

  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

const getClientTheme = (): Theme =>
  document.documentElement.dataset.theme === "light" ? "light" : "dark"

const getServerTheme = (): Theme => "dark"

export const ThemeToggle = () => {
  const theme = useSyncExternalStore(subscribe, getClientTheme, getServerTheme)
  const nextTheme: Theme = theme === "dark" ? "light" : "dark"

  const toggle = () => {
    document.documentElement.dataset.theme = nextTheme
    window.localStorage.setItem(STORAGE_KEY, nextTheme)
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }

  const label = `Switch to ${nextTheme} theme`

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="flex size-8 items-center justify-center rounded-chip text-ink-3 transition-colors hover:bg-field hover:text-ink active:scale-[0.96]"
    >
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="size-3.5"
        data-icon="moon"
      >
        <path d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7Z" strokeLinejoin="round" />
      </svg>
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="size-3.5"
        data-icon="sun"
      >
        <circle cx="8" cy="8" r="3.25" />
        <path
          d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3 3l1 1M12 12l1 1M13 3l-1 1M4 12l-1 1"
          strokeLinecap="round"
        />
      </svg>
    </button>
  )
}
