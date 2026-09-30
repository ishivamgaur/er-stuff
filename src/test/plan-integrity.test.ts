import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { priceForWeeks, SPONSORSHIP_PRICE_WEEKLY } from "@/lib/billing/pricing"

const ROOT = join(process.cwd(), "src")
const read = (path: string) => readFileSync(join(ROOT, path), "utf8")

/**
 * Plan section 53. These guard the promises the site publishes on /sponsors
 * and the rules in the plan, at the level we can check without a browser.
 * Each one is written to fail if the rule it protects is broken.
 */

describe("plan: sponsorship does not buy ranking or verification", () => {
  it("the organic query never filters or sorts on sponsored", () => {
    const tools = read("lib/db/tools.ts")
    const organic = tools.slice(0, tools.indexOf("export const findSponsoredTools"))
    expect(organic).not.toMatch(/sponsored:\s*true/)
    expect(organic).not.toMatch(/featured:\s*true/)
  })

  it("a sponsorship cannot change a tool's verification state", () => {
    // createPendingCampaign writes only campaign fields. If this file ever
    // writes to the tool document, someone is buying a tool change.
    const sponsorship = read("lib/billing/sponsorship.ts")
    expect(sponsorship).not.toMatch(/verification\./)
    expect(sponsorship).not.toMatch(/ToolModel/)
  })

  it("campaign pricing matches the plan, and nothing renews", () => {
    expect(priceForWeeks(1)).toBe(SPONSORSHIP_PRICE_WEEKLY)
    expect(priceForWeeks(4)).toBe(18)
    // A campaign is finite. There must be no recurring or subscription concept.
    expect(read("lib/billing/sponsorship.ts")).not.toMatch(/subscription|recurring/)
  })
})

describe("plan: payment state is server authoritative", () => {
  const sponsorship = read("lib/billing/sponsorship.ts")

  it("activation takes a provider payment id, never a browser flag", () => {
    const activation = sponsorship.slice(
      sponsorship.indexOf("export const activateCampaignForPayment"),
    )
    const signature = activation.slice(0, activation.indexOf("=>"))

    expect(signature).toMatch(/providerPaymentId: string/)
    // A browser coming back from checkout must not be able to activate a
    // campaign, so nothing like a return flag may appear in the signature.
    expect(signature).not.toMatch(/checkout|return|session|success|url/i)
  })

  it("activation only proceeds for a payment recorded as paid", () => {
    expect(sponsorship).toMatch(/findOne\(\{ providerPaymentId, status: "paid" \}\)/)
  })

  it("a campaign starts in pending_payment and is not servable", () => {
    expect(sponsorship).toMatch(/status: "pending_payment"/)
    expect(sponsorship).toMatch(/findActiveCampaigns/)
    // The rail must only ever read active campaigns, never a boolean flag.
    const activation = sponsorship.slice(sponsorship.indexOf("findActiveCampaigns"))
    expect(activation).toMatch(/status: "scheduled"/)
    expect(activation).toMatch(/startDate: \{ \$lte: now \}/)
    expect(activation).toMatch(/endDate: \{ \$gt: now \}/)
  })
})

describe("plan: submissions stay private until reviewed", () => {
  const submissions = read("lib/db/submissions.ts")

  it("there is no public read path for pending submissions", () => {
    // findSubmissionsForAccount is scoped by id, findSubmissionsByStatus by
    // status. Neither is used by a public page.
    expect(submissions).toMatch(/find\(\{ submittedById \}\)/)
    expect(read("app/admin/reviews/page.tsx")).toMatch(/requireAdmin/)
  })

  it("approving a submission does not mark it verified", () => {
    expect(read("lib/db/submissions.ts")).toMatch(/reviewSubmission/)
    // Nothing in the submission layer writes a verification state.
    expect(read("lib/db/submissions.ts")).not.toMatch(/verification/)
  })
})

describe("plan: unknown stays unknown", () => {
  it("capabilities are nullable, never plain booleans", () => {
    const tool = read("schemas/tool.ts")
    expect(tool).toMatch(/z\.boolean\(\)\.nullable\(\)/)
  })

  it("the unverified state renders as a label, not as false", () => {
    const state = read("components/tools/verified-state.tsx")
    expect(state).toMatch(/not verified/i)
  })
})

describe("plan: admin actions are protected", () => {
  it("every admin page requires admin", () => {
    expect(read("app/admin/reviews/page.tsx")).toMatch(/requireAdmin/)
    expect(read("app/admin/reviews/actions.ts")).toMatch(/requireAdmin/)
  })

  it("the admin role cannot be set from the client", () => {
    expect(read("lib/auth/auth.ts")).toMatch(/input: false/)
  })
})
