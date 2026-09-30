import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ADMIN_COOKIE_NAME, isAdminSessionValid } from "./admin-session"

export const getAdminSession = async (): Promise<boolean> => {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value
  return isAdminSessionValid(token)
}

export const requireAdmin = async (): Promise<void> => {
  const isValid = await getAdminSession()
  if (!isValid) {
    redirect("/admin/login")
  }
}

export const requireAdminApi = async (): Promise<boolean> => {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value
  return isAdminSessionValid(token)
}
