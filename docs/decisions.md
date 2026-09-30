# Developer Hub: Architecture Decisions

Status: accepted. These resolve the contradictions and gaps found in
`developer-hub-full-plan.md`. Where this document and the original plan
disagree, this document wins.

Date: 2026-09-29

---

## D1. Authentication: Better Auth

**Decision.** Use Better Auth with roles stored in our own `users` collection.

**Why.**

- Role lives in our model, not a vendor's metadata blob. Section 47 requires
  server side `role === admin` checks on every admin mutation, and that is
  trivial when we own the field.
- Self hostable. The platform recommends self-hostable tools, and shipping
  auth we cannot self host is a contradiction we would be documenting.
- No paid tier requirement for custom roles, unlike Clerk.

**Consequences.**

- `users` collection is owned by Better Auth plus our profile fields. Name the
  auth-owned fields in the schema and do not fight the library over them.
- Session handling, CSRF, and cookie flags come from Better Auth. We do not
  hand roll them.
- Add `emailVerified` and `banned` handling, because Better Auth supports
  banning and an admin panel needs a kill switch.
- Password hashing, rate limiting on auth routes: use the library defaults.

---

## D2. Content model: one `tools` collection with a `kind` field

**Decision.** A single `tools` collection holds external products and
resources, discriminated by `kind: "product" | "resource"`. In platform
utilities live in a typed code registry, not in the database.

**Why.** Section 5 of the plan names three content types but section 11 models
one. Splitting into two collections doubles the admin CRUD surface, the search
index configuration, the filter layer, and the comparison pages. Utilities are
code that runs in the browser; storing them as documents would mean a database
round trip for something that ships in the bundle.

**Consequences.**

- `kind` is required and indexed. The seed sets it explicitly.
- Filtering by kind: `/explore?kind=resource`.
- `resources` and `tools` share categories, tags, verification, reports,
  alternatives, related tools, and admin CRUD. No duplicated logic.
- Utilities registry at `src/content/utilities/registry.ts` is the data source
  for `/utilities` and `/utilities/[slug]`, satisfying rule 67. The registry
  holds slug, title, description, category, keywords, and a component
  reference. Adding a utility must not require editing a route or nav file.
- Search indexes both: Atlas Search covers the collection, the local fallback
  provider merges collection results with registry results.
- `tools.kind` is not user facing in the URL. `/tools/[slug]` serves both.
  Resources get a visible "Resource" label, not a separate route tree.

---

## D3. Comparison URLs: query parameters

**Decision.** `/compare?tools=vercel,netlify,cloudflare-pages`

**Why.** The plan's `/compare/[tool1]-vs-[tool2]` is unparseable because slugs
contain hyphens, and it breaks on rename. The plan already establishes query
parameters as the rule for filterable pages in section 42. Compare did not
follow its own rule.

**Consequences.**

- Two to five tools. Above five the table is unreadable on mobile and the page
  stops being useful.
- `tools` is a comma separated list of slugs. Unknown slugs return a 404 style
  empty state that names the bad slug, not a generic error.
- The compare page is not in the sitemap. It is an application surface, not an
  indexable page.
- SEO value comes from tool and category pages plus curated comparison
  articles, not from generated compare URLs. This also satisfies section 40's
  ban on thin pages.
- The API mirrors it: `GET /api/compare?tools=a,b,c`.

---

## D4. Search: provider interface with a local fallback

**Decision.** A `SearchProvider` interface with two implementations. Atlas
Search in production, a regex plus weighted field implementation for local
development and tests.

**Why.** Atlas Search does not exist outside Atlas. Without a fallback, no
contributor can run the app locally without a cluster and a hand built index.
With a fallback, the abstraction also makes Typescript or Meilisearch a later
swap rather than a rewrite.

**Consequences.**

- `src/lib/search/provider.ts` exports the interface.
- `src/lib/search/AtlasSearchProvider.ts` and
  `src/lib/search/FallbackSearchProvider.ts` implement it.
- Selection is by `NODE_ENV` plus an explicit `SEARCH_PROVIDER` env override,
  so a developer can test the Atlas path locally too.
- The index definition is committed at `scripts/atlas/search-index.json` and
  applied by a documented step. No hand editing in the Atlas UI, because that
  is not reproducible.
- The fallback ranks by field weight: name, then tags and technologies, then
  description, then bestFor and integrations. It supports prefix matching for
  autocomplete and AND token matching for results.
- The fallback is a development tool, not a V1 production feature. Production
  ranking quality comes from Atlas Search.

---

## D5. Tri-state fields, not booleans

**Decision.** Every field that section 50 says we must never invent is
`boolean | null`, where `null` means unknown.

**Why.** The plan's `Boolean` fields collapse unknown into `false`. An
unverified tool would render as "No self-hosted", which is a factual claim we
have no basis for. The product's differentiator is trustworthy structured data,
so this is a correctness issue, not a styling one.

**Fields affected.**

```
openSource.isOpenSource
openSource.githubUrl
openSource.license
capabilities.apiAvailable
capabilities.selfHostable
capabilities.commercialUse
capabilities.mobile
capabilities.web
capabilities.desktop
capabilities.cli
```

**Rendering convention, applied globally.**

- `true` renders the affirmative claim.
- `false` renders the negative claim.
- `null` renders "Not verified", muted, with a tooltip that says the field has
  not been checked. Never "No". Never a false badge.

**Consequences.**

- A "self hostable" filter only matches `true`, so results are correct.
- Compare tables show "Not verified" cells, which is honest and also signals
  that our data is incomplete rather than that the tool lacks the feature.
- The verification workflow has real value, because turning `null` into `true`
  or `false` is the work.

---

## D6. Verification: split checked from verified

**Decision.** Two timestamps with different meanings and different writers.

```
verification.lastCheckedAt   automated link checker may write this
verification.lastVerifiedAt  human admin only
```

**Why.** The plan forbids fake data and says only show a verification date if
it represents a real verification event. Its own seed process cannot produce a
real one, so at launch the trust signal the product is built on would not
exist. Splitting the fields lets automated checks be honest about what they
are.

**Consequences.**

- Seed data sets both to `null` and `status: "unverified"`.
- A launch checklist item is: run the admin verification pass over all seeded
  tools so real `lastVerifiedAt` values exist before the site is public.
- The public tool page shows "Last verified" from `lastVerifiedAt` only, and
  only when it is present. It never shows `lastCheckedAt` as verification.
- The link checker, on failure, sets `status: "broken"` and queues a report. It
  never edits pricing, per section 36.
- Stale threshold is 90 days on `lastVerifiedAt`, configurable.

---

## D7. Taxonomy: materialized path, single category reference

**Decision.** Categories are a tree with a `path` string. A tool references
leaf node ids in one field.

```
Category.path = "database.orm"
Tool.categoryIds = [ <drizzle-id> ]
```

**Why.** The plan's separate `categories` and `subcategories` arrays on Tool
can hold invalid states, such as a subcategory whose parent is not in
`categories`. A materialized path makes ancestor queries a prefix match, which
MongoDB can serve with an index.

**Consequences.**

- `Tool` has `categoryIds` only. Ancestors are derived.
- `Category.path` is built on save from `parentId` and is unique.
- "Everything under Database" becomes a prefix query, fast and index backed.
- Breadcrumbs come free from the path.

---

## D8. Alternatives are stored one directionally

**Decision.** `Tool.alternatives` lists the ids a tool is an alternative to.
The reverse view is derived by querying for tools whose `alternatives` contains
the id.

**Why.** Storing both directions invites divergence, where A lists B and B
does not list A, and nothing in the app knows which is correct.

**Consequences.**

- Index on `alternatives` and `relatedTools`.
- Rendering is symmetric through a helper, so admins only maintain one list.
- Admin UI shows the derived reverse list read only, so the editor is not
  confusing.

---

## D9. Indexes

**Decision.** The plan's single field index list is replaced with compound
indexes that match the actual query shapes in its own section 21.

**Why.** Filters are combined, for example
`?category=database&freeTier=true&openSource=true&sort=popular`. Single field
indexes do not serve a compound filter plus sort, and the planner will scan.

**Indexes.**

```
tools: { kind: 1, status: 1 }
tools: { slug: 1 }                                    unique
tools: { categoryIds: 1, status: 1, createdAt: -1 }
tools: { categoryIds: 1, status: 1, stats.views: -1 }
tools: { categoryIds: 1, status: 1, "pricing.type": 1 }
tools: { tags: 1, status: 1 }
tools: { "pricing.type": 1, status: 1 }
tools: { "pricing.hasFreeTier": 1, status: 1 }
tools: { "openSource.isOpenSource": 1, status: 1 }
tools: { "capabilities.selfHostable": 1, status: 1 }
tools: { alternatives: 1 }
tools: { relatedTools: 1 }
tools: { featured: 1, status: 1 }
tools: { "verification.lastVerifiedAt": 1, status: 1 }
tools: { "kind": 1, status: 1, updatedAt: -1 }

categories: { path: 1 }                               unique
categories: { slug: 1 }                               unique
categories: { parentId: 1, order: 1 }

tags: { slug: 1 }                                     unique

users: { email: 1 }                                   unique
users: { username: 1 }                                unique, sparse

stacks: { slug: 1, visibility: 1 }
collections: { userId: 1, slug: 1 }
submissions: { status: 1, createdAt: -1 }
reports: { status: 1, createdAt: -1 }

events: { type: 1, createdAt: -1 }
events: { toolId: 1, type: 1, createdAt: -1 }
```

**Consequences.**

- Compensate the triple compound indexes with Atlas `documentChanges` or
  scheduled pre aggregation only if write volume ever justifies it. Do not
  pre build. V1 does not need it.
- Every public query filters on `status: "published"` first. Unpublished tools
  must not leak through any listing.

---

## D10. Ranking never reads `featured` or `sponsored`

**Decision.** The organic sort query does not reference `featured` or
`sponsored`. Promoted results come from a separate query into a visually and
semantically distinct rail.

**Why.** The plan promises not to sell organic rankings. `featured` and
`sponsored` live on the same document the sort reads, so a single careless
`sort()` or a recommendation weight that includes them breaks that promise
silently.

**Consequences.**

- Organic sort options: `popular`, `newest`, `updated`, `name`. None of them
  read the promotion flags.
- Promoted tools are excluded from the organic sort and rendered in their own
  labelled section with a visible SPONSORED badge.
- A unit test asserts that the organic sort function does not read either
  field. This is the enforcement, since convention alone will not hold.
- "Popular" is `stats.views` and `stats.outboundClicks`, both real. No seeded
  or fabricated numbers, per section 69.

---

## D11. Stats come from an events collection, not inline counters

**Decision.** An append only `events` collection records views, outbound
clicks, searches, bookmarks, and utility usage. Aggregation jobs roll it into
`Tool.stats`.

**Why.** Incrementing counters on the tool document on every page view is a hot
write path. It causes document churn, contention on popular tools, and write
amplification on a document that is otherwise read heavy.

**Consequences.**

- Events carry no user identity by default, per section 39. Anonymous session
  bucketing only, and no cross session tracking.
- Aggregation runs on a Vercel cron, hourly at first.
- `Tool.stats` is a cache, not a source of truth.
- Only public published events are counted, so admin previews do not inflate
  numbers.

---

## D12. Recommendation scoring is specified, not implied

**Decision.** `POST /api/stacks/recommend` uses a documented deterministic
scoring function.

**Why.** Section 24 lists inputs and says use category, tags, technology,
pricing, and project type, but defines no algorithm. That is the whole feature
and it was left as a description.

**Algorithm.**

```
1. Budget filter, hard:
   budget = free      -> pricing.type in [free, open_source]
                          OR pricing.hasFreeTier = true
   budget = low       -> startingPrice <= 25 USD
   budget = flexible  -> no filter
   budget = enterprise-> no filter

2. Hard requirements filter, per selected requirement:
   requirement maps to a category, for example
   auth -> authentication, storage -> storage-media, email -> email,
   payments -> payments-billing, analytics -> analytics,
   monitoring -> observability, search -> search

3. Score each surviving candidate:
   +5  primary category matches the slot's category
   +3  subcategory matches the slot's subcategory
   +3  project type appears in bestFor
   +2  per overlapping technology or tag, capped at +6
   +2  declared integration with an already selected tool
   +1  self hostable
   +1  api available
   +1  featured            (curation signal, not paid)
   -10 already selected for another slot
   -5  verification.status is not "verified"

4. Deterministic tie break: score desc, then stats.views desc, then slug asc.

5. One tool per slot. Fill remaining slots in slot order.
```

**Consequences.**

- `featured` is a curation signal and is not a paid field, so unlike
  `sponsored` it is allowed here. The distinction is documented so it does not
  rot.
- The same function serves the Stack Builder wizard and the recommend API, so
  the UI and the API can never disagree.
- The function is pure and unit tested. No database access in the scoring
  function itself, only the candidate set feeding it.

---

## D13. Cost estimation rules

**Decision.** Stack cost is computed under explicit rules and labelled as an
estimate.

**Rules.**

- Include only `pricing.billingPeriod === "monthly"` tools in the monthly
  total.
- `contact_sales` contributes `null`, and the stack is marked "not fully
  priced".
- `one_time` tools are listed separately as one time cost, not amortised.
- `free`, `open_source`, and self hostable tools contribute `0`, with a note
  that self hosting has infrastructure cost that is not included.
- The label is "entry tier list price", not "cost", because it sums the
  cheapest published tier across tools and is not a usage estimate.
- If any tool in the stack is `verification.status !== "verified"`, the
  estimate carries a visible unverified warning.
- The disclaimer from section 32 appears on every estimate: pricing is based on
  listed pricing and free tier assumptions, and can change.

**Consequences.**

- The estimate is defensible and obviously an estimate, which is what the plan
  requires. It never claims to know real spend.

---

## D14. URL scheme, one set

**Decision.** The plan has two conflicting schemes for free content. One is
kept.

```
/tools/[slug]
/categories/[slug]
/explore
/free
/free/[category]
/alternatives/[slug]
/compare?tools=a,b,c
/stacks
/stacks/[slug]
/utilities
/utilities/[slug]
/collections/[username]/[slug]
/search
/submit
```

- `/free/[category]` is kept. The plan's section 41 slugs like
  `/free-postgresql-databases` are not generated. If curated comparison and
  collection articles are wanted later, they are hand written pages, not
  generated ones.
- Public collections are `/collections/[username]/[slug]`. Section 38 says pick
  one; this is the one, and it is consistent with public stacks.
- Section 56's secondary nav items "Open Source, Learning, Templates" are not
  routes in section 25. They are removed from nav until they exist. Nav never
  links to a page that does not exist.

---

## D15. Taxonomy cleanup

**Decision.** Section 4 is not a taxonomy. It mixes abstract needs, leaf
labels, and product brands. Brands are data, not categories.

**Rules.**

- A category is a need or a discipline, never a product name.
- `PostgreSQL`, `Next.js`, `Figma`, `Vercel` are tools, not categories.
- Seeds are 10 top level categories, per sections 52 and 65:

```
01 Design
02 UI Components
03 Frontend
04 Backend
05 Database
06 Authentication
07 Hosting
08 Deployment
09 AI
10 Developer Tools
```

- "DevTools" in section 26 does not exist in section 4. It is renamed
  "Developer Tools" and maps to section 4's "IDE / Coding".
- The remaining 23 section 4 categories are kept in
  `src/config/categories.ts` as `status: "planned"` so the roadmap is visible
  in code, but they are not created in the database and not linked in nav.
- Subcategories are per top level category, roughly 5 to 9 each, and are what
  makes filters and stacks useful.

---

## D16. Utilities registry

**Decision.** A typed registry is the data source for the utilities area.

**Shape.**

```ts
type UtilityDefinition = {
  slug: string
  title: string
  description: string
  group: "data" | "security" | "web" | "developer"
  keywords: string[]
  component: () => ReactNode
}
```

**Consequences.**

- `/utilities` lists from the registry. `/utilities/[slug]` resolves from it.
- `generateStaticParams` over the registry.
- Each utility renders with the "Processed locally in your browser" label,
  because the plan requires utilities to run client side wherever possible.
- Every utility is a client component and sends nothing to the server. This is
  a security property for JWT decoding and hashing, and it is enforced by
  having no server action in the utilities tree.
- Adding a utility is one registry entry plus one component file.

---

## D17. Schema source of truth

**Decision.** Zod schemas in `src/schemas/` are the source of truth. Mongoose
schemas in `src/models/` mirror them. Application types come from `z.infer`.

**Why.** The Tool model in the plan has roughly 40 fields across pricing,
free tier limits, capabilities, and verification. Hand written Mongoose
schemas and hand written TS types for a model that size will drift, and drift
here means wrong pricing shown to users.

**Consequences.**

- One file per entity under `src/schemas/`, imported by both the model and
  every route.
- Mongoose validation delegates to the Zod schema rather than duplicating
  required fields and enums.
- API request and response validation uses the same schemas.
- The pricing enum exists once. Section 19's six pricing states are a single
  Zod enum reused by the model, the API, the filter parser, and the badge
  component.

---

## D18. MongoDB connection in the App Router

**Decision.** A connection singleton with a cached promise, in
`src/lib/db/connect.ts`.

**Why.** The plan's stack is Mongoose in Next.js App Router, which hot reloads
modules in development. Without a singleton, every reload opens a new pool
until Atlas refuses connections.

**Consequences.**

- Cache the connection promise on `globalThis` in development.
- Use `.lean()` in every read path. Hydrated Mongoose documents waste
  serialization time across the server client boundary.
- Use `next: { revalidate }` or `unstable_cache` on public read paths.
- Auth and admin reads use `cache: "no-store"`.

---

## D19. Rate limiting store

**Decision.** MongoDB based token bucket, with a documented path to Upstash
Redis if Vercel function isolation makes the in database limiter unreliable.

**Why.** The plan requires rate limiting but bans Redis. Vercel isolates
function instances, so an in memory limiter is not shared and is not a real
limit. MongoDB is already there and works at V1 volume.

**Consequences.**

- Limits: 60 requests per minute on public GET, 10 per minute on search
  autocomplete, 5 per hour on submissions and reports.
- Applied at the route handler, keyed on hashed IP plus route class.
- Write to a dedicated `rateLimits` collection with a TTL index so entries
  self expire.
- The limitation is documented: this is a coarse abuse guard, not a
  sophisticated distributed limiter.

---

## D20. Logo strategy

**Decision.** Simple Icons by slug, with a deterministic monogram fallback. No
binary assets stored, no R2 in V1.

**Why.** The plan puts `Cloudflare R2` in the stack but V1 stores no user
uploads. Logos for 250 tools would otherwise mean either scraping favicons
(legal and maintenance risk) or 250 committed binaries.

**Consequences.**

- `logoUrl` is optional. When absent, `ToolLogo` renders initials derived from
  the name, on a deterministic background derived from a hash of the slug. Same
  tool, same colour, every render, no layout shift.
- Resolution order: stored `logoUrl`, then Simple Icons by slug, then
  monogram.
- Remote images go through `next/image` with a fixed allowlist host. No
  arbitrary host from user submitted data.
- R2 stays in the stack, listed as "when file uploads exist", not as a V1
  dependency.

---

## D21. What was added that the plan did not cover

**Items with no home in the original plan.**

- Test strategy. Vitest for units and API routes, especially scoring, pricing
  cost rules, and the ranking independence test. Playwright for the two or
  three critical flows: search to tool page, admin creates tool and it appears
  publicly, stack builder end to end.
- Lint and format. ESLint flat config plus Prettier, enforced in CI.
- CI. Typecheck, lint, test, build. No deploy without green.
- Error tracking. Sentry. The platform recommends Sentry, it would be
  embarrassing to ship without it.
- Legal pages. Privacy policy, terms, and a data deletion path. The product
  plans analytics, sponsorship, and affiliate revenue, which all have legal
  obligations. Section 30 lists privacy policy generators as tools the platform
  offers, not as an obligation the platform itself has.
- Event taxonomy. Defined up front so analytics is not retrofitted.

**Event taxonomy, V1.**

```
tool.view          toolId
tool.outbound      toolId, destination (website | github | docs)
search.query       query, resultCount, filters
search.click       query, toolId
category.view      categoryId
bookmark.create    toolId
bookmark.remove    toolId
stack.generate     projectType, budget
stack.save         stackId
stack.share        stackId
collection.create  collectionId
submission.create  categoryId
report.create      toolId, reportType
utility.open       utilitySlug
utility.action     utilitySlug, action
```

No user id on anonymous events. No IP stored on events.

---

## D22. Migrations to the original plan's step order

**One change.** Admin CMS moves before the public UI.

**Original order** (section 64): models, admin auth, admin shell, CRUD, seed,
then homepage at step 13.

**Our order**: models, admin auth, admin shell, CRUD, seed, then the public
pages.

**Why.** The plan already puts admin before homepage, so this is not actually a
change. It is worth stating explicitly because the temptation will be to build
the homepage first for visual feedback. The public pages are then built
against real data, so there is no second round of replacing fixtures with
queries, and rule 67 is enforced structurally rather than by discipline.

---

## Open items deferred to a later decision point

Not decided now. Listed so they are not silently forgotten.

- Utility libraries. Section 33 implies real formatters for JSON, SQL, CSS, and
  HTML. Decide at Milestone 9. Client side only, small and audited.
- Semantic search and natural language queries. Section 53 phase 10, V2.
  Not V1.
- Reviews and ratings. Section 9 lists a future `reviews` collection. Not V1.
  Moderation cost is real and section 54 warns against complicated moderation.
- Jobs board. Not V1. Section 54 already excludes it.
- Sponsorship product and pricing. Model supports the flag, the commerce does
  not exist in V1.
- Curated comparison and collection articles for SEO. Only once there is
  enough real data, per section 40.

---

## Non negotiable, carried from the plan

These were in the plan and are not negotiable. They are restated because they
are the product.

- Never invent pricing, free tiers, stars, features, licenses, or integrations.
  Unknown is `null` and renders as "Not verified".
- Never present a free trial as free forever. Section 19's six pricing states
  stay distinct.
- Sponsored content is always labelled. Sponsored never affects organic order.
- No fake analytics. Real events only, and no fabricated seed numbers.
- No placeholder buttons that do nothing. No fake functionality.
- Content is data driven. Adding a tool must not require a frontend change.
- Only show a verification date when a human verified it.
- The admin panel controls the content. The public site only reads.

---

## D23. Accounts and user submitted listings

**Decision.** Anyone with an account can submit their own product. Submissions
land in a review queue and never appear publicly, and are never marked
verified, until a person approves them. Auth is Better Auth with a MongoDB
adapter, per D1. The admin role is granted only by
`npm run db:promote`, never through the sign up form.

**Why.** The earlier plan argued that browsing should need no account, and that
was right for reading. It was wrong for writing. A vendor is the most accurate
source of information about their own product, and a queue lets us collect that
without weakening the promise the site is built on. The alternative, letting
anyone publish immediately, would have made "verified by a person" meaningless.

**Consequences.**

- `role` is `input: false` on the auth user, so the client cannot assign itself
  admin. There is no self service admin signup.
- An account may have at most five pending submissions, capped per account
  rather than per IP, so a shared office IP does not punish everyone behind it.
- A submission is a vendor claim, not data. It never inherits `verified`.
- Accounts exist now, which reverses the earlier no-login stance for reading.
  Reading still needs no account and that has not changed.

## D24. Credential calls go through the client SDK, not server actions

**Decision.** Sign in, sign up and sign out call the Better Auth client SDK
from a client component. We do not call `auth.api.*` inside a server action.

**Why.** `auth.api.signInEmail` returns its `Set-Cookie` on a response object
that a server action discards. The result is a redirect to an authenticated URL
with no session cookie, so the user silently lands back on a signed out page
with nothing to explain why. This failed in exactly that way and cost real time.
Sign out had the mirror problem, where the cookie was never cleared and the
session survived the refresh.

## D25. Markdown as the visual language, not the content source

**Decision.** The interface reads like technical documentation. Headings carry
their `#` and `##`, structured data renders as a fenced block or a definition
list, lists use `-` markers, and attribute names are the real field names, for
example `pricing.freeTier`. Content stays in MongoDB. We are not adopting MDX.

**Why.** Markdown is legible because its structure is visible. A reader can tell
a heading from a value from a note before reading a word, which suits a
directory whose whole value is scannable, honest fields. Taking it further, to
markdown files as the content source, would mean giving up the database and
the review workflow for a site whose data is edited by people, not by commits.

**Consequences.** `src/components/md/primitives.tsx` owns the vocabulary and
every page uses it. No ad hoc `##` markers in individual components, or the
language stops being consistent.

## D26. Google sign in, dormant until configured

**Decision.** Better Auth is configured with Google as a social provider, but
only when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are both present. The
Continue with Google button is rendered from the server, so it never appears
when sign in cannot complete. Account linking is enabled with
`trustedProviders: ["google"]`, so a matching verified email links to the
existing account instead of creating a second one or reporting the address
taken.

**Why.** Password only costs a vendor the highest friction step in the
submission flow. Conditional configuration means a fresh clone and CI need no
Google Cloud project, and the app never shows a button that leads to an error.
