import { MobileNav } from "@/components/layout/mobile-nav"
import { CommandPalette } from "@/components/search/command-palette"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import type { RailItem } from "@/components/layout/tree-nav"

type ToolbarProps = {
  total: number
  identity: { name: string; tagline: string }
  navigation: RailItem[]
  sections: RailItem[]
}

export const Toolbar = ({ total, identity, navigation, sections }: ToolbarProps) => (
  <div className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-page/90 px-4 backdrop-blur-sm sm:px-6">
    <MobileNav identity={identity} navigation={navigation} sections={sections} />

    <p className="font-mono text-micro tabular-nums text-ink-3">{total} tools indexed</p>

    <div className="ml-auto flex items-center gap-1">
      <CommandPalette />
      <span aria-hidden className="mx-1 hidden h-4 w-px bg-line sm:block" />
      <ThemeToggle />
    </div>
  </div>
)
