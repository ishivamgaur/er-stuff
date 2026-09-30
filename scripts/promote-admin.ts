import { connectToDatabase } from "@/lib/db/connect"

/**
 * There is deliberately no self service admin signup. The role field is
 * `input: false` on the auth side, so the only way in is this script.
 *
 *   npm run db:promote -- someone@example.com
 */

const email = process.argv[2]

if (!email) {
  console.error("Usage: npm run db:promote -- someone@example.com")
  process.exit(1)
}

await connectToDatabase()

const { default: mongoose } = await import("mongoose")
const db = mongoose.connection.db

if (!db) {
  console.error("No database handle")
  process.exit(1)
}

const result = await db
  .collection("user")
  .updateOne({ email: email.toLowerCase() }, { $set: { role: "admin" } })

if (result.matchedCount === 0) {
  console.error(`No account found for ${email}. Sign up first.`)
  process.exit(1)
}

console.log(`${email} is now an admin.`)
process.exit(0)
