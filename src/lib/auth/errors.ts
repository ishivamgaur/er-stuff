/**
 * Auth errors are written for a reader, not a developer. They never reveal
 * whether an address has an account, because that turns the sign in form into
 * an account enumeration tool.
 */
export const AUTH_ERRORS = {
  invalidCredentials: "That email and password do not match an account.",
  emailTaken: "That email already has an account. Sign in instead.",
  weakPassword: "Use at least 12 characters. Longer beats complicated.",
  invalidEmail: "That does not look like an email address.",
  rateLimited: "Too many attempts. Wait a minute and try again.",
  generic: "That did not work. Try again.",
} as const
