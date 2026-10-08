import { createElement, type ComponentType } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import type { IconComponent } from "reicon-react"
import {
  AlertCircle,
  AlignLeft,
  ArrowUpRightSquare,
  Bullhorn,
  Check,
  ChevronLeft,
  Cloud,
  Component,
  Database,
  Frame,
  Gift,
  Grid,
  Inbox,
  InfoCircle,
  Logout,
  Menu,
  Palette,
  Plus,
  Search,
  Server,
  Shapes,
  ShieldCheck,
  Ship,
  Sparkle,
  Telescope,
  TerminalSquare,
  User,
  X,
} from "reicon-react"
import * as Icons from "@/components/icons"

type AnyComponent = ComponentType<Record<string, unknown>>

const glyphs: [unknown, IconComponent][] = [
  [Icons.PromptIcon, TerminalSquare],
  [Icons.MenuIcon, Menu],
  [Icons.CloseIcon, X],
  [Icons.ChevronIcon, ChevronLeft],
  [Icons.SearchIcon, Search],
  [Icons.PlusIcon, Plus],
  [Icons.SignOutIcon, Logout],
  [Icons.ExternalIcon, ArrowUpRightSquare],
  [Icons.CheckIcon, Check],
  [Icons.AlertIcon, AlertCircle],
  [Icons.InfoIcon, InfoCircle],
  [Icons.InboxIcon, Inbox],
  [Icons.UserIcon, User],
  [Icons.MegaphoneIcon, Bullhorn],
  [Icons.TelescopeIcon, Telescope],
  [Icons.GiftIcon, Gift],
  [Icons.ListIcon, AlignLeft],
  [Icons.GridIcon, Grid],
  [Icons.ShapesIcon, Shapes],
  [Icons.PaletteIcon, Palette],
  [Icons.ComponentIcon, Component],
  [Icons.FrameIcon, Frame],
  [Icons.ServerCogIcon, Server],
  [Icons.ShieldIcon, ShieldCheck],
  [Icons.DatabaseZapIcon, Database],
  [Icons.CloudIcon, Cloud],
  [Icons.ShipIcon, Ship],
  [Icons.BotIcon, Sparkle],
  [Icons.TerminalIcon, TerminalSquare],
]

const render = (component: unknown, props: Record<string, unknown> = {}) =>
  renderToStaticMarkup(createElement(component as AnyComponent, props))

describe("icon set", () => {
  it("covers every export", () => {
    expect(Object.keys(Icons).length).toBe(glyphs.length)
  })

  it("renders a path for every icon", () => {
    for (const [Icon] of glyphs) {
      expect(render(Icon), "icon rendered no path").toContain('d="')
    }
  })

  it("renders every icon Filled at the house size", () => {
    for (const [Icon, Glyph] of glyphs) {
      const wrapped = render(Icon)
      const filled = render(Glyph, {
        "aria-hidden": true,
        focusable: false,
        weight: "Filled",
        className: "size-3.5 shrink-0",
      })
      expect(wrapped, "wrapper output is not Filled").toBe(filled)
    }
  })

  it("every glyph ships Filled data distinct from Outline", () => {
    for (const [, Glyph] of glyphs) {
      const filled = render(Glyph, { weight: "Filled" })
      const outline = render(Glyph, { weight: "Outline" })
      expect(filled, "Filled fell back to Outline").not.toBe(outline)
    }
  })
})
