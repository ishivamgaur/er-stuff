# Developer Hub: Execution Plan

Companion to `decisions.md`. Milestones, order, and definition of done.

Every milestone ends with something that runs. No milestone ends with a
half built foundation that the next milestone has to work around.

---

## Milestone 0: Decisions and scaffold

No product code. Everything here is cheap to change and expensive to change
late.

**Tasks.**

1. Record the D1 to D22 decisions. Done, see `decisions.md`.
2. Scaffold Next.js with App Router, TypeScript strict, Tailwind, ESLint flat
   config, Prettier, Vitest, Playwright.
3. Install shadcn/ui. Set the dark first theme from section 44 as the base
   tokens, not the default.
4. Add `src/config/categories.ts` with the 10 seed categories and their
   subcategories. The remaining section 4 categories are listed with
   `status: "planned"`.
5. Add `src/config/navigation.ts` containing only routes that exist.
6. Create the MongoDB Atlas cluster, pick a region near the Vercel region,
   create the database user, wire `MONGODB_URI`.
7. Commit `scripts/atlas/search-index.json` (D4).
8. Add `src/schemas/pricing.ts` first, since it is shared by the most things.

**Definition of done.**

- `npm run dev`, `npm run build`, `npm run lint`, `npm test` all pass.
- `MONGODB_URI` connects.
- No nav entry points at a nonexistent route.

**Do not build yet.** No models, no auth, no UI beyond a shell.

---

## Milestone 1: Data foundation

**Tasks.**

1. Zod schemas for every entity (D17). Start with `tool.ts`, `category.ts`,
   `tag.ts`, `user.ts`.
2. Tri state booleans per D5. The Zod schema uses `z.boolean().nullable()`.
3. Mongoose models mirroring the schemas. Connection singleton with
   `globalThis` caching and `.lean()` reads (D18).
4. Categories with `path` and `parentId` (D7). Path built on save.
5. `alternatives` one directional with reverse lookup helper (D8).
6. All compound indexes from D9.
7. `events` collection plus the `rateLimits` collection with a TTL index.
8. A repository layer per entity under `src/lib/db/`. Route handlers call
   repositories, never Mongoose directly. This is what makes the seed, the
   admin, and the API share one query implementation.

**Definition of done.**

- A script creates 2 categories, a nested subcategory, and 2 tools with `null`
  capabilities, then queries each shape from D9 and confirms an index is used
  via `explain()`.
- A unit test asserts a `null` capability serialises to `null` and not `false`.
- No route handler imports Mongoose.

**Watch for.** Tri state fields are the easiest thing to get wrong under time
pressure. Enforce it in the Zod schema so it cannot be bypassed.

---

## Milestone 2: Authentication and the admin CMS

This is the gate. Nothing public ships until an admin can create content and
see it appear.

**Tasks.**

1. Better Auth wired to the `users` collection (D1). Email and password plus
   one social provider. `role: "user" | "admin"` on our model.
2. Server side helpers: `requireUser()`, `requireAdmin()`. Every admin mutation
   calls `requireAdmin()` (section 47).
3. Admin shell: sidebar, layout, auth guard on the whole segment.
4. Category CRUD with reordering.
5. Tag CRUD.
6. Tool CRUD with the full editor from section 35, in this order: identity
   (name, website, logo, description), taxonomy (categories, subcategories,
   tags), pricing block, capabilities block, relations (alternatives, related),
   editorial (bestFor, technologies, integrations), flags (featured,
   sponsored), lifecycle (status, verification).
7. Actions: save draft, publish, archive, feature, mark sponsored, verify.
8. Verification panel: `lastCheckedAt` and `lastVerifiedAt` shown separately,
   checked fields, notes, write a `verificationLogs` entry.
9. Submissions and reports review screens, so the data model is exercised even
   before public submission exists.

**Definition of done.**

- An admin creates a tool with a null capability, publishes it, and it appears
  in a database query for its category.
- A non admin hitting an admin API route gets 403, verified by test.
- The tool editor saves every field in section 35 and round trips it exactly.
- Sponsored is settable and clearly separated from featured in the UI.

---

## Milestone 3: Seed data

**Tasks.**

1. Seed script for categories and subcategories from `src/config/categories.ts`.
2. Seed 150 to 250 tools across the 10 categories, 15 to 25 each.
3. Every seeded tool: `verification.status: "unverified"`,
   `lastCheckedAt: null`, `lastVerifiedAt: null`, `stats` all zero. No
   fabricated views or stars.
4. Pricing taken from official pricing pages only. Anything not confirmed is
   `null`, per D5.
5. Alternatives and related tools wired, since they power compare and stack
   building.
6. Run the script, then run the admin verification pass over every tool so
   `lastVerifiedAt` values are real before launch.

**Definition of done.**

- No tool has a `false` value for a field nobody checked.
- No seeded tool displays a verification date until an admin verified it.
- Every alternative relation is one directional in the data and symmetric in
  the UI (D8).

**Watch for.** This is the most temptation filled milestone. Inventing a price
to fill a field is the exact failure the plan spends sections 14, 19, 50, and
51 warning about. Leave it null.

---

## Milestone 4: Public discovery

**Tasks.**

1. Homepage per section 26. Developer index feel, not a SaaS marketing page.
2. `/explore` with URL driven filters and server side filtering.
3. `/categories/[slug]` with subcategory nav and the filter bar.
4. `/tools/[slug]`, the full detail page from section 29, compact and dense.
5. Filter bar and filter drawer, all state in the URL.
6. Pagination.
7. `/free` and `/free/[category]` with the six pricing states distinct.
8. `/alternatives/[slug]`.
9. `generateMetadata` everywhere plus JSON-LD on tool pages, canonical URLs,
   OpenGraph, Twitter cards. `sitemap.ts` and `robots.ts`.
10. `ToolLogo` with the Simple Icons and monogram fallback (D20).
11. Events emitted for `tool.view`, `tool.outbound`, `category.view`,
    `search.query` (D21).

**Definition of done.**

- Every filter combination in section 21 returns correct results from a
  compiled compound index.
- A shared filtered URL reproduces the exact same result set in a fresh
  session.
- Unpublished tools never appear anywhere.
- Lighthouse on a category page: performance 95+, accessibility 100, SEO 100,
  no layout shift from logos.
- Null capabilities render as "Not verified", never "No".

**Watch for.** A page that renders `false` for unknown is a data lie. Grep for
`=== false` in render paths as part of review.

---

## Milestone 5: Search and the command palette

**Tasks.**

1. `SearchProvider` interface and both implementations (D4).
2. Atlas Search index applied from the committed definition.
3. `GET /api/search` with filters, plus an autocomplete endpoint.
4. Search page at `/search`.
5. Command palette on Ctrl+K, searchable across tools, categories, utilities,
   technologies, and pages.
6. Rate limit autocomplete per D19.

**Definition of done.**

- `npm run dev` with no Atlas credentials returns real results from the
  fallback.
- `SEARCH_PROVIDER=atlas` with credentials returns real results.
- "free postgres" returns database tools with a free tier.
- The palette is fully keyboard operable with a visible focus ring and correct
  ARIA (section 45).
- A test asserts the fallback and Atlas providers return the same shape.

---

## Milestone 6: Accounts and workspace

**Tasks.**

1. Bookmarks, list and toggle.
2. Collections, CRUD, private and public.
3. Public collection URL `/collections/[username]/[slug]` (D14).
4. Dashboard shell: bookmarks, collections, stacks, submissions, settings.
5. `username` unique sparse index.
6. Bookmark counts kept in sync with `Tool.stats.bookmarks`.

**Definition of done.**

- A user bookmarks from a tool page and sees it on the dashboard.
- A public collection is reachable by an anonymous visitor at a stable URL.
- A private collection returns 404 to anonymous, not 403, so it does not leak
  existence.

---

## Milestone 7: Compare and alternatives

**Tasks.**

1. `/compare?tools=a,b,c` (D3), 2 to 5 tools.
2. `GET /api/compare?tools=a,b,c`.
3. Comparison table with the rows from section 31, factual differences only.
4. No winner, no scoring, no recommendation inside compare.
5. Unknown cells render as "Not verified" per D5.
6. Per column: visit, add to stack, bookmark.

**Definition of done.**

- An unknown slug produces an empty state naming the bad slug.
- Six tools is rejected with a clear message.
- No cell renders a `null` as "No".
- A test asserts the page contains no "winner", "best", or "recommended"
  language about which tool to pick.

---

## Milestone 8: Stack builder

**Tasks.**

1. The four step wizard from section 32.
2. The scoring function from D12, as a pure module, with unit tests.
3. Cost rules from D13, with unit tests.
4. The disclaimer on every estimate.
5. Save a stack, share a stack, public stack URL `/stacks/[slug]`.
6. Replace a tool in a saved stack.
7. "Add to stack" from any tool page.

**Definition of done.**

- The wizard and `POST /api/stacks/recommend` call the same scoring function.
- Deterministic: identical input returns an identical ordering, verified by a
  test with no database.
- A "free" budget stack never contains a paid-only tool.
- Every estimate shows the disclaimer, and an unverified stack shows the
  unverified warning.

**Watch for.** The scoring function must stay pure. The moment it queries the
database it becomes untestable and the wizard and API will drift.

---

## Milestone 9: Developer utilities

**Tasks.**

1. The registry from D16.
2. Group pages: data, security, web, developer.
3. First 10 from section 65, then expand: JSON formatter, JWT decoder, UUID
   generator, regex tester, cron generator plus parser, Base64 encode and
   decode, URL encode and decode, timestamp converter, hash generator, SQL
   formatter, OpenGraph generator, robots.txt, sitemap, markdown preview, colour
   converter, SVG viewer.
4. Every utility client side, with the "Processed locally in your browser"
   label.
5. Per utility `generateMetadata` and structured data from registry keywords.

**Definition of done.**

- No network request leaves the browser while using any utility. Verified in a
  Playwright test that intercepts and fails on outbound requests.
- Adding a utility is one registry entry and one component file, nothing else.
- The palette finds utilities from the registry.

**Watch for.** A utility that posts user input to a server is a security
problem for JWT and hashing tools. Keep the whole subtree free of server
actions.

---

## Milestone 10: Community and verification automation

**Tasks.**

1. `/submit` public form, rate limited.
2. Report flow with the seven types from section 17.
3. Suggest edit. The plan includes it in phase 8 but never models it. Model it
   as a submission with `kind: "suggestion"` and a `toolId`, same admin
   review queue.
4. Submission workflow: pending, admin review, approved becomes a tool or a
   patch, rejected with notes.
5. Broken link checker on Vercel cron. Writes `lastCheckedAt` and
   `status: "broken"`. Never touches `lastVerifiedAt`, never edits pricing
   (section 36, D6).
6. Stale queue, 90 days on `lastVerifiedAt`, configurable.
7. Events aggregation job into `Tool.stats` (D11).

**Definition of done.**

- A dead URL is detected and queued within a day, and a live one is not
  falsely flagged over a full run.
- A test asserts the checker never writes `lastVerifiedAt`.
- A submission approved in admin appears publicly with no frontend change.

---

## Milestone 11: Launch hardening

**Tasks.**

1. Sentry on both server and client.
2. Rate limits verified per D19.
3. Privacy policy, terms, cookie notice, data deletion request path (D21).
4. Full accessibility pass, keyboard only, reduced motion honoured.
5. Security review: input sanitisation, safe URL validation on every stored
   URL, admin authorisation re-checked on every mutation, no stack traces in
   responses, no credentials in client env.
6. SEO pass: titles, descriptions, canonical, structured data, sitemap
   coverage, no thin pages.
7. Performance budget enforcement in CI.
8. Run the seed plus verification pass one final time.
9. Deploy.

**Definition of done.**

- Lighthouse 95+ on home, category, tool, search, and one utility.
- Zero axe violations on the six key pages.
- `npm run ci` green: typecheck, lint, test, build.
- No `null` field renders as a negative claim anywhere in the app.
- The organic sort independence test passes.

---

## Test strategy

**Vitest, unit and API.**

- Scoring function, all D12 branches, determinism.
- Cost rules, D13, every billing period and pricing type.
- Pricing schema: the six states, and that `free_trial` is never coerced to
  `free`.
- Filter query builder: every parameter in section 21, and combined filters.
- Ranking independence: the organic sort does not read `featured` or
  `sponsored`. This is the test that protects the trust promise.
- Verification helpers: `lastCheckedAt` never satisfies a `lastVerifiedAt`
  check.
- Utilities registry: every entry has a slug, title, description, group,
  keywords, and a resolvable component.
- Rate limiter: limit is enforced and entries expire.
- Access control: `requireAdmin` rejects non admins on every admin route.

**Playwright, end to end. Three flows only.**

1. Search "nextjs auth", open a tool, check pricing and free tier, open
   alternatives, visit the site, bookmark.
2. Admin creates a tool with a null field, publishes, verifies, then an
   anonymous visitor finds it in a category page and in search.
3. Stack builder: four steps, generate, save, share, open the public URL.

**Accessibility, axe on.** Home, category, tool, search, compare, one utility,
one admin screen.

---

## Sequencing notes

- Milestone 2 gates everything. Resist building the homepage first for visual
  feedback. The public pages get built against real data exactly once.
- Milestone 3 before 4 means the public site is never rendering fixtures.
- Milestones 5 and 6 can be parallelised once 4 lands. 7 and 8 can too, since
  they only read tools.
- Milestone 9 is independent of everything after 1 and could be built at any
  time. It is the cheapest organic growth surface, so it is worth building
  earlier than 9 if launch is slipping.
- Milestone 10 depends on auth from 6.
- Nothing in section 54 is on this list. No microservices, no Kubernetes, no
  Kafka, no Elasticsearch, no AI search, no payments, no jobs, no social
  graph, no reviews.

---

## Risks

**Atlas Search availability and tier.** Verify the chosen Atlas tier supports
Atlas Search before Milestone 5. D4's fallback keeps development unblocked but
does not fix a production gap.

**Data quality is the real cost.** Milestone 3 is the longest and least
glamorous part of the build. The 150 to 250 tools need real verification. Plan
for it as ongoing work after launch, not a one off. Milestone 10's staleness
queue is what keeps it true.

**Tool model size.** Roughly 40 fields on Tool. D17 exists to keep this
manageable. Do not bypass the Zod schemas with a quick Mongoose change.

**Vercel cron and link checking.** Daily on Hobby with a 60 second ceiling.
Fine at 250 tools. If tools grow past a few thousand, move to a scheduled job
with a real worker. D18's read paths should not assume a single instance.

**Index write cost.** D9 has three triple compound indexes on Tool. At V1
write volume this is irrelevant. Reassess at roughly 50k tools.

**Scope pull toward section 4's 33 categories.** Fifteen is the signal. If
nav grows past about seven items the information architecture is wrong.
