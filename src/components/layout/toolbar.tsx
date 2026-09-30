import { MobileNav } from "@/components/layout/mobile-nav"
import { CommandPalette } from "@/components/search/command-palette"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import type { RailItem } from "@/components/layout/sidebar-rail"
import type { Viewer } from "@/components/layout/viewer"

type ToolbarProps = {
  total: number
  identity: { name: string; tagline: string }
  navigation: RailItem[]
  sections: RailItem[]
  viewer: Viewer | null
}

export const Toolbar = ({ total, identity, navigation, sections, viewer }: ToolbarProps) => (
  <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-page/85 px-4 backdrop-blur-md sm:px-8">
    <MobileNav identity={identity} navigation={navigation} sections={sections} viewer={viewer} />

    <p className="numeric text-small text-ink-4">{total} tools</p>

    <div className="ml-auto flex items-center gap-1.5">
      <CommandPalette />
      <ThemeToggle />
    </div>
  </div>
)
