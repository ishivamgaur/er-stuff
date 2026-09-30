# erstuff

Developer tool index. Free to browse, no account required.

This file is the accumulated context for the project. Read it before making
changes. It records decisions, why they were made, and the traps already hit,
so the same mistakes are not repeated.

`erstuff-full-plan.md` at the repo root is the plan and the file to edit. Read
it first. `AGENTS.md` is how the code works, the full plan is where we are
going. There is deliberately only one plan, because two of them drift.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

## 1. What the product is

A verified index of developer tools. The value is not the number of listings, it
is the structured detail: real pricing, free tier limits, licence, self hosting
alternatives, and a clear statement when a field is unknown.

Hard rule, inherited from the original plan: **never invent data.** Unknown is
`null` and renders as "not verified". A tool's unknown self-hosting status must
never render as "no", because that is a claim we have no basis for.

The product promise is trust. Anything that makes the site look busier at the
cost of accuracy is a regression, even if it is a small one.

## 2. Stack

- Next.js 16, App Router, Turbopack, React 19
- TypeScript strict, with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `verbatimModuleSyntax`, `noImplicitOverride`, `noUnusedLocals`
- Tailwind CSS v4
- MongoDB via Mongoose 8
- Zod v4 as the schema source of truth
- Vitest, ESLint flat config, Prettier
- Local MongoDB, not Atlas, for development

## 3. Local setup

MongoDB runs as a Windows service on `127.0.0.1:27017`.

```
npm install
npm run db:seed:categories
npm run db:seed:tools
npm run dev
```

Required env vars are in `.env.example`. `.env.local` is gitignored and holds
local values.

`MONGODB_URI` points at `mongodb://127.0.0.1:27017/erstuff`.

## 4. Scripts

| Script | Purpose |
|---|---|
| `dev` | dev server |
| `verify` | typecheck, lint, format check, test, build. Run before every commit. |
| `db:seed:categories` | seeds the 10 categories and ~111 sections from config |
| `db:seed:tools` | upserts tool seed data |
| `db:capture-previews` | visits every tool site, saves a screenshot and favicon |
| `check:mobile` | Playwright assertions for the drawer, overflow, focus and scroll lock |
| `audit:orphans` | reachability graph from the Next entry points, lists unreachable modules |
| `check:auth` | Playwright assertions for signup, session, submission, guards, signout |
| `db:promote` | grants the admin role to one account, the only way in |
| `db:sponsored` | flag or unflag one tool as sponsored, for exercising the rail |

## 5. Traps already hit. Read before writing code.

### 5.1 Never put `mongoose.model<T>()` inside a generic function

This crashed `tsc` with an out of memory error, repeatedly, taking over four
minutes per run before dying. The generic helper instantiates mongoose's
enormous `Model<T>` once per model and the compiler runs out of heap.

```ts
// NEVER. Kills the compiler.
const defineModel = <T>(name: string, schema: Schema): Model<T> => {
  return mongoose.model<T>(name, schema)
}
```

Use the per file literal pattern instead. Literal keys, no generic wrapper:

```ts
export const ToolModel: Model<ToolDocument> =
  (mongoose.models.Tool as Model<ToolDocument> | undefined) ??
  mongoose.model<ToolDocument>("Tool", toolSchema)
```

Symptom to recognise: typecheck hangs, then `FATAL ERROR: Ineffective
mark-compacts near heap limit`. It is not the schema, and it is not the mongoose
version. Downgrading mongoose does not fix it.

### 5.2 BSON ObjectId cannot cross the server/client boundary

`ToolDocument._id` is typed `Types.ObjectId`, which is accurate. Mongoose
`.lean()` returns real ObjectIds, and ObjectId has a `toJSON` method, so
React refuses to serialise it into a Client Component.

The symptom is a silent console error on every row, visible only as an "N
Issues" badge in the dev overlay, while HTTP still returns 200:

```
Only plain objects can be passed to Client Components from Server Components.
```

Fix: `src/lib/db/plain-tool.ts` converts at the repository boundary. Route
handlers never hand a raw lean document to a client component.

### 5.3 Count rollups double count

A tool in two subcategories of one parent was counted twice, so the sidebar said
10 Database tools while the page correctly said 6. Then the categories page
claimed 168 tools when there were 48.

`src/lib/db/categories.ts` walks the materialised path and dedupes with a
`Set<string>` of tool ids per ancestor. Any count that sums children must
dedupe. Verify counts against a real page header, not just each other.

### 5.4 The config file and the database drift

Category descriptions live in both `src/config/categories.ts` and MongoDB. Editing
the config alone changes nothing the user sees, because the category page reads
from the database. This already happened once. After changing config content,
run the sync script or re-seed.

Decision still open: the database should be the source of truth for content,
with config only seeding, so there is exactly one place to edit.

### 5.5 `useSyncExternalStore` and the storage event

The `storage` event only fires in other tabs. A theme toggle subscribing only to
it changes the DOM without re-rendering, so the icon does not update. It needs a
local custom event as well. See `src/components/layout/theme-toggle.tsx`.

### 5.6 Favicons must be sniffed, not assumed

Saving every favicon as `.ico` produced 27 mislabelled files out of 47. An SVG
named `.ico` is served with the wrong MIME type and renders as a broken image.
`scripts/capture-previews.ts` sniffs magic bytes to pick the real extension.
`scripts/sync-logos.ts` reconciles the database against what is on disk.

### 5.7 Next 16 renamed middleware to proxy

`src/proxy.ts`, not `src/middleware.ts`. Exports a function named `proxy`.
Read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`
if the behaviour needs changing.

### 5.8 No setState synchronously in an effect

ESLint enforces this. Use the render phase adjustment pattern instead:

```ts
const [value, setValue] = useState(prop)
const [synced, setSynced] = useState(prop)
if (prop !== synced) {
  setSynced(prop)
  setValue(prop)
}
```

### 5.9 Shell escaping when writing scripts through bash

Nested template literals inside `node -e` get mangled by the shell. Write the
script to a file with the write tool, then run it with `npx tsx`.

Two consequences: do not do multi-line find and replace through `node -e`, use
the edit tool instead. And a script outside the project has no `type: module`,
so top level await fails, so throwaway scripts must live inside the project.

### 5.10 Tailwind v4 silently drops unknown theme tokens

`bg-canvas` is not a token in this design system. Tailwind v4 does not error, it
simply does not generate the utility, so the element renders with no background
at all. No build error, no lint error, no test failure. Only a screenshot shows
it.

Three of these were live in the codebase and none were caught by any existing
check:

- `bg-canvas` on the mobile drawer, which rendered a fully transparent drawer
- `text-ink-subtle` and `text-ink-muted` in `verified-state.tsx`, real tokens
  are `ink-2`, `ink-3`, `ink-4`
- `bg-surface-raised` in the command palette, the nearest real token is `field`

`src/test/theme-tokens.test.ts` now walks every string literal in `src` and
fails on any colour utility whose `--color-*` token is not defined in
`globals.css`. It has been confirmed to fail when `bg-canvas` is reintroduced.
When adding a colour, add the token to `globals.css` first. The allowlist of
Tailwind built-ins in that test is deliberate, do not delete entries to make it
pass, add the real token instead.

### 5.11 `backdrop-filter` on an ancestor traps `position: fixed`

The mobile drawer was rendered inside the toolbar, which has `backdrop-blur-sm`.
Any `backdrop-filter`, `transform`, `filter`, or `will-change` on an ancestor
makes that ancestor the containing block for `position: fixed` descendants. The
`fixed inset-0` drawer was therefore sized to the 3.5rem toolbar strip, not the
viewport, and the whole thing appeared broken.

Symptom to recognise: a full screen overlay that only covers a small strip near
the top. The fix is `createPortal(node, document.body)`, never nesting a
viewport sized overlay inside a blurred or transformed ancestor.

Portal to `document.body` does not need a mounted guard. The drawer only
renders after a click, which is always client side, so a `useEffect` mount flag
is both unnecessary and an ESLint violation under 5.8.

### 5.12 `"use server"` must be the first line of the file

A server action module without the directive at the very top compiles, passes
lint and typecheck, then fails at runtime the moment a page passes the function
to a Client Component:

```
Functions cannot be passed directly to Client Components unless you explicitly
expose it by marking it with "use server".
```

An inline `action={() => ...}` inside a `"use server"` file works, which is why
this slipped through. Put the directive on line one of every `actions.ts`.

### 5.13 `auth.api.*` inside a server action drops its session cookie

Sign up appeared to work and left the user signed out. `auth.api.signInEmail`
returns `Set-Cookie` on a response object that a server action discards, so the
redirect lands on an authenticated URL with no cookie. Sign out had the mirror
fault, the cookie was never cleared and the session survived the refresh.

Call credentials through `authClient` from a client component instead. See D24.
There is a trap test, `npm run check:auth`, that covers sign up, session,
submission, route guards and sign out.

### 5.14 A scrim needs its own token, not a page colour at low alpha

`bg-page/70` is white at 70 percent in light mode, so the scrim behind the
drawer was invisible and the underlying page read as part of the panel. Use
`--overlay`, `rgb(11 11 11 / 0.34)` in light and `rgb(0 0 0 / 0.62)` in dark.

### 5.15 A `hidden` class needs its responsive twin on the same element

Rewriting the rail class list by hand dropped `lg:flex` while keeping
`hidden`, so the sidebar rendered at `display:none` on every width. The page
still looked plausible because the column was still reserved, and the DOM
assertions passed because the element existed. Only a screenshot showed it.

When a component is hidden below a breakpoint, the same class string must carry
the breakpoint that shows it again.

### 5.16 Copy that contradicts behaviour

The sign up form labelled the name field "Optional" while `Field` hard coded
`required`, so the browser silently refused to submit an empty form and the
submit event never fired. Nothing in the console. Any label claiming a field is
optional must have `required={false}` in the same file.

## 6. Design system

The interface reads like technical documentation because a directory of mostly
unknown fields benefits from a reader telling a heading from a value before
reading a word. It is a principle, not a costume.

- **Do not render literal markdown markers.** An earlier pass put `#`, `##` and
  ``` fences into the UI. It was tried and reverted, it read as a document
  rather than a product. Structure comes from spacing, one hairline and weight.
- `src/components/icons/index.tsx` is the only icon set. One 16 unit grid, one
  1.5 stroke, `currentColor` only, `aria-hidden` because every icon has a text
  label beside it. Do not add an icon library and do not hand roll a second SVG
  inline in a component.
- `DetailList` in `components/tools/detail-panel.tsx` is the facts list. Field
  names are real camelCase, for example `pricing.freeTier`, so the page matches
  the shape of the data.
- Tags and prices keep the `[bracketed]` treatment. Pills were tried and looked
  foreign. This is not a markdown marker, it is the directory's own label style.
- Never make a field look filled in when it is unknown. The directory is 48
  tools and most capability fields are still `null`.

Two references, merged deliberately.

From designeeeer.xyz: the narrow frame, the one line per tool index, the
floating hover preview, the counts that lead every heading.

From quantinium.dev: monospace throughout, the `├──` file tree with
`[bracketed]` labels, the `>_` prompt with a blinking cursor, binary weight,
opacity based secondary text.

### Tokens

Defined in `src/app/globals.css` as CSS variables, referenced through
`@theme inline` so a single swap repaints the whole app.

```
page       #000000 dark   #fbfbfa light
surface    #0a0a0a        #ffffff
field      #141414         #eeeeec
line       #242424         #dededa
line-strong#3d3d3d         #b9b9b3
ink        #ffffff         #0b0b0b
ink-2      #b8b8bd         #45453f
ink-3      #8c8c93         #6b6b64
ink-4      #6e6e75         #83837b
accent     #2f9bff         #0b6bcb
```

Muted greys are at or above 4.5:1 on both backgrounds. Do not reintroduce
low `opacity-50` or `opacity-70` on text. It was tried and it failed contrast.

Type scale: `text-micro` 11px, `text-small` 12px, `text-body` 13px,
`text-lead` 15px. All monospace (Geist Mono). Geist Pixel for the wordmark.

### Rules

- Only one accent colour, used for the wordmark, active nav, links and the
  primary button.
- The sponsored card is the only element with a background fill.
- Tags, prices and category names render as `[bracketed]`, not pills. Pills were
  tried on subcategories and tags and they looked foreign to the design.
- Section rules are solid `border-line`, not dashed. Dashed was inherited from
  designeeeer and reverted.
- Every page header uses the same `PageHeader` primitive: count, then bold
  title with its `#`, then muted description.
- Every list uses `IndexGroup` and `IndexList`.
- Every filter uses `FilterGroup` and `FilterToggle`.
- Decorative `01` section numbering was removed, it read as a markdown heading.
  Real counts stay, they are information.

### Interactions

- Row hover dims siblings to `opacity-[0.42]`. Do not go much darker, the list
  stops being scannable.
- The hover preview follows `clientY`, clamps to the list bounds and the
  viewport with a 16px margin, and has a 20px blurred halo from the current
  theme background.
- The preview is `pointer-events-none` and hidden below `lg`.
- Palette opens on Ctrl/Cmd+K, 30rem wide, no backdrop blur, 150ms fade and
  scale.

### Responsive

- Frame is a single `max-w-6xl`. Do not cap `main` a second time, a nested max
  width leaves the content floating in the middle of its own column.
- The rail is 15rem, collapses to 3.5rem on a toggle, and remembers that in
  localStorage. Below `lg` it is a drawer instead. Do not derive collapse from a
  media query, that resets the preference on every reload.
- Only `sm:` and `lg:` are used. The design has no other breakpoints.
- Smooth scrolling is Lenis, mounted once in the root layout. `syncTouch` stays
  off because hijacking touch scroll breaks momentum, and it is skipped entirely
  for `prefers-reduced-motion`.
- Mobile navigation is a left drawer opened from a hamburger in the toolbar,
  rendered through a portal to `document.body`. The desktop rail is hidden below
  `lg`. There is no collapsible accordion, it was tried and it displaced content.
- The drawer locks body scroll, closes on Escape, on backdrop click and on
  navigation, moves focus in on open and returns it to the trigger on close.
- The pricing badge moves onto the name line below `sm`, so the description gets
  the full row width instead of being squeezed beside a fixed badge column.
- Row logo is `items-start` on mobile, `items-center` from `sm:`.
- `scrollbar-gutter: stable` on the root so nothing shifts when a scrollbar
  appears. Scrollbar is 4px, transparent track, thumb in `line`.

## 7. Data model

Zod schemas in `src/schemas/` are the source of truth. Mongoose models in
`src/models/` mirror them. Types come from `z.infer`.

- `tool.ts` holds the pricing, capability and verification shapes
- Capabilities are `boolean | null`, never `boolean`
- Categories use a materialised path, `database.orm`, so ancestor queries are a
  prefix match
- A tool references leaf categories in one `categoryIds` field. There is no
  separate `subcategories` field, that allowed invalid states.
- `alternatives` is stored one directionally and the reverse is derived
- `verification.lastCheckedAt` may be written by the link checker.
  `verification.lastVerifiedAt` is human only. Never let automation write it.
- Compound indexes per `docs/decisions.md` D9

## 8. Pages

| Route | Purpose |
|---|---|
| `/` | 307 redirect to `/explore` |
| `/explore` | the whole directory, one page, no pagination, no filters. Sponsors rail sits above the organic list. |
| `/free` | four sections: free forever, free tier, open source, self hostable |
| `/categories` | full tree, 10 categories and 111 sections with counts |
| `/categories/[slug]` | one category, sections as tree nav |
| `/tools/[slug]` | detail, details list, tags, alternatives, related, verification |
| `/search` | search results |
| `/signup`, `/signin`, `/account` | credentials, via Better Auth |
| `/submit` | list your own product, account holders only |
| `/admin/reviews` | moderation queue for submissions |
| `/sponsors` | disclosure, what money does not buy, and how to sponsor |
| `/api/search`, `/api/search/autocomplete` | search JSON |

## 9. Search

`SearchProvider` interface in `src/lib/search/`, with `FallbackSearchProvider`
in use. Scoring is weighted by field, name 12, technologies and tags 5, bestFor
and categories 4, description and integrations 2, with prefix matches at half
weight and a bonus for a leading token.

`SEARCH_PROVIDER=atlas` throws deliberately rather than silently pretending.
Atlas Search is not wired up.

The fallback loads all published tools into memory with a 30 second cache. Fine
at this size, not at 50k tools.

## 10. Assets

Screenshots and favicons are captured by our own Playwright run, not a third
party favicon service. The reference uses Google's proxy, which leaks every
visitor to Google and breaks when a site changes its icon.

`public/previews` and `public/favicons` are committed. 48 screenshots, 47
favicons. One tool, Fly.io, has no favicon and falls back to Simple Icons.

## 11. Known gaps

- `/stacks`, `/compare` and `/utilities` had links but no routes. The links are
  removed. If they come back they need pages first, and `PRIMARY_NAVIGATION` in
  `src/config/navigation.ts` carries a comment saying so.
- The sponsorship product exists and is labelled, but nobody has bought one.
  Pricing is set by the plan at $5 per week or $18 for four weeks, and lives in
  `src/lib/billing/pricing.ts` so the page and the tests read one number.
  `lib/billing/sponsorship.ts` and `models/sponsorship.ts` are reachable only
  from tests, so `audit:orphans` reports them until the checkout exists.
- `CampaignModel` and `PaymentModel` exist and the activation path requires a
  server-recorded payment. No payment provider is integrated and no checkout
  exists. `src/test/plan-integrity.test.ts` guards the activation rule.
  `supabase` is flagged `sponsored: true` locally to exercise the rail. Turn it
  off with `npm run db:sponsored -- supabase off` before any public deploy.
- `SITE.domain` has no TLD, so the contact address on `/sponsors` renders as
  plain text rather than a `mailto`. It becomes a link once a real domain is
  set. Do not invent a domain to make it clickable.
- Accounts exist for writing only. Reading never needs one. See D23, this
  reverses the earlier no-login stance and says why.
- Google sign in is wired and dormant. It needs a Google Cloud OAuth client
  with `http://localhost:3000/api/auth/callback/google` as a redirect URI, and
  `GOOGLE_CLIENT_ID` plus `GOOGLE_CLIENT_SECRET` in `.env.local`. The button
  is hidden until both exist, so CI and a fresh clone work without them.
- Password accounts exist and cannot be linked to a Google account by the user.
  `accountLinking` is enabled with `trustedProviders: ["google"]`, so the link
  happens automatically on matching verified email and otherwise nothing
  happens.
- No email verification and no password reset. Both need an email transport,
  which does not exist yet. Until it does, a forgotten password is
  unrecoverable and a typo'd address cannot be confirmed. Do not launch with
  accounts and no verification without saying so.
- No rate limiting on the auth routes. D19 recorded the store, the model was
  removed as dead code, so it must be rebuilt with the routes.
- `models/event.ts` and `schemas/event.ts` are written and compiling but unused.
  They exist for the outbound click attribution in the monetisation plan.
- Admin CMS is not built. Content currently changes through seed scripts. The
  password gate, session signing and `src/proxy.ts` guard are written and
  compiling.
- All 48 tools are `unverified`. `verified=0` in the seed output is correct and
  expected. The admin verification pass is what makes the trust claim real.
- Some captured screenshots still show a cookie consent dialog, PostHog being
  the clearest case, because the dismissal list does not cover every consent
  pattern.
- No analytics, no sitemap, no robots beyond what Next emits, no legal pages.
- 48 tools against a plan target of 150 to 250.

## 12. Decisions and rejected options

`docs/decisions.md` holds the full decision record. Rejected, do not
reintroduce without a new argument:

- Microservices, Kubernetes, Kafka, Elasticsearch, Redis, BullMQ
- A generic `defineModel` helper, see 5.1
- Booleans for uncertain fields, see section 7
- Dashed borders, see section 6
- Pill shaped tags and filter chips, see section 6
- Third party favicon services, see section 10
- Login gated browsing, see section 11
- A separate homepage layout from `/explore`, they are the same page now
- Duplicating the category list on the homepage. The sidebar already lists all
  ten with counts on every page, and `/categories` holds the full tree. This
  was added, removed, re-added as a strip, and removed again.
