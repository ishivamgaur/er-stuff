/**
 * Auth is Google only, so these are the failures a reader can actually hit.
 * They are written for a person, not a developer, and they never reveal whether
 * an address has an account.
 */
export const AUTH_ERRORS = {
  providerUnavailable: "Google sign in is not available on this deployment. Try again later.",
  cancelled: "Sign in was cancelled. Nothing was saved.",
  generic: "Sign in did not complete. Try again.",
} as const
