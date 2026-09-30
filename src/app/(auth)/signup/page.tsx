import type { Metadata } from "next"
import { AuthPanel } from "@/components/auth/credentials-form"

export const metadata: Metadata = {
  title: "Create an account",
  alternates: { canonical: "/signup" },
}

export default function SignUpPage() {
  return <AuthPanel mode="signup" />
}
