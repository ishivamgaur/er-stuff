import Link from "next/link"
import { CountNav, TreeNav, type RailItem } from "@/components/layout/tree-nav"

type SidebarContentProps = {
  identity: { name: string; tagline: string }
  navigation: RailItem[]
  sections: RailItem[]
  onNavigate?: () => void
}

export const SidebarContent = ({
  identity,
  navigation,
  sections,
  onNavigate,
}: SidebarContentProps) => (
  <div className="flex min-h-full flex-col">
    <div>
      <Link
        href="/explore"
        {...(onNavigate ? { onClick: onNavigate } : {})}
        className="flex items-baseline gap-1.5 text-lead whitespace-nowrap"
      >
        <span aria-hidden className="shrink-0 text-accent">
          &gt;_
        </span>
        <span className="font-bold text-accent">{identity.name}</span>
        <span aria-hidden className="cursor-pulse text-accent">
          |
        </span>
      </Link>

      <p className="mt-2.5 max-w-[44ch] text-small leading-relaxed text-pretty text-ink-2">
        {identity.tagline}
      </p>
    </div>

    <div className="mt-6 flex flex-col gap-5 border-t border-line pt-5">
      <div>
        <p className="pb-1 text-body font-bold">Navigate</p>
        <TreeNav items={navigation} onNavigate={onNavigate} />
      </div>

      <div>
        <p className="pb-1 text-body font-bold">Sections</p>
        <CountNav items={sections} onNavigate={onNavigate} />
      </div>
    </div>

    <div className="mt-auto flex flex-col gap-0.5 border-t border-line pt-3 text-micro text-ink-3">
      <p>Free to browse, no account required.</p>
      <p>Pricing verified by a person, not a guess.</p>
    </div>
  </div>
)
