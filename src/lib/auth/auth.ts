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

export const auth = betterAuth({
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
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
