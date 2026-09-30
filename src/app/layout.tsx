import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"
import { SidebarRail } from "@/components/layout/sidebar-rail"
import { Toolbar } from "@/components/layout/toolbar"
import { CATEGORIES } from "@/config/categories"
import { PRIMARY_NAVIGATION } from "@/config/navigation"
import { SITE, SITE_URL } from "@/config/site"
import { findCategoryToolCounts } from "@/lib/db/categories"
import { findTotalToolCount } from "@/lib/db/tools"
import { getCurrentUser } from "@/lib/auth/session"
import type { Viewer } from "@/components/layout/viewer"
import { SmoothScroll } from "@/components/layout/smooth-scroll"
import "./globals.css"

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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

  const navigation = PRIMARY_NAVIGATION.map((item) => ({
    ...item,
    initial: item.label.slice(0, 2),
  }))

  const sections = CATEGORIES.map((category) => ({
    label: category.name,
    href: `/categories/${category.slug}`,
    count: countBySlug.get(category.slug) ?? 0,
    initial: category.name.slice(0, 2),
  }))

  return (
    <html lang="en" suppressHydrationWarning className={`${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <SmoothScroll />
        <div className="mx-auto flex w-full max-w-6xl">
          <SidebarRail
            identity={IDENTITY}
            navigation={navigation}
            sections={sections}
            viewer={viewer}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <Toolbar
              total={total}
              identity={IDENTITY}
              navigation={navigation}
              sections={sections}
              viewer={viewer}
            />
            <main className="min-w-0 flex-1 px-5 py-8 sm:px-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
