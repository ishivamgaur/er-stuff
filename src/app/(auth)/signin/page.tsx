import type { Metadata } from "next"
import { AuthPanel } from "@/components/auth/auth-panel"
import { isGoogleEnabled } from "@/lib/auth/auth"

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
  alternates: { canonical: "/signin" },
}

export default function SigninPage() {
  return <AuthPanel googleEnabled={isGoogleEnabled} />
}
