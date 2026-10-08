"use client"

import { useSyncExternalStore } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "theme"
const CHANGE_EVENT = "erstuff:themechange"
const GUARD_CLASS = "theme-swap"

type Theme = "dark" | "light"

/*
 * The flip itself is instant — the `dark` class changes in this task, so the
 * next paint already has the new palette. What is not instant is everything
 * with its own colour transition: those interpolate from the old palette to
 * the new one and the page melts for a beat. So the guard class (see
 * globals.css: transitions off tree-wide, glyphs excepted) goes on before the
 * class flips and comes off two frames after, once the new palette has been
 * painted as one piece. The generation counter makes rapid toggles safe:
 * only the newest swap releases the guard, and never an older one.
 */
let guardGeneration = 0

const withGuard = (swap: () => void) => {
  const root = document.documentElement
  root.classList.add(GUARD_CLASS)
  swap()

  const generation = ++guardGeneration
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (generation === guardGeneration) root.classList.remove(GUARD_CLASS)
    })
  })
}

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange)
  window.addEventListener(CHANGE_EVENT, onChange)

  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

/*
 * The `dark` class on the root element is the theme. It is the shadcn
 * convention, so the `dark:` variant works in every installed component, and
 * the inline script in the layout sets it before first paint.
 */
const getClientTheme = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light"

const getServerTheme = (): Theme => "dark"

/*
 * Hand-drawn sun and moon, animated by hand. Both glyphs stay in the DOM
 * stacked on each other; the toggle cross-fades them with a quarter turn and
 * a settle from half scale, so dusk reads as a rotation rather than a swap.
 * This is the one deliberate exception to the no-inline-SVG rule: the motion
 * needs both shapes present and transitioning against each other.
 */
const GLYPH = "size-3.5 transition-[opacity,transform] duration-300 ease-ui"

const MoonGlyph = ({ visible }: { visible: boolean }) => (
  <svg
    aria-hidden
    data-theme-glyph
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className={cn(
      GLYPH,
      visible ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0",
    )}
  >
    <path d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7Z" strokeLinejoin="round" />
  </svg>
)

const SunGlyph = ({ visible }: { visible: boolean }) => (
  <svg
    aria-hidden
    data-theme-glyph
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    className={cn(
      GLYPH,
      "absolute inset-0 m-auto",
      visible ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-50 opacity-0",
    )}
  >
    <circle cx="8" cy="8" r="3" />
    <path d="M8 1.2v1.6M8 13.2v1.6M1.2 8h1.6M13.2 8h1.6M3.3 3.3l1.1 1.1M11.6 11.6l1.1 1.1M12.7 3.3l-1.1 1.1M4.4 11.6l-1.1 1.1" />
  </svg>
)

export const ThemeToggle = () => {
  const theme = useSyncExternalStore(subscribe, getClientTheme, getServerTheme)
  const nextTheme: Theme = theme === "dark" ? "light" : "dark"

  const toggle = () => {
    withGuard(() => {
      document.documentElement.classList.toggle("dark", nextTheme === "dark")
    })
    window.localStorage.setItem(STORAGE_KEY, nextTheme)
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }

  const label = `Switch to ${nextTheme} theme`

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="relative"
    >
      <MoonGlyph visible={theme === "dark"} />
      <SunGlyph visible={theme === "light"} />
    </Button>
  )
}
