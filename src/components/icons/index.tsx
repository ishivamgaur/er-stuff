/**
 * The one icon source for app code.
 *
 * The artwork is Reicon, always the Filled weight: one weight everywhere, so
 * a menu glyph never renders with a different voice than its neighbours.
 * Duotone was tried and removed — at 14px the half-opacity detail layer
 * turns to mud, and thirteen duotone glyphs beside fifteen Filled ones never
 * read as one set. Both paint through `currentColor` so the theme owns the
 * colour. Outline is never used: it reads as wireframe next to dense mono
 * type.
 *
 * Everything is wrapped rather than re-exported so the project keeps one import
 * surface and one set of house rules:
 * - `weight="Filled"` here, never at a call site; no call site picks a weight
 * - `size-3.5` and `shrink-0` baked in, so a bare icon is never misaligned.
 *   Reicon renders `width`/`height` attributes at 24; the class wins.
 * - `aria-hidden`, because every icon here sits next to a text label
 *
 * The generated shadcn files under `src/components/ui/` import reicon-react
 * directly instead of through here, the same escape hatch they had with
 * Lucide. They pass `weight="Filled"` at each call site — the same weight
 * as here, so generated and app icons never diverge. A future `shadcn add`
 * will reintroduce lucide-react imports; re-map them before committing.
 */

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
  type IconComponent,
} from "reicon-react"
import { cn } from "@/lib/utils"

type IconProps = {
  className?: string
}

/**
 * Every icon is the same component with a different glyph, so the wrapper is
 * generated once. It is a named function rather than an arrow so the component
 * keeps a name in the React tree and in DevTools.
 */
const icon = (Glyph: IconComponent) =>
  function Icon({ className }: IconProps) {
    return (
      <Glyph
        aria-hidden
        focusable={false}
        weight="Filled"
        className={cn("size-3.5 shrink-0", className)}
      />
    )
  }

/** The prompt. The wordmark, not a logo mark, because it reads as a terminal. */
export const PromptIcon = icon(TerminalSquare)

export const MenuIcon = icon(Menu)
export const CloseIcon = icon(X)
export const ChevronIcon = icon(ChevronLeft)
export const SearchIcon = icon(Search)
export const PlusIcon = icon(Plus)
export const SignOutIcon = icon(Logout)
export const ExternalIcon = icon(ArrowUpRightSquare)
export const CheckIcon = icon(Check)
export const AlertIcon = icon(AlertCircle)
export const InfoIcon = icon(InfoCircle)
export const InboxIcon = icon(Inbox)
export const UserIcon = icon(User)
export const MegaphoneIcon = icon(Bullhorn)

/*
 * The sidebar set. Each row gets a glyph with its own silhouette (a
 * telescope for discovery, a gift for free, a shield for auth), so scanning
 * the rail never means telling twelve near-identical outlines apart.
 */
export const TelescopeIcon = icon(Telescope)
export const GiftIcon = icon(Gift)
/* The rows glyph. `List` has no distinct Filled weight, so the toggle reads it from AlignLeft. */
export const ListIcon = icon(AlignLeft)
export const GridIcon = icon(Grid)
export const ShapesIcon = icon(Shapes)
export const PaletteIcon = icon(Palette)
export const ComponentIcon = icon(Component)
export const FrameIcon = icon(Frame)
export const ServerCogIcon = icon(Server)
export const ShieldIcon = icon(ShieldCheck)
export const DatabaseZapIcon = icon(Database)
export const CloudIcon = icon(Cloud)
export const ShipIcon = icon(Ship)
export const BotIcon = icon(Sparkle)
export const TerminalIcon = icon(TerminalSquare)
