"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth/client"
import { SignOutIcon } from "@/components/icons"
import { cn } from "@/lib/utils/cn"

export const SignOutButton = ({ collapsed = false }: { collapsed?: boolean }) => {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  return (
    <button
      type="button"
      title={collapsed ? "Sign out" : undefined}
      aria-label={collapsed ? "Sign out" : undefined}
      disabled={isPending}
      onClick={async () => {
        setIsPending(true)
        await authClient.signOut()
        router.push("/")
        router.refresh()
      }}
      className={cn(
        "flex min-h-9 w-full items-center gap-2.5 rounded-chip px-1.5 text-small text-ink-3 transition-colors duration-150 hover:bg-field hover:text-ink disabled:opacity-50",
        collapsed && "justify-center px-0",
      )}
    >
      <SignOutIcon />
      {!collapsed ? "Sign out" : null}
    </button>
  )
}
