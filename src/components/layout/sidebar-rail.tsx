import Link from "next/link"
import { SidebarContent } from "@/components/layout/sidebar-content"
import { SignOutButton } from "@/components/auth/sign-out-button"
import type { RailItem } from "@/components/layout/tree-nav"
import type { Viewer } from "@/components/layout/viewer"

type SidebarRailProps = {
  identity: { name: string; tagline: string }
  navigation: RailItem[]
  sections: RailItem[]
  viewer: Viewer | null
}

export const SidebarRail = ({ identity, navigation, sections, viewer }: SidebarRailProps) => (
  <aside className="hidden px-6 pt-[clamp(1rem,4vh,2rem)] pb-6 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:border-r lg:border-line">
    <div className="flex min-h-full w-full flex-col">
      <SidebarContent identity={identity} navigation={navigation} sections={sections} />

      <div className="mt-auto border-t border-line pt-3">
        {viewer ? (
          <div className="flex flex-col gap-1">
            <p className="truncate text-micro text-ink-4">signed in as {viewer.email}</p>
            <Link
              href="/submit"
              className="text-micro text-ink-3 underline decoration-transparent decoration-from-font underline-offset-[0.3em] transition-colors hover:text-ink-2 hover:decoration-current"
            >
              [+] List your product
            </Link>
            <Link
              href="/account"
              className="text-micro text-ink-3 underline decoration-transparent decoration-from-font underline-offset-[0.3em] transition-colors hover:text-ink-2 hover:decoration-current"
            >
              [+] Your account
            </Link>
            <SignOutButton />
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <p className="text-micro text-ink-3">Free to browse, no account required.</p>
            <Link
              href="/signup"
              className="text-micro text-ink-3 underline decoration-transparent decoration-from-font underline-offset-[0.3em] transition-colors hover:text-ink-2 hover:decoration-current"
            >
              [+] List your product
            </Link>
            <Link
              href="/signin"
              className="text-micro text-ink-4 underline decoration-transparent decoration-from-font underline-offset-[0.3em] transition-colors hover:text-ink-3 hover:decoration-current"
            >
              [=] Sign in
            </Link>
          </div>
        )}

        <Link
          href="/sponsors"
          className="mt-2 block w-fit text-micro text-ink-4 underline decoration-transparent decoration-from-font underline-offset-[0.3em] transition-colors hover:text-ink-2 hover:decoration-current"
        >
          [Sponsors &amp; disclosure]
        </Link>
      </div>
    </div>
  </aside>
)
