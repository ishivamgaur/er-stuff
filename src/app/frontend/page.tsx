import type { Metadata } from "next"
import { NavPage } from "@/components/nav/nav-page"
import { navItem } from "@/config/nav"

const nav = navItem("frontend")

export const metadata: Metadata = {
  title: nav.label,
  description: nav.description,
  alternates: { canonical: nav.href },
}

export default async function FrontendPage() {
  return <NavPage nav={nav} />
}
