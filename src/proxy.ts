import { NextResponse, type NextRequest } from "next/server"
import { ADMIN_COOKIE_NAME, isAdminSessionValid } from "@/lib/auth/admin-session"

const ADMIN_PREFIXES = ["/admin", "/api/admin"]

const isProtectedPath = (pathname: string): boolean =>
  ADMIN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))

export const proxy = (request: NextRequest): NextResponse => {
  const { pathname } = request.nextUrl

  if (pathname === "/admin/login") return NextResponse.next()
  if (!isProtectedPath(pathname)) return NextResponse.next()

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  if (isAdminSessionValid(token)) return NextResponse.next()

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } },
      { status: 403 },
    )
  }

  const loginUrl = new URL("/admin/login", request.url)
  loginUrl.searchParams.set("next", pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
