import type { Metadata } from "next"
import { AuthPanel } from "@/components/auth/credentials-form"
import { isGoogleEnabled } from "@/lib/auth/auth"

export const metadata: Metadata = {
  title: "Sign in",
  alternates: { canonical: "/signin" },
}

export default function SignInPage() {
  return <AuthPanel mode="signin" googleEnabled={isGoogleEnabled} />
}
