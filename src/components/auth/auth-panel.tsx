"use client"

import { authClient } from "@/lib/auth/client"
import { GoogleButton } from "@/components/auth/google-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertIcon } from "@/components/icons"

type AuthPanelProps = {
  googleEnabled: boolean
}

/**
 * One panel for both sign in and sign up. Google decides which one it is, so
 * asking for an email and a password first would be work the user throws away.
 */
export const AuthPanel = ({ googleEnabled }: AuthPanelProps) => (
  <div className="rise mx-auto max-w-sm">
    <p className="label mb-2 text-brand">Account</p>
    <h1 className="text-title font-semibold tracking-tight text-ink">Sign in</h1>
    <p className="mt-2 text-body leading-relaxed text-pretty text-ink-2">
      Reading the directory needs no account. An account is only for listing your own product.
    </p>

    <div className="mt-6">
      {googleEnabled ? (
        <GoogleButton />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-body">Sign In Is Not Switched on Yet</CardTitle>
            <CardDescription>
              This deployment has no Google OAuth client configured, so there is no way to create an
              account. Browsing works without one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-small leading-relaxed text-ink-3">
              Set <span className="font-mono text-micro text-ink-2">GOOGLE_CLIENT_ID</span> and{" "}
              <span className="font-mono text-micro text-ink-2">GOOGLE_CLIENT_SECRET</span> to
              enable it.
            </p>
            <Button type="button" variant="outline" size="sm" onClick={() => authClient.signOut()}>
              Clear Any Stale Session
            </Button>
          </CardContent>
        </Card>
      )}
    </div>

    <Alert className="mt-6">
      <AlertIcon />
      <AlertTitle>What We Keep</AlertTitle>
      <AlertDescription>
        We never see your Google password, and we only keep your email address and the listings you
        send for review.
      </AlertDescription>
    </Alert>
  </div>
)
