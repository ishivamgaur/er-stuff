import { SidebarContent } from "@/components/layout/sidebar-content"
import type { RailItem } from "@/components/layout/tree-nav"

type SidebarRailProps = {
  identity: { name: string; tagline: string }
  navigation: RailItem[]
  sections: RailItem[]
}

export const SidebarRail = ({ identity, navigation, sections }: SidebarRailProps) => (
  <aside className="hidden px-6 pt-[clamp(1rem,4vh,2rem)] pb-6 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:border-r lg:border-line">
    <SidebarContent identity={identity} navigation={navigation} sections={sections} />
  </aside>
)
