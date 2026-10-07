/**
 * The one icon entry point.
 *
 * The artwork is Reicon, not hand drawn and not Lucide. reicon-react ships
 * two weights; this project uses duotone where the beta BoldDuotone set has
 * the glyph, and `Filled` everywhere else. Duotone is the same base path as
 * Filled with a detail path at half opacity, so the two still read as one
 * set, and both paint through `currentColor` so the theme owns the colour.
 * Outline is never used: it reads as wireframe next to dense monospace type.
 *
 * Everything is wrapped rather than re-exported so the project keeps one import
 * surface and one set of house rules:
 * - weight is decided here (duotone, else Filled); no call site picks it
 * - `size-4` and `shrink-0` baked in, so a bare icon is never misaligned.
 *   Reicon renders `width`/`height` attributes at 24; the class wins.
 * - `aria-hidden`, because every icon here sits next to a text label
 *
 * The generated shadcn files under `src/components/ui/` import reicon-react
 * directly instead of through here, the same escape hatch they had with
 * Lucide. None of their glyphs exist in the duotone set, so they pass
 * `weight="Filled"` at the call site. A future `shadcn add` will reintroduce
 * lucide-react imports; re-map them before committing.
 *
 * The duotone subset is vendored by `npm run duotone:vendor` — when adding a
 * glyph here that the set covers, add its reicon name to the script's list.
 */

import {
  AlertCircle,
  ArrowUpRightSquare,
  Bullhorn,
  Check,
  ChevronLeft,
  Cloud,
  Component,
  Database,
  Frame,
  Gift,
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
import { DUOTONE } from "./duotone-data"

type IconProps = {
  className?: string
}

const kebab = (name: string): string => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()

/**
 * Every icon is the same component with a different glyph, so the wrapper is
 * generated once. It is a named function rather than an arrow so the component
 * keeps a name in the React tree and in DevTools. The duotone lookup happens
 * at module scope, once, from the glyph's own display name.
 */
const icon = (Glyph: IconComponent) => {
  const duotone = Glyph.displayName ? DUOTONE[kebab(Glyph.displayName)] : undefined

  return function Icon({ className }: IconProps) {
    if (duotone) {
      return (
        <svg
          aria-hidden
          focusable={false}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          className={cn("reicon size-4 shrink-0", className)}
          dangerouslySetInnerHTML={{ __html: duotone }}
        />
      )
    }

    return (
      <Glyph
        aria-hidden
        focusable={false}
        weight="Filled"
        className={cn("size-4 shrink-0", className)}
      />
    )
  }
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
