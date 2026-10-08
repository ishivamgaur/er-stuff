import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { cookies } from "next/headers"
import { Sidebar } from "@/components/layout/sidebar"
import { Toolbar } from "@/components/layout/toolbar"
import { SITE, SITE_URL } from "@/config/site"
import { findNavCounts } from "@/lib/db/nav"
import { findTotalToolCount } from "@/lib/db/tools"
import { getCurrentUser } from "@/lib/auth/session"
import type { Viewer } from "@/components/layout/viewer"
import { SmoothScroll } from "@/components/layout/smooth-scroll"
import { VIEW_COOKIE, resolveView } from "@/lib/view"
import "./globals.css"

/*
 * One face for everything. Metadata treatments (counts, eyebrows, labels)
 * keep their size and rhythm, but they render in Geist with tabular figures
 * rather than in a second family.
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  openGraph: {
    type: "website",
    siteName: SITE.name,
  },
}

const IDENTITY = {
  name: SITE.wordmark,
  tagline: SITE.tagline,
}

/*
 * Dark first. The class lands before first paint, so the dark page never
 * flashes light; `suppressHydrationWarning` covers the one render where the
 * server guessed dark and the stored preference says light.
 */
const THEME_SCRIPT = `(function(){try{var s=localStorage.getItem("theme");var d=s!=="light";document.documentElement.classList.toggle("dark",d);}catch(e){}})();`

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [total, counts, user] = await Promise.all([
    findTotalToolCount(),
    findNavCounts(),
    getCurrentUser(),
  ])

  const viewer: Viewer | null = user ? { id: user.id, email: user.email, role: user.role } : null

  // The stored list layout, so the toolbar toggle and every list paint the
  // stored view on the very first render. See `lib/view.ts`.
  const initialView = resolveView((await cookies()).get(VIEW_COOKIE)?.value)

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${geist.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <SmoothScroll />
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:rounded-control focus:bg-brand-solid focus:px-3 focus:py-2 focus:text-small focus:font-medium focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <div className="mx-auto flex min-h-dvh w-full max-w-5xl items-stretch">
          <Sidebar identity={IDENTITY} counts={counts} viewer={viewer} />
          <div className="flex min-w-0 flex-1 flex-col border-r border-line">
            <Toolbar
              total={total}
              identity={IDENTITY}
              counts={counts}
              viewer={viewer}
              initialView={initialView}
            />
            <main
              id="content"
              className="mx-auto w-full max-w-3xl min-w-0 flex-1 scroll-mt-16 px-4 pt-6 pb-10 sm:px-6"
            >
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
