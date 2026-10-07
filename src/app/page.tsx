import type { Metadata } from "next"
import { NavPage } from "@/components/nav/nav-page"
import { DEFAULT_NAV } from "@/config/nav"

export const metadata: Metadata = {
  alternates: { canonical: "/" },
}

export default async function HomePage() {
  return <NavPage nav={DEFAULT_NAV} />
}
