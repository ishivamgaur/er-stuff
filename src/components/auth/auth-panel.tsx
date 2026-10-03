"use client"

import { authClient } from "@/lib/auth/client"
import { GoogleButton } from "@/components/auth/google-button"

type AuthPanelProps = {
  googleEnabled: boolean
}

/**
 * One panel for both sign in and sign up. Google decides which one it is, so
 * asking for an email and a password first would be work the user throws away.
 */
export const AuthPanel = ({ googleEnabled }: AuthPanelProps) => (
  <div className="mx-auto max-w-sm">
    <h1 className="text-title font-bold tracking-tight text-ink">Sign in</h1>
    <p className="mt-2 text-body leading-relaxed text-pretty text-ink-2">
      Reading the directory needs no account. An account is only for listing your own product.
    </p>

    <div className="mt-6 space-y-3">{googleEnabled ? <GoogleButton /> : <AuthUnavailable />}</div>

    <p className="mt-6 border-t border-line pt-4 text-small leading-relaxed text-ink-3">
      We never see your Google password, and we only keep your email address and the listings you
      send for review.
    </p>
  </div>
)

const AuthUnavailable = () => {
  return (
    <div className="border border-line bg-field px-4 py-4">
      <p className="text-body font-bold text-ink">Sign in is not switched on yet</p>
      <p className="mt-1.5 text-small leading-relaxed text-pretty text-ink-2">
        This deployment has no Google OAuth client configured, so there is no way to create an
        account. Browsing works without one.
      </p>
      <p className="mt-2 text-small leading-relaxed text-ink-3">
        Set <span className="text-ink-2">GOOGLE_CLIENT_ID</span> and{" "}
        <span className="text-ink-2">GOOGLE_CLIENT_SECRET</span> to enable it.
      </p>
      <button
        type="button"
        onClick={() => authClient.signOut()}
        className="mt-3 text-small text-ink-4 underline decoration-transparent decoration-from-font underline-offset-[0.3em] transition-colors hover:text-ink-2"
      >
        Clear any stale session
      </button>
    </div>
  )
}
