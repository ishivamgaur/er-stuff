"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth/client"
import { GoogleButton } from "@/components/auth/google-button"
import { AUTH_ERRORS } from "@/lib/auth/errors"
import { cn } from "@/lib/utils/cn"

/**
 * Cookies are set by Better Auth's route handler, not by a server action, so
 * the credential calls go through the client SDK. Calling auth.api directly in
 * a server action drops the Set-Cookie and the user lands back on a signed out
 * page with no error to explain why.
 */

type Mode = "signin" | "signup"

const COPY = {
  signin: {
    submit: "Sign in",
    pending: "Signing in",
    title: "signin",
    intro: "Browsing needs no account. Sign in to list your product.",
    toggleLead: "No account?",
    toggleLabel: "Create one",
    toggleHref: "/signup",
  },
  signup: {
    submit: "Create account",
    pending: "Creating",
    title: "signup",
    intro: "Accounts are for listing your own product. Reading the directory never needs one.",
    toggleLead: "Already have one?",
    toggleLabel: "Sign in",
    toggleHref: "/signin",
  },
} as const

type AuthError = { message?: string | undefined; status?: number | null | undefined }

const describe = (error: AuthError | undefined): string => {
  const message = error?.message?.toLowerCase() ?? ""
  if (message.includes("invalid") || message.includes("credential"))
    return AUTH_ERRORS.invalidCredentials
  if (message.includes("exist") || message.includes("taken")) return AUTH_ERRORS.emailTaken
  if (message.includes("password")) return AUTH_ERRORS.weakPassword
  if (error?.status === 429) return AUTH_ERRORS.rateLimited
  return AUTH_ERRORS.generic
}

const Field = ({
  label,
  name,
  type = "text",
  autoComplete,
  hint,
  required = false,
}: {
  label: string
  name: string
  type?: string
  autoComplete?: string
  hint?: string
  required?: boolean
}) => (
  <label className="block">
    <span className="mb-1.5 block text-small text-ink-2">
      <span aria-hidden className="text-ink-4">
        #
      </span>{" "}
      {label}
    </span>
    <input
      name={name}
      type={type}
      required={required}
      autoComplete={autoComplete}
      className="w-full border border-line bg-field px-3 py-2 text-body text-ink outline-none transition-colors focus:border-accent"
    />
    {hint ? <span className="mt-1 block text-micro text-ink-3">{hint}</span> : null}
  </label>
)

export const CredentialsForm = ({
  mode,
  googleEnabled,
}: {
  mode: Mode
  googleEnabled: boolean
}) => {
  const copy = COPY[mode]
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsPending(true)

    const form = new FormData(event.currentTarget)
    const email = String(form.get("email") ?? "").trim()
    const password = String(form.get("password") ?? "")

    const result =
      mode === "signin"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({
            email,
            password,
            name: String(form.get("name") ?? "").trim() || (email.split("@")[0] ?? email),
          })

    if (result.error) {
      setError(describe(result.error))
      setIsPending(false)
      return
    }

    router.push(mode === "signin" ? "/account" : "/submit")
    router.refresh()
  }

  return (
    <div className="mt-5">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email" name="email" type="email" autoComplete="email" required />

        <Field
          label="Password"
          name="password"
          type="password"
          required
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          {...(mode === "signup" ? { hint: "At least 12 characters." } : {})}
        />

        {mode === "signup" ? (
          <Field
            label="Name"
            name="name"
            autoComplete="name"
            hint="Optional. Shown on submissions you send for review."
          />
        ) : null}

        {error ? (
          <p
            role="alert"
            className="border-l-2 border-destructive bg-field px-3 py-2 text-small text-ink"
          >
            <span aria-hidden className="mr-1.5 text-destructive">
              !
            </span>
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "w-full bg-accent px-4 py-2.5 text-body font-bold text-accent-ink transition-opacity",
            isPending ? "opacity-60" : "hover:opacity-90",
          )}
        >
          {isPending ? copy.pending : copy.submit}
        </button>
        {googleEnabled ? <GoogleButton mode={mode} /> : null}
      </form>

      <p className="mt-5 text-small text-ink-3">
        {copy.toggleLead}{" "}
        <a
          href={copy.toggleHref}
          className="text-accent underline decoration-transparent decoration-from-font underline-offset-[0.3em] hover:decoration-current"
        >
          {copy.toggleLabel}
        </a>
      </p>
    </div>
  )
}

export const AuthPanel = ({ mode, googleEnabled }: { mode: Mode; googleEnabled: boolean }) => {
  const copy = COPY[mode]
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-title font-bold tracking-tight text-ink">
        <span aria-hidden className="text-ink-4">
          #
        </span>{" "}
        {copy.title}
      </h1>
      <p className="mt-2 text-body leading-relaxed text-ink-2">{copy.intro}</p>
      <CredentialsForm mode={mode} googleEnabled={googleEnabled} />
    </div>
  )
}
