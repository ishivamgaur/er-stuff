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

# 5. Core navigation taxonomy

The navigation should answer:

> **"Where should I look for the kind of tool I need?"**

The taxonomy does not need to perfectly describe software engineering.

It only needs to make tool discovery easy.

Initial top-level categories:

1. Design
2. Development
3. AI
4. Databases
5. Backend & APIs
6. Authentication
7. Cloud & Hosting
8. DevOps
9. Security
10. Testing
11. Monitoring & Analytics
12. Payments
13. Email & Messaging
14. Storage & Media
15. Search
16. Collaboration
17. Project Management
18. Documentation
19. Developer Utilities
20. Mobile
21. Open Source
22. Templates & Components

This list can evolve based on actual inventory and search behavior.

## Important taxonomy rule

Do **not** make concepts such as these primary navigation categories:

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

Each category can contain smaller sections.

Example:

## Design

- UI / UX
- Prototyping
- Design Systems
- Wireframing
- Design Collaboration
- Motion & Animation
- 3D
- Design Inspiration

## Development

- Code Editors
- IDEs
- AI Coding
- Terminal & CLI
- Browser Tools
- Code Search
- Developer Utilities
- Extensions

## AI

- AI Assistants
- AI Coding
- AI APIs
- AI Agents
- AI Search
- AI Image
- AI Video
- AI Audio
- AI Infrastructure

## Databases

- SQL
- NoSQL
- Vector Databases
- Database Hosting
- Database Management
- Caching

## Cloud & Hosting

- Cloud Platforms
- App Hosting
- VPS
- Serverless
- Static Hosting
- Edge Platforms
- Deployment Platforms

## DevOps

- CI/CD
- Containers
- Infrastructure
- Server Management
- Secrets
- Deployment
- Infrastructure as Code

The same tool can belong to multiple relevant categories.

Do not duplicate the underlying tool record.

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

The homepage should immediately communicate:

> Find the tools you need to build software.

Core structure:

```text
Header

Hero
"Discover the tools you need to build software."

Search

Popular searches

Popular categories

Popular tools

Recently added tools

Useful collections / discovery sections

Optional clearly-labelled sponsored placement

Footer
```

The homepage is a discovery entry point, not a marketing-heavy SaaS landing page.

Avoid unnecessary:

- giant gradients
- excessive animations
- fake statistics
- decorative illustrations
- huge testimonial sections
- excessive glass effects

---

# 18. Explore page

The explore page is the main directory experience.

Conceptually:

```text
Explore developer tools

[ Search tools... ]

Filters                         Results

Category                       Sponsored
Pricing                        ----------------
Open source                    Tool
Self hosted                    Description
API available                  Visit
                                ----------------

                               Organic tools
                               ----------------
                               Tool
                               Tool
                               Tool
                               Tool
```

Sponsored content must be clearly labelled and visually separated from organic results.

---

# 19. Categories page

Categories should provide a simple way to browse the entire directory.

Example:

```text
Categories

Design
120 tools

Development
340 tools

AI
280 tools

Databases
90 tools

Cloud & Hosting
160 tools

...
```

Category pages:

```text
/categories/ai
/categories/databases
/categories/design
```

Each category page can contain:

- description
- popular sections
- featured organic tools
- newest tools
- filters
- search within category

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
- Framer Motion where useful

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

Possible:

```text
erstuff

Explore
Categories
Alternatives
Compare
Utilities

Search

Submit a Tool
Login
```

Authenticated:

```text
Dashboard
```

The exact navigation can be simplified after implementation.

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

Avoid:

- excessive gradients
- excessive glassmorphism
- giant cards
- excessive shadows
- excessive rounded containers
- decorative illustrations everywhere
- noisy animations
- unnecessary pill-shaped filters
- dashed borders
- generic SaaS landing-page patterns

Animation should support interaction, not decorate every section.

---

# 40. Homepage information architecture

The homepage should roughly contain:

```text
Header

Hero
  "Discover the tools you need to build software."

Search

Popular searches

Categories

Popular tools

Recently added

Useful discovery sections

Optional sponsored placement

Footer
```

The final visual design is implementation work, not part of this plan.

---

# 41. Explore information architecture

```text
Explore

Search

Filters

Results

Sponsored section
    ↓
Organic results
```

Potential result metadata:

```text
Tool name
Short description
Category
Pricing
Free tier
Open source
Self hosted
Relevant tags
```

Keep result cards scannable.

---

# 42. Category information architecture

Category page:

```text
Category title
Description

Popular sections

Popular tools

Newest tools

Filters

All tools
```

Example:

```text
AI

AI tools for developers.

AI Coding
AI APIs
AI Agents
AI Search
AI Image
AI Video

Popular tools
...
```

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
/categories/[slug]
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

## Phase 2 - Discovery engine

- Improve search
- Improve category pages
- Improve filters
- Improve tool pages
- Add alternatives
- Add related tools
- Add SEO metadata
- Add `/free`
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
