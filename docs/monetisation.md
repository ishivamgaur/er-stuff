# Monetisation

How erstuff makes money, what money must not buy, and what the competitor
actually charges.

## What findalternate.com charges

Checked against its live `/pricing` page. It runs a Next.js app, reports
roughly 5k monthly visitors, and cites its own DR of 27 as a selling point.
It takes payment through Dodo Payments.

| Offer | Price | What you get |
|---|---|---|
| Free Launch | $0 forever | Weekly homepage leaderboard, 25 free slots per week, public product page, launch analytics |
| Premium Launch | $9 per product | Verified badge, priority feed, two dofollow backlinks, gold badge, newsletter and X shoutout, highlighted card ring, a written SEO blog post, "Alternative To" placement on competitor pages |
| Sidebar placement | $15 per week | Pinned in the global sidebar across every product and category page |
| Dashboard placement | $20 per week | Featured in the main homepage feed |

Placements run on a weekly cycle, you pick a week and a slot, and multiple
products can be sponsored at once. Sales are taken over X DM.

The model in one line: the directory is free, so the directory itself is not
the product. **Attention is the product**, sold back to the vendors whose
products are listed in it, on a recurring weekly cycle.

## The three lessons worth taking

**1. Recurring weekly beats one-off.** A $9 one-off launch is a rounding
error. $15 to $20 a week is a subscription small enough to buy without a
procurement conversation, and it compounds. We should sell time-boxed weeks,
not a permanent tier. A week also has a natural end, which removes the
awkward question of when a placement stops.

**2. Vendor analytics is a real product, and it is free of the trust problem.**
A dashboard showing views and outbound clicks on your own listing is exactly
what a vendor wants, and it costs us nothing we promised not to do. It is
also the cheapest possible retention: a vendor watching traffic does not
cancel. This is the line we can build with a clear conscience.

**3. Comparison pages are the SEO engine, not a feature.** "Alternative to X"
pages rank for the highest-intent queries there are, and they are genuinely
useful to a reader. This is how a directory earns its traffic, and unlike
sponsorship it pays back to the reader rather than to the vendor.

## The two things we will not copy

**Selling a verified badge.** findalternate sells a verified badge for $9. We
publish, on `/sponsors`, that verification is never for sale. Adopting their
pricing would make that page a lie, and the badge is the only asset we have
that a link farm does not. Verification is earned by a person, or it is not
there.

**Selling rank priority.** Their Premium Launch includes "top priority
placement above free listings". That is selling ranking, which is the exact
thing we say we do not do. We sell a labelled slot in a separate rail. A
tool may appear in both the rail and the organic list, but it earns the
organic position on its own merits.

We should also note their own copy contradicts itself: the Free Launch tier
says the product page link is `nofollow`, while the FAQ says every listing
gets a dofollow backlink. Either way, it is worth copying the lesson that a
backlink has value, and being precise about which kind we give.

## Our pricing

Set by `erstuff-full-plan.md` section 27:

| Offer | Price |
|---|---|
| Explore sponsored slot, one week | $5 |
| Explore sponsored slot, four weeks | $18 |

A campaign is a finite campaign, not a subscription. There is no automatic
renewal and no permanent placement, because a permanent slot is a ranking
position in disguise. Pricing lives in `src/lib/billing/pricing.ts` so the
page, the campaign creator and the tests all read the same number.

The competitor charges $15 and $20 a week. We start lower on purpose: $5 is
an impulse purchase taken on a card without a procurement conversation, which
is the right price while there is no traffic to charge much for. Raise it when
there is demand, not before.

## What erstuff sells

Compatible with `/sponsors` and with D10.

**Free, forever.** Any account holder submits a product. It goes to a review
queue, gets a public page once approved, and appears in the directory. The
submission cap keeps the queue reviewable. This is not a loss leader, it is
the content.

**Vendor analytics, free.** Views and outbound clicks on your own listing. No
charge, because it costs us nothing to give and it makes a sponsorship the
obvious upgrade rather than the only option.

**Sponsored placement, per week.** One labelled slot above the organic list
on `/explore`. $5 for a week or $18 for four. Permanently labelled for the
term, never affects ranking or verification, never renews itself. Checkout is
not built, because there is no confirmed buyer.

**Affiliate links.** On outbound clicks only. Never changes a price, never
changes a position. Needs the `tool.outbound` event, which is already in the
schema.

**Deliberately not sold:** ranking, verification, inclusion, reviews, user
data, and a permanent placement. A permanent slot is a rank in disguise.

## Order of operations

1. Comparison pages. Highest value, no trust cost, and they are the traffic
   that makes everything else worth buying. This is the first thing to build.
2. Vendor analytics on the submission we already accept. Cheap, and it makes
   the submission flow worth something on its own.
3. The disclosure page is already live at `/sponsors`. It must stay true as
   each of these ships.
4. Sponsorship, once there is traffic worth charging for. Do not build
   checkout before then.

## On payment

findalternate uses Dodo Payments, which is a reasonable fit and the same
provider we would pick: merchant of record, tax handled, built for
independent sellers. Do not integrate it until there is a confirmed buyer.
There is no value in a payment provider before the first sale, and integrating
one early is a distraction from traffic.
