export const SITE = {
  name: "erstuff",
  wordmark: "erstuff",
  domain: "erstuff",
  tagline:
    "Engineer's stuff: every tool worth putting in your stack, with the pricing and licensing actually verified.",
  description:
    "A verified index of the tools teams actually choose. Pricing, free tiers, licences, self-hosting and alternatives, checked against official sources by a person.",
} as const

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${SITE.domain}`
