/**
 * The one icon entry point.
 *
 * The artwork is Lucide, not hand drawn. A hand drawn set was tried first and
 * replaced: at 16px it read as a wireframe, and a directory that renders
 * 48 logos already has enough custom marks. Lucide is a single 24 unit grid
 * with one stroke weight and `currentColor` throughout, so it stays consistent
 * with the 1px hairline language without anyone maintaining paths.
 *
 * Everything is wrapped rather than re-exported so the project keeps one import
 * surface and one set of house rules:
 * - 24 unit grid at 16px, stroke 1.5, which lands on exactly 1px, the same
 *   hairline as `border-line`. The library default of 2 was tried and it reads
 *   as product app chrome next to monospace type, which is the whole design
 *   language. The stroke is tied to the size: on a 24 unit grid a 1.5 stroke at
 *   16px is 1px, and the same stroke at 18px would be thinner than a hairline.
 * - `size-4` and `shrink-0` baked in, so a bare icon is never misaligned
 * - `aria-hidden`, because every icon here sits next to a text label
 */

import {
  AppWindow,
  Check,
  ChevronLeft,
  CircleAlert,
  CodeXml,
  Compass,
  Database,
  ExternalLink,
  Globe,
  KeyRound,
  Layers,
  LayoutGrid,
  LogOut,
  Megaphone,
  Menu,
  Moon,
  PenTool,
  Plus,
  Rocket,
  Search,
  Server,
  Sparkles,
  Sun,
  Terminal,
  Ticket,
  User,
  X,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"

type IconProps = {
  className?: string
}

const STROKE_WIDTH = 1.5

/**
 * Every icon is the same component with a different glyph, so the wrapper is
 * generated once. It is a named function rather than an arrow so the component
 * keeps a name in the React tree and in DevTools.
 */
const icon = (Glyph: LucideIcon) =>
  function Icon({ className }: IconProps) {
    return (
      <Glyph
        aria-hidden
        focusable={false}
        strokeWidth={STROKE_WIDTH}
        className={cn("size-4 shrink-0", className)}
      />
    )
  }

/** The prompt. The wordmark, not a logo mark, because it reads as a terminal. */
export const PromptIcon = icon(Terminal)

export const MenuIcon = icon(Menu)
export const CloseIcon = icon(X)
export const ChevronIcon = icon(ChevronLeft)
export const SearchIcon = icon(Search)
export const PlusIcon = icon(Plus)
export const SignOutIcon = icon(LogOut)
export const ExternalIcon = icon(ExternalLink)
export const SunIcon = icon(Sun)
export const MoonIcon = icon(Moon)
export const CheckIcon = icon(Check)
export const AlertIcon = icon(CircleAlert)
export const UserIcon = icon(User)
export const MegaphoneIcon = icon(Megaphone)

/*
 * Sidebar navigation icons. One metaphor per section, all from the same grid,
 * so no two rows in the list read as the same idea.
 */
export const CompassIcon = icon(Compass)
export const TicketIcon = icon(Ticket)
export const DesignPenIcon = icon(PenTool)
export const ModulesIcon = icon(LayoutGrid)
export const BrowserIcon = icon(AppWindow)
export const ServerIcon = icon(Server)
export const DatabaseIcon = icon(Database)
export const GlobeIcon = icon(Globe)
export const LaunchIcon = icon(Rocket)
export const SparkIcon = icon(Sparkles)
export const KeyIcon = icon(KeyRound)
export const CodeIcon = icon(CodeXml)
export const LayersIcon = icon(Layers)
