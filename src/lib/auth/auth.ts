import "server-only"
import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { connectToDatabase } from "@/lib/db/connect"

/**
 * D1. Better Auth owns sessions, cookies and password hashing. We own the
 * `users` collection shape and add a `role` field on top. Do not hand roll
 * session handling here, see AGENTS.md.
 */
const connection = await connectToDatabase()
const db = connection.db

if (!db) {
  throw new Error("MongoDB Db handle unavailable, cannot initialise auth")
}

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

/**
 * Google sign in is wired but stays dormant until credentials exist, so a
 * fresh clone and CI both work without a Google Cloud project. The button is
 * hidden at the same time, see `isGoogleEnabled`.
 */
export const isGoogleEnabled = Boolean(googleClientId && googleClientSecret)

/**
 * Auth is Google only, so when the credentials are missing there is no way in
 * at all. The shell says so rather than showing a form that cannot work.
 */
export const isAuthAvailable = isGoogleEnabled

export const auth = betterAuth({
  database: mongodbAdapter(db),
  /**
   * Google only. Password accounts are off on purpose: a 12 character password
   * nobody can reset, with no verification email, is worse than not offering
   * passwords at all. See D30.
   */
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: isGoogleEnabled
    ? {
        google: {
          clientId: googleClientId as string,
          clientSecret: googleClientSecret as string,
          prompt: "select_account",
        },
      }
    : {},
  account: {
    /**
     * Someone who signed up with a password and then signs in with the same
     * Google address should land on their existing account, not get a second
     * one, and not be told their address is taken.
     */
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      allowDifferentEmails: false,
    },
  },
  user: {
    additionalFields: {
      // `input: false` keeps the client from assigning itself an admin role.
      role: {
        type: "string",
        required: false,
        defaultValue: "member",
        input: false,
      },
      displayName: {
        type: "string",
        required: false,
      },
    },
  },
  session: {
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  advanced: {
    cookiePrefix: "erstuff",
  },
})

export type AuthSession = typeof auth.$Infer.Session
export type AuthUser = AuthSession["user"]
