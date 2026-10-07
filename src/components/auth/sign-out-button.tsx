"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth/client"
import { SignOutIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export const SignOutButton = ({ collapsed = false }: { collapsed?: boolean }) => {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  return (
    <Button
      type="button"
      variant="ghost"
      title={collapsed ? "Sign Out" : undefined}
      aria-label={collapsed ? "Sign Out" : undefined}
      disabled={isPending}
      onClick={async () => {
        setIsPending(true)
        await authClient.signOut()
        router.push("/")
        router.refresh()
      }}
      className={cn(
        "h-6 w-full justify-start gap-1.5 px-2 text-small font-normal text-ink-3 hover:text-ink",
        collapsed && "justify-center px-0",
      )}
    >
      {isPending ? <Spinner data-icon="inline-start" /> : <SignOutIcon />}
      {!collapsed ? "Sign Out" : null}
    </Button>
  )
}
