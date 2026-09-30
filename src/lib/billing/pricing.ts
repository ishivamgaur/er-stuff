/**
 * Pricing is pure business logic with no database and no provider knowledge,
 * so it lives outside the server-only billing service and can be unit tested
 * directly. Plan section 27.
 */

export const SPONSORSHIP_PRICE_WEEKLY = 5
export const SPONSORSHIP_PRICE_FOUR_WEEKS = 18
export const SPONSORSHIP_CURRENCY = "USD"

export const SPONSORSHIP_TIERS = [
  {
    id: "week",
    label: "One week",
    price: SPONSORSHIP_PRICE_WEEKLY,
    weeks: 1,
  },
  {
    id: "four_weeks",
    label: "Four weeks",
    price: SPONSORSHIP_PRICE_FOUR_WEEKS,
    weeks: 4,
  },
] as const

export const priceForWeeks = (weeks: number): number =>
  weeks >= 4 ? SPONSORSHIP_PRICE_FOUR_WEEKS : SPONSORSHIP_PRICE_WEEKLY * weeks
