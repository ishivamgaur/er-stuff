import Link from "next/link"
import { MobileNav } from "@/components/layout/mobile-nav"
import { CommandPalette } from "@/components/search/command-palette"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { AccountMenu } from "@/components/auth/account-menu"
import { buttonVariants } from "@/components/ui/button"
import type { Viewer } from "@/components/layout/viewer"

type ToolbarProps = {
  total: number
  identity: { name: string; tagline: string }
  counts: ReadonlyMap<string, number>
  viewer: Viewer | null
}

export const Toolbar = ({ total, identity, counts, viewer }: ToolbarProps) => (
  <div className="sticky top-0 z-30 flex h-14 items-center gap-1.5 border-b border-line bg-page/85 px-4 backdrop-blur-md sm:px-6">
    <MobileNav identity={identity} counts={counts} viewer={viewer} />

    <CommandPalette />

    <p className="numeric ml-2 hidden text-ink-4 md:block">{total} tools</p>

    <div className="ml-auto flex items-center gap-1">
      <ThemeToggle />
      {viewer ? (
        <AccountMenu viewer={viewer} />
      ) : (
        <Link href="/signup" className={buttonVariants({ size: "sm", className: "ml-1" })}>
          List a Product
        </Link>
      )}
    </div>
  </div>
)
