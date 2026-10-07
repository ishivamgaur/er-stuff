import type { Metadata } from "next"
import { NavPage } from "@/components/nav/nav-page"
import { navItem } from "@/config/nav"

const nav = navItem("components")

export const metadata: Metadata = {
  title: nav.label,
  description: nav.description,
  alternates: { canonical: nav.href },
}

export default async function ComponentsPage() {
  return <NavPage nav={nav} />
}
