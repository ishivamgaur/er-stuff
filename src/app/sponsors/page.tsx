import type { Metadata } from "next"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckIcon } from "@/components/icons"
import { SITE } from "@/config/site"
import { SPONSORSHIP_TIERS } from "@/lib/billing/pricing"

export const metadata: Metadata = {
  title: "Sponsors and disclosure",
  description:
    "How erstuff makes money, what a sponsorship does and does not buy, and how to sponsor a placement.",
  alternates: { canonical: "/sponsors" },
}

const NOT_FOR_SALE = [
  {
    title: "Rankings are not for sale",
    body: "No payment moves a tool up a list. The organic order is decided by usage and then by name, and that sort never reads the sponsored flag.",
  },
  {
    title: "Inclusion is not conditional on paying",
    body: "A tool with no affiliate programme and no budget sits beside one that has both, in the same category, in the same order.",
  },
  {
    title: "Alternatives are not filtered",
    body: "We list a competitor that pays us nothing next to one that does, including when the free option is the better one.",
  },
  {
    title: "Verification is not for sale",
    body: "Nobody pays to become verified. Pricing, licensing and capability fields are checked by a person, and an unknown field is shown as not verified rather than guessed.",
  },
  {
    title: "A free trial is never called free",
    body: "Not for money, and not without it. On the Free page, a trial is never counted as free forever.",
  },
] as const

const WAYS_TO_SUPPORT = [
  {
    title: "Affiliate link",
    body: "Some outbound links carry a referral parameter. If you buy something through one, the vendor may pay us. It never changes what you pay, and it never changes a tool's position in any list.",
  },
  {
    title: "Sponsored placement",
    body: "A single labelled slot at the top of the Explore page, shown above the organic list and separated from it. It carries a Sponsored label for the whole term, it does not move the tool in the organic list, and it does not affect its verification state.",
  },
  {
    title: "Claim your listing",
    body: "Free. If you maintain a tool that is listed here, claim it by proving domain control and correct your own details. Claiming confirms the listing is yours, it does not confirm the listing is accurate.",
  },
] as const

/**
 * The launch domain has no TLD yet, so a mailto would be a dead link. Render a
 * real link only when the domain can actually receive mail, and show the
 * address as plain text until then. Do not invent a domain to make it clickable.
 */
const ContactAddress = ({ address }: { address: string }) => {
  const [, host = ""] = address.split("@")
  const isDeliverable = /\.[a-z]{2,}$/i.test(host)

  if (!isDeliverable) {
    return <span className="text-ink-2">{address}</span>
  }

  return (
    <a href={`mailto:${address}`} className="text-brand hover:underline">
      {address}
    </a>
  )
}

export default function SponsorsPage() {
  return (
    <div className="max-w-[62ch]">
      <PageHeader
        eyebrow="Disclosure"
        title="Sponsors"
        description="erstuff is free to browse and needs no account. This page says exactly how it pays for itself."
      />

      <section className="rule py-6">
        <h2 className="label text-ink-4">How Money Is Made</h2>
        <div className="mt-3 grid gap-3">
          {WAYS_TO_SUPPORT.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="text-body">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-body leading-relaxed">{item.body}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="rule py-6">
        <h2 className="label text-ink-4">What Money Does Not Buy</h2>
        <p className="mt-2.5 text-body leading-relaxed text-ink-2">
          This is the part that matters. If any of the following is not true, the site is not worth
          reading and you should tell us.
        </p>
        <ul className="mt-3 space-y-2.5">
          {NOT_FOR_SALE.map((item) => (
            <li key={item.title} className="flex gap-2.5">
              <span aria-hidden className="mt-0.5 grid size-5 shrink-0 place-items-center">
                <CheckIcon className="text-brand" />
              </span>
              <div>
                <span className="text-body font-semibold text-ink">{item.title}. </span>
                <span className="text-body leading-relaxed text-ink-2">{item.body}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rule py-6">
        <h2 className="label text-ink-4">How the Data Is Made</h2>
        <p className="mt-2.5 text-body leading-relaxed text-pretty text-ink-2">
          Listings are assembled with automated tooling and then reviewed by a person. That is
          faster than typing every field by hand and it is also imperfect. Every tool carries a
          verification state and a last checked date, and an unknown field is shown as not verified
          rather than filled in with a guess. If you find something wrong, tell us and it gets
          corrected, whether or not you are a paying sponsor.
        </p>
      </section>

      <section className="rule py-6">
        <h2 className="label text-ink-4">Sponsorship</h2>
        <p className="mt-2.5 text-body leading-relaxed text-pretty text-ink-2">
          One placement exists, the sponsored slot on the Explore page. It is sold as a fixed term
          rather than a ranking, and it is labelled for the whole term. There is no unlabelled
          option, no automatic renewal, and no tier that buys better placement in a list.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {SPONSORSHIP_TIERS.map((tier) => (
            <Card key={tier.id} className="border-brand/25 bg-brand-tint/40">
              <CardHeader>
                <div className="flex items-baseline justify-between gap-3">
                  <CardTitle className="text-body">{tier.label}</CardTitle>
                  <span className="numeric text-lead font-semibold text-brand">${tier.price}</span>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {tier.weeks} week{tier.weeks > 1 ? "s" : ""}, one labelled slot, impressions and
                  clicks reported.
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-body leading-relaxed text-pretty text-ink-2">
          To enquire, write to <ContactAddress address={`sponsors@${SITE.domain}`} />. If a
          placement is ever shown without a Sponsored label, email the same address and it will be
          taken down.
        </p>
      </section>

      <div className="mt-6">
        <Badge variant="outline" className="rounded-chip font-mono font-normal">
          no account needed to read anything
        </Badge>
      </div>
    </div>
  )
}
