"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { authClient } from "@/lib/auth/client"

/**
 * Sign out goes through the client SDK. Calling auth.api.signOut in a server
 * action drops the cookie clearing header, so the redirect happens and the
 * session survives the refresh.
 */
export const SignOutButton = () => {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={async () => {
        setIsPending(true)
        await authClient.signOut()
        router.push("/")
        router.refresh()
      }}
      className="text-body text-ink-3 underline decoration-transparent decoration-from-font underline-offset-[0.3em] transition-colors hover:text-ink-2 hover:decoration-current disabled:opacity-50"
    >
      {isPending ? "Signing out" : "[-] Sign out"}
    </button>
  )
}
