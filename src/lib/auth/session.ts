import "server-only"
import { cache } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth, type AuthUser } from "@/lib/auth/auth"

/**
 * Cached per request so a page can call it in a layout and in the page without
 * a second round trip. `no-store` per D18, admin and auth reads must never be
 * cached across requests.
 */
export const getSession = cache(async () => {
  const requestHeaders = await headers()
  return auth.api.getSession({ headers: requestHeaders })
})

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const session = await getSession()
  return session?.user ?? null
}

export const requireUser = async (): Promise<AuthUser> => {
  const user = await getCurrentUser()
  if (!user) redirect("/signin")
  return user
}

export const isAdmin = (user: AuthUser | null): boolean => user?.role === "admin"

export const requireAdmin = async (): Promise<AuthUser> => {
  const user = await requireUser()
  if (!isAdmin(user)) redirect("/")
  return user
}
