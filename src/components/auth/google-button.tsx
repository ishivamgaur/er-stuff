"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth/client"
import { AUTH_ERRORS } from "@/lib/auth/errors"

const GoogleMark = () => (
  <svg aria-hidden viewBox="0 0 18 18" className="size-4 shrink-0">
    <path
      fill="#4285F4"
      d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z"
    />
    <path
      fill="#34A853"
      d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
    />
    <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
    <path
      fill="#EA4335"
      d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
    />
  </svg>
)

/**
 * Rendered only when Google credentials exist, so nobody is offered a sign in
 * that cannot complete. See the server page that decides.
 */
export const GoogleButton = () => {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <>
      <button
        type="button"
        disabled={isPending}
        onClick={async () => {
          setError(null)
          setIsPending(true)
          const { error: signInError } = await authClient.signIn.social({
            provider: "google",
            callbackURL: "/submit",
          })
          if (signInError) {
            setError(AUTH_ERRORS.generic)
            setIsPending(false)
          }
        }}
        className="group flex w-full items-center justify-center gap-2.5 border border-line bg-field px-4 py-2.5 text-body text-ink transition-[background-color,border-color,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:border-line-strong hover:bg-field/60 active:scale-[0.98] disabled:opacity-60"
      >
        <GoogleMark />
        <span className="transition-opacity duration-150 group-hover:opacity-80">
          {isPending ? "Opening Google" : "Continue with Google"}
        </span>
      </button>

      {error ? (
        <p role="alert" className="border-l-2 border-destructive bg-field px-3 py-2 text-small">
          {error}
        </p>
      ) : null}
    </>
  )
}
