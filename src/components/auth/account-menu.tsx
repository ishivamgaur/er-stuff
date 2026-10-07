"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserIcon } from "@/components/icons"
import type { Viewer } from "@/components/layout/viewer"

/*
 * The account control. Signed out it is an inverted call to action; signed in
 * it is a quiet menu, because the reader is here to browse and the account is
 * secondary until they need it.
 */
export const AccountMenu = ({ viewer }: { viewer: Viewer }) => {
  const router = useRouter()

  const signOut = async () => {
    await authClient.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label="Account" title={viewer.email} />}
      >
        <UserIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate font-mono text-micro font-normal text-muted-foreground">
          {viewer.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/account" />}>Your Account</DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/submit" />}>List a Product</DropdownMenuItem>
        {viewer.role === "admin" ? (
          <DropdownMenuItem render={<Link href="/admin/reviews" />}>Review Queue</DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>Sign Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
