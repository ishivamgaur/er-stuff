# erstuff: plan

This is the current product plan for **erstuff**.

The goal is simple:

> **erstuff is one place where developers can discover the software and tools they need to build and ship software.**

This document is the product, architecture, implementation, data, monetisation, and UX planning source of truth. The final visual design is intentionally left open for implementation and review.

---

## 1. Product goal

erstuff is a developer-tool discovery platform.

It should collect useful software, services, platforms, utilities, resources, and products that developers may need during the process of building software.

The product is **not** trying to teach software engineering, document technical concepts, or become a generic SaaS directory.

The core unit is a **tool/product**.

Examples:

- Figma
- Cursor
- VS Code
- GitHub
- Vercel
- AWS
- Cloudflare
- Supabase
- Firebase
- MongoDB Atlas
- Neon
- Clerk
- Auth0
- Stripe
- Resend
- Sentry
- PostHog
- Linear
- Docker
- Postman
- Playwright
- BrowserStack
- OpenAI
- Anthropic
- AI coding tools
- developer utilities
- component libraries
- templates
- boilerplates
- and many more

### One-line pitch

> **erstuff - discover the tools you need to build software.**

### Long-term vision

> **The place developers go whenever they need to find software.**

---

# 2. The problem

Developers constantly need to find tools.

Examples:

- "What authentication tool should I use?"
- "What database should I use?"
- "What's a good hosting platform?"
- "What AI coding tools are available?"
- "What's an alternative to this tool?"
- "Is this tool free?"
- "Can I self-host it?"
- "Does it have an API?"
- "What are similar tools?"

Today, answers are spread across:

- Google
- Reddit
- GitHub
- Product Hunt
- YouTube
- blog posts
- comparison articles
- individual vendor websites
- random directories

The problem is not that tools are unavailable.

The problem is **discoverability and decision-making**.

erstuff should make the process:

```text
Need something
    ↓
Search erstuff
    ↓
Browse / filter tools
    ↓
Understand options
    ↓
Compare
    ↓
See alternatives
    ↓
Visit the chosen tool
```

---

# 3. What erstuff solves

## For developers

A developer gets one place to:

- discover tools
- search tools
- browse categories
- filter tools
- understand what a tool does
- check pricing
- check free availability
- check open-source status
- check self-hosting
- check API availability
- see technologies/integrations
- find alternatives
- compare tools
- save useful tools
- visit the original product

## For tool companies

A company gets:

- a free product listing
- product discovery
- a product page
- traffic
- outbound clicks
- analytics
- the ability to claim its listing
- the ability to correct product information
- optional sponsored visibility

The two-sided loop is:

```text
Developer
   ↓
Discovers tool
   ↓
Uses / visits tool
   ↓
Tool company gets traffic
   ↓
Company claims listing
   ↓
Company keeps information accurate
   ↓
Company can optionally sponsor
```

---

# 4. Product boundaries

erstuff should stay focused.

## Core

- Developer tool discovery
- Search
- Categories
- Filters
- Tool profiles
- Alternatives
- Comparisons
- Verified/structured information
- Vendor submissions
- Vendor analytics
- Sponsorship

## Not the core

- Jobs
- Courses
- Tutorials
- Developer social networking
- Coding playgrounds
- Project management
- Community forums
- Reviews
- Generic SaaS directory for every business category

A product can belong to categories like payments, collaboration, design, or analytics because developers use those products.

The audience remains developers.

---

# 5. Core navigation architecture

The navigation answers:

> **"Where should I look for the kind of tool I need?"**

The architecture is a two-level index, in the shape popularised by
designeer.xyz but built for software engineers:

```text
Sidebar                         Right side
──────                          ──────────
Navigation                      Page header
  Build          ← selected     Sponsored rail
  Components                     01 Section one  → full tool list
  Frontend                       02 Section two  → full tool list
  Backend                        03 Section three → full tool list
  Data                           ...
  Ship
  AI
Sections (of Build)
  Editors & IDEs   ← scroll-spy highlights while scrolling
  AI Coding
  Agents & MCP
  Git & Code Review
  ...
```

## Top-level navigation items

Seven items. Each is a real route; each renders every one of its sections
stacked on a single page.

| Nav item            | Route         | Sections                                                                                                            |
| ------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Build** (default) | `/`           | Editors & IDEs · Terminals · AI Coding · Agents & MCP · Git & Code Review · Code Search & Issues · Testing & E2E    |
| **Components**      | `/components` | Component Libraries · Headless UI · Forms & Tables · Charts · Motion & Animation                                    |
| **Frontend**        | `/frontend`   | Design Inspiration · Design Systems & UI Kits · Fonts, Icons & Color · Frameworks · Styling & State · Accessibility |
| **Backend**         | `/backend`    | Runtimes · APIs · Auth · Payments · Email · Queues & Jobs                                                           |
| **Data**            | `/data`       | SQL · NoSQL · Vector · Cache · ORMs & Migrations · Database Hosting & GUIs · Storage & Files · Search               |
| **Ship**            | `/ship`       | Hosting · Serverless & Edge · Deployment · CI/CD · Containers & IaC · Monitoring & Analytics                        |
| **AI**              | `/ai`         | LLM APIs & Models · AI SDKs · RAG & Embeddings · Evaluation & Observability · Image & Video                         |

## Section mapping rule

Sections are groupings of the existing subcategory slugs, defined in
`src/config/nav.ts`. Every subcategory is claimed by exactly one section — a
coverage test enforces this, so no part of the directory becomes unreachable.
The MongoDB category tree and every tool's `categoryIds` stay exactly as they
are; there is no data migration. Sections reference subcategories, never the
other way round.

## Counts

- A section count is the number of distinct tools in its subcategories.
- A nav count is the number of distinct tools across all of its sections.
- Distinct means a `Set` of tool ids. Never sum child counts — one tool in two
  subcategories would be counted twice, and a nav total could exceed the size
  of the directory. The product promise is trust; a wrong number breaks it.

## Behaviour

- Clicking a nav item navigates to its route. The sidebar's Sections block
  then lists that nav's sections.
- Scrolling the page moves the section highlight (IntersectionObserver
  scroll-spy); the same floating fill used for nav rows rests on the current
  section, so the sidebar always answers "where am I".
- Clicking a section scrolls to it (Lenis glides) and the URL carries the
  hash, so `/{nav}#{section}` is shareable and works across navigations.
- The Sections block renders only on nav routes. On tool pages, `/free`,
  auth and admin routes the sidebar shows Navigation plus footer links only.
- `/free` stays as a dedicated view; it links from the sidebar footer.

## Removed routes

`/explore`, `/categories` and `/categories/[slug]` are deleted. `next.config.ts`
carries permanent redirects: `/explore → /`, `/categories → /`, and each old
category slug → its section anchor (`/categories/deployment → /ship#deployment`).
The homepage `/` renders the default nav item (Build) directly; it is not a
redirect. Build has no `/build` route — `/` is its canonical URL.

## Important taxonomy rule

Do **not** make concepts such as these top-level navigation items:

- REST
- GraphQL
- APIs
- SDKs
- Webhooks
- React
- Next.js
- Node.js
- MongoDB
- PostgreSQL
- libraries
- frameworks

Those are better represented as:

- tool attributes
- technologies
- tags
- filters
- subcategories where appropriate

Example:

```text
Supabase

Primary categories:
- Databases
- Backend & APIs
- Authentication
- Storage & Media

Technologies:
- PostgreSQL
- JavaScript
- TypeScript

Features:
- Auth
- Database
- Storage
- Realtime
- APIs
```

---

# 6. Categories and sections

Three levels exist, and each has a different job:

```text
Nav item   Build                a route, a sidebar entry, a page
  Section  Agents & MCP         a heading on that page, a scroll-spy anchor
    Subcategory  ai-agents      the data plumbing: where tools are tagged
```

- **Nav items and sections** live in `src/config/nav.ts`. They are the
  information architecture the reader sees.
- **Categories and subcategories** live in MongoDB (seeded from
  `src/config/categories.ts`). They are how tools are tagged. Readers never
  navigate the raw category tree any more — `/categories` is gone.
- A section references a list of subcategory slugs. The mapping is a
  partition: every subcategory belongs to exactly one section, enforced by a
  test.

Example, Build:

```text
Build  (/)
├── Editors & IDEs      ides-editors, extensions-plugins, dev-containers,
│                       remote-development, whiteboards
├── Terminals           terminals
├── AI Coding           ai-coding-tools, ai-ides
├── Agents & MCP        ai-agents
├── Git & Code Review   git-clients, git-hosting, code-review
├── Code Search & Issues  code-search, issue-tracking
└── Testing & E2E       frontend-testing
```

The same tool can belong to multiple relevant sections.

Do not duplicate the underlying tool record — a section list is a query, not a
copy. A tool that qualifies for two sections on the same page appears in both
(consistent with how `/free` already lists a tool under "Free tier" and "Open
source"), and each section's count reflects only what that section shows.

---

# 7. Tool data model

The tool/product is the central entity.

Conceptually:

```ts
Tool {
  id
  name
  slug
  description

  websiteUrl
  logoUrl

  categories[]
  subcategories[]
  tags[]

  pricing
  openSource
  capabilities

  technologies[]
  integrations[]
  bestFor[]

  alternatives[]
  relatedTools[]

  organizationId

  status

  verification

  stats

  createdAt
  updatedAt
}
```

## Pricing

```ts
pricing: {
  type:
    "free" |
    "freemium" |
    "paid" |
    "open_source" |
    "free_trial" |
    "contact_sales" |
    "unknown",

  hasFreeTier: boolean | null,

  freeTier: {
    available: boolean | null,
    description: string | null,
    creditCardRequired: boolean | null,
    limits: [...]
  } | null,

  startingPrice: number | null,
  currency: string | null,
  billingPeriod: string | null
}
```

Unknown must remain `null`.

Never turn missing information into `false`.

---

# 8. Trust and verification

Trust is a major part of the product.

The directory should not pretend to know something that has not been checked.

## Rules

### Never invent data

Unknown:

```ts
null
```

Not:

```ts
false
```

The UI should show:

> Not verified

when information is unknown.

### Verification is never for sale

A company cannot pay to become verified.

### Ranking is never for sale

Sponsored placement cannot influence organic ranking.

### Inclusion is never for sale

A product can be listed without paying.

### Self-submitted information is not automatically verified

A vendor can submit information, but the information remains subject to review.

### Free trial is not free forever

A temporary trial must never be presented as a permanent free plan.

---

# 9. Verification states

Suggested model:

```ts
verification: {
  status:
    "unverified" |
    "needs_review" |
    "verified",

  lastVerifiedAt: Date | null,
  verifiedBy: ObjectId | null
}
```

A tool can be published while still being unverified.

The UI must clearly distinguish:

- verified
- not verified
- information supplied by vendor
- unknown

Verification means the relevant facts were checked against appropriate sources.

It does not mean the product itself is endorsed.

---

# 10. Vendor submission flow

Anyone with an account can submit a tool.

Basic flow:

```text
Create account
    ↓
Submit product URL
    ↓
AI analyzes public website
    ↓
Suggested information generated
    ↓
Submitter reviews/edits
    ↓
Submission enters review queue
    ↓
Admin reviews
    ↓
Tool is created/published
    ↓
Verification remains appropriate to actual verification state
```

Submission form:

```text
Product website
[ https://example.com ]

[Analyze Product]
```

AI can suggest:

- product name
- description
- category
- subcategory
- tags
- technologies
- features
- pricing
- free tier
- open-source status
- self-hosting
- API availability
- integrations
- alternatives

AI output is a suggestion, not the source of truth.

---

# 11. AI architecture

AI should reduce manual work without replacing verification.

Flow:

```text
URL
 ↓
Fetch accessible public content
 ↓
Extract useful page content
 ↓
LLM structured analysis
 ↓
Validate structured output
 ↓
Store analysis
 ↓
Show suggested fields to user/admin
 ↓
Human review
 ↓
Publish
```

AI analysis record:

```ts
AiAnalysis {
  id

  targetType:
    "submission" |
    "tool" |
    "comparison"

  targetId

  sourceUrl
  model

  status:
    "queued" |
    "processing" |
    "completed" |
    "failed"

  extractedData

  confidence

  sources[]

  rawResponse

  createdAt
  updatedAt
}
```

Use structured output with schema validation.

Do not allow arbitrary model output to directly modify production tool records.

---

# 12. Search

Search is one of the most important parts of erstuff.

A developer should be able to search:

```text
authentication
AI coding
database
hosting
email
monitoring
payment
React tools
```

Search should consider:

- tool name
- description
- categories
- subcategories
- tags
- technologies
- use cases
- features

Search results should remain organic.

Sponsored results must be retrieved separately.

---

# 13. Filters

Useful filters include:

### Pricing

- Free
- Freemium
- Paid
- Free trial

### Ownership / licensing

- Open source
- Commercial
- License

### Deployment

- Self-hosted
- Cloud
- On-premise

### Platform

- Web
- Mobile
- Desktop
- CLI

### Capabilities

- API
- OAuth
- SSO
- Webhooks
- SDK
- etc.

Filters should only appear when they are useful for the category.

Do not create hundreds of filter controls.

---

# 14. Tool detail page

A tool page should answer the developer's basic questions quickly.

Example structure:

```text
------------------------------------------------

Logo

Supabase

Backend platform for building applications.

[Visit Website]

Categories:
Databases · Backend & APIs · Authentication

------------------------------------------------

Pricing
Freemium

Free tier
Yes

Open source
Yes

Self-hosted
Yes

API
Yes

------------------------------------------------

Features

Database
Authentication
Storage
Realtime
...

------------------------------------------------

Technologies

PostgreSQL
JavaScript
TypeScript
...

------------------------------------------------

Alternatives

Firebase
Appwrite
Convex
...

------------------------------------------------

Related tools

...

------------------------------------------------

Verification

Last verified: ...

------------------------------------------------
```

The final visual styling is intentionally not prescribed here.

---

# 15. Alternatives

Alternatives are a major product feature.

Each useful tool should eventually have relevant alternatives.

Example:

```text
Cursor

Alternatives:
- Windsurf
- GitHub Copilot
- Claude Code
- Zed
- Cline
```

Alternative pages should eventually support SEO:

```text
/alternatives/cursor
/alternatives/clerk
/alternatives/supabase
```

The goal is to answer high-intent discovery questions.

Do not fabricate alternatives.

They should be curated or generated as suggestions and reviewed before being treated as authoritative.

---

# 16. Comparisons

Comparison pages are a later traffic and utility feature.

Examples:

```text
Cursor vs Windsurf
Clerk vs Auth0
Supabase vs Firebase
Vercel vs Netlify
```

Comparison data should be generated from structured tool data.

Do not create subjective "winner" scores unless there is a clearly defined, transparent methodology.

The comparison should present facts and meaningful differences.

---

# 17. Homepage

The homepage **is** the default navigation item (Build). It renders the same
content as any other nav page: header, sponsored rail, then every section in
order. There is no separate marketing landing page.

```text
/  =  Build

PageHeader
Sponsored rail (clearly labelled)
Editors & IDEs
Terminals
AI Coding
Agents & MCP
Git & Code Review
Code Search & Issues
Testing & E2E
```

The homepage must immediately communicate the directory itself, not a pitch.
Avoid unnecessary:

- giant gradients
- excessive animations
- fake statistics
- decorative illustrations
- huge testimonial sections
- excessive glass effects

---

# 18. Explore page (removed)

`/explore` no longer exists. Its two jobs moved:

- The full flat list is now the nav pages — one page per nav item, every
  section stacked, no pagination, no filters.
- The sponsored rail sits at the top of every nav page, above the first
  section.

`/explore` redirects permanently to `/`.

---

# 19. Categories page (removed)

`/categories` and `/categories/[slug]` no longer exist. Browsing happens
through the nav items: the sidebar's Navigation block picks the page, the
Sections block scrolls within it.

`/categories` redirects to `/`. Each old category slug redirects to the
section that now owns its subcategories, for example
`/categories/deployment → /ship#deployment`.

Category data still exists in MongoDB — it is how tools are tagged, and the
tool detail page still shows it — but no page renders the raw tree any more.
---

# 20. Free and open-source discovery

Useful dedicated discovery pages:

```text
/free
/open-source
/self-hosted
```

The `/free` page must distinguish:

- Free forever / free tier
- Free trial

A free trial must not be represented as permanently free.

---

# 21. Accounts

Browsing must remain public.

No login should be required to:

- search
- browse
- view tool pages
- view categories
- view alternatives
- view comparisons

Account is needed for user/vendor functionality.

Initial account features:

- Google authentication
- email/password fallback
- submit tools
- claim tools
- vendor dashboard
- analytics
- sponsorship management
- settings

---

# 22. Google authentication

Google OAuth is part of the initial product architecture.

Flow:

```text
Login
 ↓
Continue with Google
 ↓
Google OAuth
 ↓
Create or locate user
 ↓
Create session
 ↓
Redirect to intended page
```

Important:

- securely validate OAuth callback
- use secure sessions
- do not trust frontend identity data
- protect authenticated routes
- support sign out
- handle duplicate email/account linking safely

Email/password may remain available as a fallback.

Required account infrastructure before launch:

- email verification
- password reset
- secure password hashing
- auth rate limiting
- session invalidation
- basic abuse protection

---

# 23. Vendor organizations

Products should eventually belong to an organization rather than directly to a single user.

Model:

```ts
Organization {
  id
  name
  slug
  logo
  website

  ownerId

  members: [
    {
      userId
      role: "owner" | "admin" | "member"
    }
  ]

  createdAt
  updatedAt
}
```

Tool:

```ts
organizationId: ObjectId | null
```

This allows companies to have multiple people managing their listings.

---

# 24. Claim listing

A vendor should eventually be able to claim an existing listing.

Flow:

```text
Tool page
 ↓
Claim this tool
 ↓
Prove domain control
 ↓
Admin/system checks claim
 ↓
Organization gets management access
```

Important distinction:

> **Domain ownership proves ownership, not factual accuracy.**

Claiming a listing must not automatically mark every field as verified.

---

# 25. Vendor dashboard

Initial dashboard:

```text
/dashboard

Overview
Products
Analytics
Sponsorships
Submissions
Claims
Settings
```

Example:

```text
Your products

Acme AI
Published

Views: 4,821
Outbound clicks: 731

[Manage]
[Analytics]
[Sponsor]
```

Vendor analytics should only expose data related to the vendor's own products/campaigns.

---

# 26. Analytics

Use event-based analytics.

Initial events:

```ts
AnalyticsEvent {
  id

  event:
    "tool_view" |
    "outbound_click" |
    "sponsor_impression" |
    "sponsor_click" |
    "search" |
    "bookmark"

  toolId
  campaignId

  sessionId

  metadata: {
    source
    query
    page
  }

  createdAt
}
```

Do not collect unnecessary personal information.

Aggregate events for dashboards.

Initial vendor metrics:

- views
- outbound clicks
- CTR
- sponsorship impressions
- sponsorship clicks

---

# 27. Sponsorship model

The directory is free to browse.

The monetisation model is selling **attention**, not trust.

## Launch pricing

Start simple:

> **$5 / week**

Optional launch bundle:

> **4 weeks for $18**

Do not build a complicated tier system initially.

A sponsorship is a finite campaign, not an automatic subscription.

---

# 28. What can be sponsored

Sell:

> Clearly labelled sponsored placement.

Do not sell:

- ranking
- verification
- inclusion
- reviews
- user data
- permanent placement

A permanent slot is effectively a ranking position, so avoid it.

---

# 29. Sponsorship placement

Initial product:

```text
Explore Sponsor

$5 / week

- One labelled sponsored placement
- Relevant developer audience
- Product logo
- Product name
- Description
- Visit link
- Impressions
- Clicks
- CTR
```

Sponsored results are stored and queried separately.

Organic ranking must never read:

```ts
featured
sponsored
paid
```

A test should protect this rule.

---

# 30. Dodo Payments architecture

Dodo Payments should be integrated when there is a real sponsorship buyer, but the application should be designed for it from the start.

Flow:

```text
Vendor chooses sponsorship
        ↓
Create pending campaign
        ↓
Create Dodo checkout/payment
        ↓
User completes payment
        ↓
Dodo webhook reaches server
        ↓
Verify webhook/signature
        ↓
Find payment/campaign
        ↓
Mark payment paid
        ↓
Activate/schedule campaign
        ↓
Campaign expires automatically
```

Important:

**Never activate a sponsorship solely because the browser returned from checkout.**

The server-side payment/webhook state is authoritative.

Payment record:

```ts
Payment {
  id

  userId
  organizationId

  provider: "dodo"
  providerPaymentId

  type: "sponsorship"

  amount
  currency

  status:
    "pending" |
    "paid" |
    "failed" |
    "refunded"

  metadata: {
    campaignId
  }

  createdAt
  updatedAt
}
```

Campaign:

```ts
SponsorshipCampaign {
  id

  toolId
  organizationId

  placement: "explore_sponsored"

  startDate
  endDate

  price

  status:
    "pending_payment" |
    "scheduled" |
    "active" |
    "completed" |
    "cancelled"

  paymentId

  metrics: {
    impressions
    clicks
    ctr
  }

  createdAt
  updatedAt
}
```

Dodo integration should be isolated behind a payment service/module so the rest of the application does not depend directly on provider-specific logic.

---

# 31. Database choice

Use:

> **MongoDB Atlas + Mongoose**

for the initial product.

Why:

- tool data is document-oriented
- categories/tags/metadata evolve frequently
- nested pricing and verification data fit naturally
- submissions and AI analyses are naturally document-shaped
- fast iteration
- familiar TypeScript/Mongoose ecosystem
- Atlas Search can support initial search needs
- no need to introduce PostgreSQL purely for theoretical relational complexity

Use proper references for entities that need independent lifecycle:

- users
- organizations
- tools
- categories
- submissions
- claims
- campaigns
- payments
- analytics

Do not create an over-normalized database.

---

# 32. Database collections

Initial collections:

```text
users
organizations
tools

categories
tags

submissions
claims
verification_logs

ai_analyses

bookmarks
collections

comparisons

analytics_events

sponsorship_products
sponsorship_campaigns
payments

reports
```

Only create collections when the feature actually exists.

---

# 33. Recommended technology stack

## Frontend / application

- Next.js
- TypeScript
- App Router
- Tailwind CSS
- shadcn/ui
- No animation or smooth-scroll library; entrances are CSS and
  IntersectionObserver only

## Database

- MongoDB Atlas
- Mongoose

## Validation

- Zod

## Search

Start with:

> MongoDB Atlas Search

Do not introduce Elasticsearch at this stage.

## Authentication

- Google OAuth
- secure session-based authentication
- email/password fallback

## AI

- LLM API
- structured output
- Zod validation
- server-side execution

## Hosting

- Vercel for application
- MongoDB Atlas for database
- object storage such as Cloudflare R2 if assets eventually require dedicated storage

## Payments

- Dodo Payments

## Scheduled jobs

Start with:

- Vercel Cron or equivalent scheduled execution

Do not introduce a queue system until actual workload requires one.

---

# 34. Architecture

Use a:

> **Modular monolith**

Structure conceptually:

```text
Next.js App
│
├── Public discovery
│
├── Authentication
│
├── Vendor dashboard
│
├── Admin
│
├── Tool APIs
│
├── Search
│
├── AI module
│
├── Verification module
│
├── Analytics module
│
└── Payments module
        │
        ├── Dodo
        └── Webhooks

MongoDB Atlas
```

Do not start with microservices.

---

# 35. Security

Before launch:

- secure password hashing
- Google OAuth validation
- secure sessions
- CSRF protection where applicable
- authentication rate limiting
- submission abuse limits
- server-side authorization
- ownership checks
- admin authorization
- webhook signature validation
- payment state validation
- input validation with Zod
- URL validation
- safe external URL handling
- output escaping
- audit logs for sensitive admin actions

Never trust:

- client-side role
- client-side payment state
- client-side organization ID
- client-side ownership
- AI output

---

# 36. Admin system

The admin system should be workflow-focused rather than a giant CMS.

Initial areas:

```text
/admin
/admin/submissions
/admin/tools
/admin/claims
/admin/verification
/admin/sponsors
/admin/payments
/admin/ai
/admin/reports
```

Admin should be able to:

- review submissions
- inspect AI analysis
- inspect sources
- edit tool fields
- approve/reject submissions
- verify facts
- review claims
- manage sponsorships
- view payment state
- handle reports

Do not build a giant CMS before the workflows require it.

---

# 37. Submission review

Submission:

```text
draft
 ↓
submitted
 ↓
under_review
 ↓
approved / rejected
```

Approval should:

- create/update the tool
- capture reviewed fields
- preserve submission history
- set verification according to actual verification work
- never automatically mark everything verified

Keep an audit trail.

---

# 38. UI / UX product structure

This document does **not** dictate the final visual design.

The implementation should be designed around clarity and discovery.

## Primary navigation

The sidebar has two blocks (see §5):

```text
Navigation          Build · Components · Frontend · Backend · Data · Ship · AI
Sections            the selected nav item's sections, scroll-spy highlighted

Footer              Free · Sponsors · account · Submit · Collapse
```

The toolbar keeps search (palette), the account menu and the mobile hamburger.
Routes: `/` (Build) plus `/components`, `/frontend`, `/backend`, `/data`,
`/ship`, `/ai`, then `/free`, `/tools/[slug]`, `/search`, `/signup`,
`/signin`, `/account`, `/submit`, `/admin/reviews`, `/sponsors`.

## Public experience

The user should be able to reach a useful tool in as few actions as possible.

Core loop:

```text
Search
→ Filter
→ Tool
→ Understand
→ Compare / Alternatives
→ Visit
```

## Mobile

The current product already uses a mobile drawer.

Keep:

- scroll locking
- Escape handling
- backdrop
- focus handling
- accessible navigation
- touch-friendly controls

---

# 39. UI design principles

The UI should feel like a serious developer product.

Prefer:

- strong typography
- clear hierarchy
- compact information density
- subtle borders
- restrained color
- good whitespace
- readable metadata
- obvious search
- clear category navigation
- fast scanning

Section dividers are dashed hairlines: a solid rule between two blocks of equal
weight reads as a table cell, and the index is not a table. Tags render as
small labels with a dot. The palette is neutral with one accent: burgundy on
neutral surfaces, deep wine on light and a lightened rose on dark, plus
destructive red, which never moves. The primary button fills with the accent,
links, counts and icons take it straight, and `free` is a burgundy dot plus a
word. Row hovers and every surface stay gray — the accent marks state, it does
not decorate. Headings are sentence case. Entrance
motion is a short fade-and-rise with a blur, staggered down a list on first
paint only; reading is never gated behind scroll animation, and everything
stays off under prefers-reduced-motion.

Avoid:

- excessive gradients
- excessive glassmorphism
- giant cards
- excessive shadows
- excessive rounded containers
- decorative illustrations everywhere
- noisy animations
- unnecessary pill-shaped filters
- generic SaaS landing-page patterns

Animation should support interaction, not decorate every section.

---

# 40. Homepage information architecture

The homepage is the default nav page (Build). Its structure is the shared
nav-page structure, defined once:

```text
PageHeader
  eyebrow, count in brand, title, description

SponsoredRail          (only when a campaign is active, labelled)

IndexGroup × N         one per section, in config order
  count + title + description
  tool rows
```

Section anchors carry `id` and `data-section`; the sidebar scroll-spy watches
them. Every nav page uses this same structure — there is exactly one page
template for browsing.

The final visual design is implementation work, not part of this plan.

---

# 41. Explore information architecture (removed)

`/explore` is gone; see §18. Its sponsored rail and flat result rows live on
the nav pages now. Result row metadata is unchanged:

```text
Tool name
Short description
Pricing badge
Free tier
Open source
Self hosted
Relevant tags
```

Keep result rows scannable — one line per tool.

---

# 42. Nav page information architecture

Every nav page renders identically — header, sponsored rail, then all
sections stacked:

```text
AI                              (PageHeader: count, title, description)

LLM APIs & Models               12
OpenAI, Anthropic, ...
...

RAG & Embeddings                7
...
```

Sidebar beside it:

```text
Navigation
  AI                ← current page, glide box resting
Sections
  LLM APIs & Models ← glide box follows the scroll position
  RAG & Embeddings
  ...
```

The sidebar Sections block and the page sections are two views of the same
config: `src/config/nav.ts` drives both, so they can never disagree.

---

# 43. Tool card

A tool card should communicate the minimum useful facts.

Example:

```text
Logo
Tool name
One-line description

Category
Pricing

Free tier
Open source
Self hosted

→ View tool
```

Do not put every possible field on the card.

---

# 44. Vendor experience

Vendor journey:

```text
Submit
 ↓
AI analysis
 ↓
Review suggested data
 ↓
Admin review
 ↓
Published
 ↓
Claim
 ↓
Analytics
 ↓
Optional sponsorship
```

The vendor experience should not feel like the primary product.

Developers are the primary audience.

---

# 45. SEO

SEO is important because tool discovery has strong search intent.

Potential pages:

```text
/tools/[slug]
/                       (Build — the default nav page)
/components
/frontend
/backend
/data
/ship
/ai
/alternatives/[slug]
/compare/[slug]
/free
/open-source
/self-hosted
```

Each indexable page should have:

- unique title
- useful description
- structured data where appropriate
- canonical URL
- meaningful content
- internal links
- sitemap
- robots configuration

Do not generate thousands of empty pages.

A page should exist when it provides genuine value.

---

# 46. Structured data / metadata

For tool pages, consider structured metadata appropriate to the actual content.

Do not abuse schema markup.

OpenGraph:

- tool name
- description
- logo
- category

Dynamic metadata should be generated server-side.

---

# 47. Analytics philosophy

Track product usage needed to improve the product.

Important metrics:

### Developer side

- searches
- tool views
- outbound clicks
- category views
- alternative page views
- comparison views
- saves

### Vendor side

- listing views
- outbound clicks
- sponsorship impressions
- sponsorship clicks
- CTR

Do not turn analytics into surveillance.

---

# 48. Business model

The directory remains free.

Revenue sources:

1. Sponsored placement
2. Affiliate links where appropriate
3. Potential future commercial vendor features

Do not introduce paid access to basic discovery.

---

# 49. Affiliate links

Affiliate links can exist when relevant.

Rules:

- disclose them
- never change organic ranking because of affiliate revenue
- never change a product's facts
- never change listed pricing
- never hide alternatives because one has an affiliate relationship

Affiliate revenue must never compromise trust.

---

# 50. What we refuse to sell

Never sell:

- verification
- organic ranking
- inclusion
- reviews
- user data
- permanent ranking positions

This is a core product principle.

---

# 51. Launch strategy

Do not launch with thousands of poorly researched tools.

Launch with a smaller useful dataset.

Priority:

1. Good categories
2. Useful tools
3. Accurate fields
4. Strong search
5. Good tool pages
6. Alternatives
7. SEO pages
8. Vendor submission
9. Analytics
10. Sponsorship

Quality matters more than raw listing count.

---

# 52. Current product state

Existing application state should be checked against the running application rather than assumed from this document.

Known existing functionality:

- categories
- seeded tools
- explore
- free page
- category tree
- tool detail pages
- search
- JSON endpoints
- keyboard command/search palette
- light/dark themes
- mobile navigation
- account creation
- sign in
- sign out
- account page
- Google auth wiring
- authenticated submissions
- admin review queue
- submission notes
- pending submission limits
- labelled sponsored slot
- sponsorship disclosure page

Known limitations should be updated whenever implementation changes.

---

# 53. Required quality checks

Keep automated checks for:

```text
npm run verify
npm run check:auth
npm run check:mobile
npm run audit:orphans
```

The exact test counts should not be hard-coded into this plan unless they are actively maintained.

Important regression tests:

- organic ranking never uses sponsorship fields
- sponsored results are separately queried
- unpublished submissions do not appear publicly
- users cannot edit another vendor's tools
- vendors cannot access another vendor's analytics
- admin-only actions are protected
- unknown fields render as unknown/not verified
- payment activation requires server-confirmed payment
- OAuth identity is validated
- mobile drawer remains accessible

---

# 54. Implementation phases

## Phase 1 - Foundation and trust

- Verify initial tools
- Clean categories
- Fix unknown/null semantics
- Finish auth
- Add email verification
- Add password reset
- Add rate limiting
- Add legal pages
- Add sitemap
- Add robots
- Add basic analytics

This makes the public product trustworthy.

---

## Phase 2 - Discovery engine and inventory

- **Grow the inventory**: 48 → 250+ tools. Collect sources, batch entries,
  keep the never-invent-data rule (§8) — unknown stays `null`, and nothing is
  published without going through the seed/submission workflow. This is the
  "dictionary" ambition; it is deliberately a separate phase from the
  navigation rework, which ships first.
- Improve search
- Improve nav pages (the §42 structure)
- Improve filters
- Improve tool pages
- Add alternatives
- Add related tools
- Add SEO metadata
- Add `/open-source`
- Add `/self-hosted`

Goal:

> A developer can find a useful tool quickly.

---

## Phase 3 - Comparison

Build:

```text
/alternatives/[slug]
/compare/[tools]
```

Use structured facts.

Goal:

> Help developers decide between tools.

---

## Phase 4 - Vendor system

- Vendor dashboard
- Product management
- Vendor analytics
- Claim listing
- Organization support
- Submission history

Goal:

> Turn listings into a useful vendor relationship.

---

## Phase 5 - AI submission engine

- URL ingestion
- content extraction
- LLM analysis
- structured output
- confidence
- source capture
- user review
- admin review
- audit history

Goal:

> Make adding new tools scalable without sacrificing trust.

---

## Phase 6 - Sponsorship

Only after there is meaningful traffic and a real buyer.

Build:

- sponsorship product
- campaign creation
- Dodo checkout
- payment record
- webhook
- activation
- scheduling
- expiration
- impressions
- clicks
- vendor campaign analytics

Launch:

> $5/week

Optional:

> $18 / 4 weeks

---

## Phase 7 - Scale discovery

Only after actual usage shows the need.

Potential future features:

- saved collections
- bookmarks
- personalized discovery
- tool recommendations
- richer comparisons
- category-specific discovery
- trending tools
- developer stacks
- utilities
- more advanced search

Do not build these simply because they sound useful.

---

# 55. Future utilities

Utilities can eventually include:

- JSON formatter
- JWT decoder
- regex tester
- cron generator
- UUID generator
- Base64 encoder/decoder
- URL encoder/decoder
- timestamp converter
- color tools
- SQL formatter
- API utilities

These are useful but are **not the core product**.

Build them after the discovery engine works.

---

# 56. Future stack builder

A future feature could let a developer construct a stack:

```text
Frontend
Next.js

Backend
Node.js

Database
PostgreSQL

Auth
Clerk

Hosting
Vercel

Payments
Stripe
```

Then erstuff can show the tools associated with the stack.

This is a discovery feature, not the initial product.

---

# 57. Things explicitly not to build early

Do not introduce:

- microservices
- Kubernetes
- Kafka
- Elasticsearch
- Redis
- BullMQ
- complex event infrastructure
- giant admin CMS
- social feeds
- reviews
- voting
- login-gated browsing
- paid verification
- paid ranking
- paid inclusion
- complicated sponsorship tiers
- unnecessary personalization
- massive AI infrastructure

Build the simplest system that proves the product.

---

# 58. Product success metric

The most important question:

> **Can a developer arrive with a need and find a useful tool within about 30 seconds?**

Secondary metrics:

- search-to-tool click
- tool-to-outbound click
- alternative usage
- comparison usage
- repeat visitors
- submissions
- claimed listings
- vendor analytics usage
- sponsorship conversion

Do not optimize for listing count alone.

---

# 59. Core product loop

Developer:

```text
Need
 ↓
Search
 ↓
Browse
 ↓
Filter
 ↓
Tool
 ↓
Understand
 ↓
Compare
 ↓
Alternative
 ↓
Visit
```

Vendor:

```text
Tool exists
 ↓
Submit
 ↓
AI analysis
 ↓
Review
 ↓
Publish
 ↓
Claim
 ↓
Analytics
 ↓
Sponsor
 ↓
Campaign analytics
```

---

# 60. Final product definition

erstuff is:

> **A discovery platform for developer tools and software.**

It solves:

> **Developers currently have to search many different places to discover and evaluate tools. erstuff brings those tools into one organized, searchable place with useful structured information.**

The core product is:

```text
TOOLS
  ↓
CATEGORIES
  ↓
SEARCH
  ↓
FILTERS
  ↓
TOOL PAGES
  ↓
ALTERNATIVES
  ↓
COMPARISONS
  ↓
VISIT
```

The supporting system is:

```text
VENDORS
  ↓
SUBMIT
  ↓
AI
  ↓
REVIEW
  ↓
VERIFY
  ↓
ANALYTICS
  ↓
SPONSOR
```

The business principle is:

> **Sell attention, never trust.**

The product principle is:

> **Help developers find the right software faster.**

The technical principle is:

> **Start as a simple modular monolith and add complexity only when real usage requires it.**

The quality principle is:

> **Never invent data. Unknown is better than wrong.**
