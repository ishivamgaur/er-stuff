import { MobileNav } from "@/components/layout/mobile-nav"
import { CommandPalette } from "@/components/search/command-palette"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import type { NavGroupConfig } from "@/config/navigation-groups"
import type { Viewer } from "@/components/layout/viewer"

type ToolbarProps = {
  total: number
  identity: { name: string; tagline: string }
  groups: readonly NavGroupConfig[]
  counts: ReadonlyMap<string, number>
  viewer: Viewer | null
}

export const Toolbar = ({ total, identity, groups, counts, viewer }: ToolbarProps) => (
  <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-page/85 px-4 backdrop-blur-md sm:px-8">
    <MobileNav identity={identity} groups={groups} counts={counts} viewer={viewer} />

    <p className="numeric text-small text-ink-4">{total} tools</p>

    <div className="ml-auto flex items-center gap-1.5">
      <CommandPalette />
      <ThemeToggle />
    </div>
  </div>
)
