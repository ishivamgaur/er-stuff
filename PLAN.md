# erstuff: plan

This is the one file to read and edit. It is the current plan, not the
original pitch. Everything here matches the code as it is today.

Deep reference lives elsewhere and does not need editing:

| File                         | What it holds                                                         |
| ---------------------------- | --------------------------------------------------------------------- |
| `AGENTS.md`                  | How the codebase works, the design system, and every trap already hit |
| `docs/decisions.md`          | D1 to D26, each with the reasoning                                    |
| `docs/monetisation.md`       | The competitor's real pricing and what we copy or refuse              |
| `docs/execution-plan.md`     | The original milestone breakdown                                      |
| `developer-hub-full-plan.md` | The original full specification                                       |

---

## 1. What this is

A directory of developer tools where the pricing, free tier, licence and
self-hosting claims are checked against official sources by a person.

Free to browse. No account to read. An account exists only to list your own
product or to see analytics on your listing.

The value is not the number of listings. 48 tools where every field is
honest beats 5,000 where half are guesses. A directory of mostly unknowns is
only worth reading if the reader can tell a known field from an unknown one,
which is why unknown is `null` and renders as "not verified" rather than as
"no".

## 2. Rules we do not break

These are the asset. Every one of them is published on `/sponsors`, so
breaking one makes that page a lie.

- **Never invent data.** Unknown is `null`, never `false`.
- **Verification is never for sale.** No tier, no discount, no exception.
- **Rankings are never for sale.** Sponsored results come from a separate
  query into a separate rail. A unit test fails if the organic sort ever
  reads `featured` or `sponsored`.
- **Inclusion is never conditional on paying.** A tool with no budget sits
  beside one with a generous budget, in the same order.
- **A free trial is never called free forever.** On `/free`, "free tier" and
  "free forever" are separate sections and a trial only counts in the first.
- **Self-submitted data is never presented as ours.** Submissions stay in a
  review queue and are never marked verified until a person approves them.

## 3. Where the product actually is

Verified against the running app, not aspirational.

**Working**

- 10 categories, 111 sections, 48 tools, all seeded.
- `/explore` one page, no pagination. `/free` grouped by what free means.
  `/categories` full tree with counts. `/tools/[slug]` detail with facts,
  alternatives, related and verification. `/search` plus two JSON endpoints.
- Ctrl/Cmd+K palette, light and dark themes.
- Mobile left drawer: scroll lock, Escape, backdrop, focus in and back out.
- Accounts: sign up, sign in, sign out, account page. Google wired but
  dormant until credentials exist.
- Anyone with an account can submit a product. Queue, admin review, notes
  back to the submitter, five pending per account.
- One labelled sponsored slot on `/explore`, separate query, renders nothing
  when empty.
- `/sponsors` disclosure page.

**Checks that would catch a regression**

| Command                 | Covers                                                      |
| ----------------------- | ----------------------------------------------------------- |
| `npm run verify`        | typecheck, lint, format, 25 tests, build                    |
| `npm run check:auth`    | 12 assertions: signup, session, submission, guards, signout |
| `npm run check:mobile`  | 23 assertions: drawer, overflow, focus, scroll lock         |
| `npm run audit:orphans` | reachability from the Next entry points                     |

**Honest gaps**

- **All 48 tools are unverified.** `verified=0` is correct and expected. The
  admin verification pass is what makes the trust claim real, and it has not
  happened yet. This is the single biggest thing standing between the product
  and its pitch.
- No email verification, no password reset. A forgotten password is
  unrecoverable. Do not launch with accounts and no verification.
- No rate limiting on the auth routes.
- No analytics, no sitemap, no legal pages.
- `/stacks`, `/compare`, `/utilities` had links with no routes. Links removed
  until the pages exist.
- The domain has no TLD, so the contact address renders as plain text.

## 4. The business model

The directory is free, so the directory is not the product. Attention is the
product, sold back to the vendors whose tools are listed, on a weekly cycle.
That is the model the competitor runs, verified against its live pricing page:
$9 per product for a launch, $15/week sidebar, $20/week dashboard, payment
through Dodo Payments.

**What we sell**

- **Free listings.** Submit, review, publish. This is content, not a loss
  leader.
- **Vendor analytics, free.** Views and outbound clicks on your own listing.
  Costs us nothing we promised, and it makes a sponsorship the obvious upgrade
  rather than the only option.
- **Sponsored placement, per week.** One labelled slot above the organic
  list. Weekly term, permanently labelled, no effect on ranking or
  verification.
- **Affiliate links.** Outbound clicks only. Never changes a price, never
  changes a position.

**What we refuse to sell:** ranking, verification, inclusion, reviews, user
data, and permanent placements. A permanent slot is a rank in disguise.

Full reasoning and the competitor's real numbers: `docs/monetisation.md`.

## 5. What happens next, in order

Ordered by value per unit of effort, not by what's most fun.

**1. Verify the 48 tools.** Manual, slow, and it is the whole product. Every
tool checked against its own pricing page. Nothing else on this list matters
as much.

**2. Comparison pages.** "Alternative to X" for the tools people actually
compare against. Highest-intent queries there are, genuinely useful to the
reader, and this is how the directory earns traffic. Unlike sponsorship it
pays the reader, not the vendor. This is the traffic that makes sponsorship
worth selling.

**3. Vendor analytics.** We already accept submissions. Showing a submitter
their own views and clicks turns a form into something worth checking, and it
needs the `tool.outbound` event that is already in the schema.

**4. Turn the review queue into a real flow.** Approving a submission should
create the tool, capture the fields, and set verification to pending rather
than verified. Right now approving changes a status and stops.

**5. Claim your listing.** Free, and it pays for itself in corrections from
the people who know the data.

**6. Sponsorship checkout.** Only once there is traffic worth charging. Not
before. Do not integrate Dodo Payments until there is a confirmed buyer.

**7. Utilities and the stack builder.** Real features, genuinely wanted, but
they compound nothing. They come after the traffic engine.

## 6. Decisions I need from you

Edit this section, it is the point of the file.

- **Domain.** `SITE.domain` is `erstuff` with no TLD. You mentioned `.fun`.
  Needed before the contact address can be a real link and before launch.
- **Pricing for a sponsored week.** The competitor charges $15 and $20. We
  have one placement, so one price. Is $15/week right, lower to seed the
  first few sponsors, or higher?
- **Do we sell a dofollow backlink for free listings?** The competitor's own
  copy contradicts itself on this. A dofollow link from a real directory has
  genuine value, so this is a real revenue line, but it also rewards people
  who submit. My instinct is no, and keep linking honest.
- **Name.** `erstuff` is two words run together and the wordmark is the only
  place it is spelled that way. Does that survive a launch?
- **Verification method.** Should a listed vendor be able to claim their own
  entry by proving domain control? It would make verification far cheaper
  and scale past 48 tools. The risk is that domain control proves ownership,
  not accuracy, and the label has to say so.
- **Is the admin verification pass something I do, or do you want to do it?**
  It is 48 tools and it is the least automatable part. Knowing this changes
  what I build next.

## 7. Not doing

Recorded so it does not creep back in:

- Microservices, Kubernetes, Kafka, Elasticsearch, Redis, BullMQ
- A generic Mongoose model helper, it kills the compiler, see `AGENTS.md` 5.1
- Booleans for uncertain fields
- Dashed borders, pill shaped tags, filter chips
- A third party favicon service
- Login gated browsing
- Reviews, they invite a pay to remove problem
- An admin CMS before there is a real admin workflow
