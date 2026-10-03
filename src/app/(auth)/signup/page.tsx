import type { Metadata } from "next"
import { AuthPanel } from "@/components/auth/auth-panel"
import { isGoogleEnabled } from "@/lib/auth/auth"

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false, follow: false },
  alternates: { canonical: "/signup" },
}

export default function SignupPage() {
  return <AuthPanel googleEnabled={isGoogleEnabled} />
}
