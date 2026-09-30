# Monetisation

How erstuff makes money, and what the money is not allowed to do.

Reference model: findalternative.net, whose disclosure page is the most
honest public statement of this business I have found. Their model is two
revenue lines and a published list of what money cannot buy.

## The model

### 1. Affiliate commissions

Some outbound tool links are affiliate links. If a reader clicks through and
subscribes, the vendor may pay a commission.

For erstuff this is the most natural line, because the data model already
supports it. `Tool.websiteUrl` is the destination, and the `tool.outbound`
event already records `destination: "website" | "github" | "docs"`. Affiliate
tracking is a parameter on the URL plus attribution on that event. No new
architecture is required.

Realistic expectation: affiliate revenue needs traffic first, and paying
little. Treat it as a bonus, not a plan.

### 2. Sponsored placements, always labelled

A vendor can pay to be featured. The `Tool.sponsored` flag already exists.

The rule that matters is not that we label it, it is that the label is
structural. Decision D10 already enforces the hard part: the organic sort
query does not reference `featured` or `sponsored`, and a unit test asserts it.
Paid results come from a separate query into a separate visual rail, so
sponsorship cannot leak into ranking even by accident.

### 3. Claimed listings, free

A vendor claims their own listing by proving domain control, then corrects
their own details. This is free, and it is worth doing anyway:

- Corrections come from the people with the most accurate information.
- The claim link is worth something to the vendor, so it is worth doing.
- Claimed listings create a durable relationship with the vendor, which is
  how the first sponsorship tends to arrive.

Note their honesty about this: a claimed listing is verified as *theirs*, not
verified as *accurate*. We should say the same thing.

## Dodo Payments

Dodo Payments is a merchant of service, in the same family as Lemon Squeezy
and Paddle. The practical reasons it fits:

- It is built for indie developers and sellers, not enterprise procurement.
- It acts as merchant of record, so sales tax and VAT are handled rather than
  owed.
- It removes the need for a payment system until there is money to take.

What it does not do for us: it does not decide what we sell. Sponsored
placement is still the product, and the labelling rules are still ours.

Decision: do not integrate Dodo Payments yet. There is nothing to sell until
there is an audience. Integrating a payment provider before the first sponsor
is building for a problem that does not exist. Revisit when the first real
inbound sponsorship arrives.

## What money must not buy

This is the part worth copying from findalternative verbatim, in substance.
Publishing it is what makes the rest of the page credible.

- **Rankings are not for sale.** No payment moves a tool up a list.
- **Inclusion is not conditional on paying.** A tool with no affiliate
  programme sits beside one with a generous one.
- **Alternatives are not filtered.** We will list a competitor that pays us
  nothing next to one that does, including when the free option is better.
- **Verification is not for sale.** Nobody pays to become verified. That would
  destroy the only asset this product has.
- **A free trial is never described as free forever.** Not for money, not
  without it.

## The disclosure page

findalternative publishes a dedicated disclosure page and an email address to
report unlabelled paid placements. That is a trust mechanism, not a legal
formality. It should be built before the first sponsor, not after.

Required content:

- That the site is free to use.
- That some links are affiliate links, and that it never changes the price.
- That paid placements are labelled, and that unlabelled means unpaid.
- The list above, stating what money does not buy.
- How listings are produced, including that seeding is AI assisted and
  human supervised, and therefore imperfect.
- A contact address for reporting a problem.

## What is deliberately not planned

Section 54 of the original plan rules these out, and nothing here changes it:

- Selling the ranking position
- Selling verification
- Reviews, which carry a moderation cost and would invite the pay to remove
  problem
- A job board
- Selling user data

## Order of operations

1. Build the disclosure page now, before any money exists. It costs an hour
   and it is the thing that makes a later sponsorship defensible.
2. Add the affiliate link field and outbound event attribution, which the
   schema already supports.
3. Open claimed listings once there is a correction flow to support them.
4. Take the first sponsorship when someone asks, through Dodo Payments, with
   the placement labelled and the ranking untouched.
