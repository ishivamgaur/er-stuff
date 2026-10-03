import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { SidebarRail } from "@/components/layout/sidebar-rail"
import { Toolbar } from "@/components/layout/toolbar"
import { CATEGORIES } from "@/config/categories"
import { NAV_GROUPS } from "@/config/navigation-groups"
import { SITE, SITE_URL } from "@/config/site"
import { findCategoryToolCounts } from "@/lib/db/categories"
import { findTotalToolCount } from "@/lib/db/tools"
import { getCurrentUser } from "@/lib/auth/session"
import type { Viewer } from "@/components/layout/viewer"
import { SmoothScroll } from "@/components/layout/smooth-scroll"
import "./globals.css"

/**
 * One family, Geist, for everything.
 *
 * A second monospace face was reserved for data, which is a real idea, but two
 * families in one product reads as unresolved rather than intentional, and the
 * numbers never needed the extra width. Tabular figures carry the data instead,
 * which is the part that actually mattered.
 */
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE.name,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    type: "website",
    siteName: SITE.name,
  },
}

const IDENTITY = {
  name: SITE.wordmark,
  tagline: SITE.tagline,
}

const THEME_SCRIPT = `(function(){try{var s=localStorage.getItem("theme");var t=s==="light"||s==="dark"?s:(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.dataset.theme=t;}catch(e){}})();`

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [total, counts, user] = await Promise.all([
    findTotalToolCount(),
    findCategoryToolCounts(),
    getCurrentUser(),
  ])

  const viewer: Viewer | null = user ? { id: user.id, email: user.email, role: user.role } : null
  const countBySlug = counts

  const hrefCounts = new Map<string, number>()
  for (const category of CATEGORIES) {
    hrefCounts.set(`/categories/${category.slug}`, countBySlug.get(category.slug) ?? 0)
  }

  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <SmoothScroll />
        <div className="mx-auto flex w-full max-w-6xl">
          <SidebarRail
            identity={IDENTITY}
            groups={NAV_GROUPS}
            counts={hrefCounts}
            viewer={viewer}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <Toolbar
              total={total}
              identity={IDENTITY}
              groups={NAV_GROUPS}
              counts={hrefCounts}
              viewer={viewer}
            />
            <main className="min-w-0 flex-1 px-5 py-8 sm:px-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
