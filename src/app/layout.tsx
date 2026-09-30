import type { Metadata } from "next"
import { Funnel_Display, Funnel_Sans, Geist_Mono, Geist_Pixel } from "next/font/google"
import { SidebarRail } from "@/components/layout/sidebar-rail"
import { Toolbar } from "@/components/layout/toolbar"
import { CATEGORIES } from "@/config/categories"
import { PRIMARY_NAVIGATION } from "@/config/navigation"
import { SITE, SITE_URL } from "@/config/site"
import { findCategoryToolCounts } from "@/lib/db/categories"
import { findTotalToolCount } from "@/lib/db/tools"
import { getCurrentUser } from "@/lib/auth/session"
import type { Viewer } from "@/components/layout/viewer"
import "./globals.css"

const funnelDisplay = Funnel_Display({
  variable: "--font-funnel-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const funnelSans = Funnel_Sans({
  variable: "--font-funnel-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const geistPixel = Geist_Pixel({
  variable: "--font-geist-pixel",
  subsets: ["latin"],
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

  const navigation = PRIMARY_NAVIGATION.map((item) => ({ ...item }))

  const sections = CATEGORIES.map((category) => ({
    label: category.name,
    href: `/categories/${category.slug}`,
    count: countBySlug.get(category.slug) ?? 0,
  }))

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${funnelDisplay.variable} ${funnelSans.variable} ${geistMono.variable} ${geistPixel.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <div className="mx-auto flex w-full max-w-5xl flex-col lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
          <SidebarRail
            identity={IDENTITY}
            navigation={navigation}
            sections={sections}
            viewer={viewer}
          />
          <div className="min-w-0">
            <Toolbar
              total={total}
              identity={IDENTITY}
              navigation={navigation}
              sections={sections}
            />
            <main className="px-5 py-7 sm:px-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
