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
- shadcn/ui (style base-nova, Base UI primitives, not Radix). `components.json`
  at the root, generated components in `src/components/ui/`. Those files import
  `cn` from the `cn` package and icons from `reicon-react` directly, with
  `weight="Filled"` at each call site. A future `shadcn add` run will
  reintroduce `lucide-react` imports (and reinstall the package); re-map them
  to reicon before committing.
- App code reaches for `cn` from `@/lib/utils`, which is `clsx` plus a
  `tailwind-merge` extended with the custom type scale (see 5.17).
- Lenis for smooth scrolling, mounted once in the root layout (see 5.23).
  No animation library; entrances are CSS keyframes only.
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
| `check:nav` | asserts one gliding box that rests on the current row, travels mid-flight on hover, lands with navigation and keyboard focus, and that no row paints its own fill |
| `check:redesign` | smoke assertions for the theme (dark/light backgrounds, accent CTA), headings, overflow and zero page errors, plus screenshots to `TEMP/opencode/new-*` |
| `audit:orphans` | reachability graph from the Next entry points, lists unreachable modules |
| `check:auth` | Playwright assertions for signup, session, submission, guards, signout |
| `duotone:vendor` | re-downloads the BoldDuotone subset from reicon.dev and regenerates `src/components/icons/duotone-data.ts` |
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
the config alone changes nothing the user sees, because content renders from
the database — the config only seeds it. This already happened once. After
changing config content, run the sync script or re-seed.

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

### 5.17 tailwind-merge eats custom `text-*` sizes

`tailwind-merge` only knows Tailwind's default text sizes, so it files a custom
`text-body` under text colour and silently drops it whenever it meets
`text-ink-2` in the same `cn()` call, which is every nav row and every list
row. The drawer caught it: rail links measured 13px from the body rule while
drawer links inherited 14px from the sheet, from the same component and the
same class string. `src/lib/utils.ts` extends the merger with the custom scale.
The `cn` package that generated `ui/*` files import is unconfigurable, so app
code must keep importing `cn` from `@/lib/utils` and never from `cn`. Adding
a step to the type scale means updating three places together: the `--text-*`
token in `globals.css`, the `SCALE` list in `type-scale.test.ts`, and the
`font-size` group in `src/lib/utils.ts`. Miss the third and the new size
silently stops applying wherever it shares a `cn()` with a text colour.

### 5.18 Base UI has no `asChild`, and its Button cannot render as an anchor

Radix patterns do not transfer: Base UI composes through the `render` prop,
and a `Button` with `render={<Link/>}` logs a console error about
`nativeButton` (a dev overlay in `next dev`, silent in production). A link that
looks like a button must be a real anchor styled with `buttonVariants()`, not a
Button with a render prop.

### 5.19 The theme is a `.dark` class, not `data-theme`

The old `data-theme` attribute is gone with the rail it belonged to. shadcn's
`dark:` variant keys off `.dark` on the root element, the inline layout script
sets it before first paint, and it defaults to dark. Anything reading
`documentElement.dataset.theme` is stale.

### 5.20 The token test scans backtick literals in comments too

`theme-tokens.test.ts` walks every `"..."` and `` `...` `` string in `src`,
including prose inside comments. A `` `text-*` `` aside in a comment fails the
build. Write token names in comments as plain words.

### 5.21 Sheet width utilities lose to the sheet's own variants

`SheetContent` carries `data-[side=left]:w-3/4`, whose attribute selector
outranks a plain `w-64` by specificity no matter what `cn` merges. The drawer
measured 285px instead of 256px until the width moved to an inline style.
Utilities that restate a variant-qualified generated rule need the same
qualification or a style prop.

### 5.22 `shadcn@4.21.3` 404'd on npm at install time

The registry listed it as latest but the tarball was missing. `4.21.2` worked.
If `npx shadcn@latest` fails with E404, pin the last working minor instead of
debugging the project.

### 5.23 Lenis was innocent; the reveals were the stuck part

Scrolling stopped part way down long pages, and Lenis took the blame and was
removed — but the page was scrolling fine all along, and the "stuck" sections
were scroll reveals stuck at opacity zero. Lenis is back, with `anchors: true`
so the skip link glides through it instead of fighting it, and the reveals are
gone for good: reading must never wait behind animation. When scroll feels
broken, check what is invisible before blaming the scroller.

### 5.24 A theme swap must not run colour transitions

The palette flips in one moment — the custom store toggles the `.dark` class
synchronously (5.5, 5.19; deliberately not next-themes) — but every element
with `transition-colors` would then interpolate from the old palette to the
new one for 150ms and the page visibly melts instead of switching. That melt
is the flicker people blame on the theme library.

The guard is `.theme-swap`, defined in `globals.css`: transitions off across
the whole tree, except the toggle's own sun and moon, which keep their
cross-fade because that motion is the point of the control.
`theme-toggle.tsx` lifts the class onto the root in the same task as the
flip and drops it two frames later, once the new palette has painted as one
piece. A generation counter keeps rapid toggles safe: only the newest swap
releases the guard. Verified by probe: the computed colour of a transitioning
row is already the final value the moment the click handler returns.

## 6. Design system

The interface is a minimal directory with one accent: burgundy on neutral
surfaces, one line per tool, sections separated by dashed hairlines, counts
leading every heading. It is a principle, not a costume. The references are
designeer.xyz for density (one line per tool, the hover preview, counts
leading headings) and Vercel's interface guidelines for restraint: hierarchy
through typography before surfaces, sentence-case headings, no scroll-gated
reveals, color only for meaningful state.

- **Do not render literal markdown markers.** Structure comes from spacing, one
  hairline and weight.
- `src/components/icons/index.tsx` is the only icon source for app code. The
  artwork is Reicon: BoldDuotone where the beta set has the glyph, Filled
  everywhere else, wrapped rather than re-exported, so the entry point keeps
  the house rules: 16px, `currentColor` only, `aria-hidden` because every
  icon has a text label beside it, and no call site can pick a weight. The
  npm package ships Outline and Filled only, so the duotone subset is vendored
  from reicon.dev by `npm run duotone:vendor` into `duotone-data.ts`; it is
  the same artwork family as Filled (base path plus a detail layer at half
  opacity), so a duotone glyph beside a Filled fallback still reads as one
  set. Outline is never used — it reads as wireframe next to dense mono type —
  and the icon set test fails if a glyph is missing Filled data or if the
  wrapper skips duotone where the vendored set has it. The one exception is
  `src/components/ui/*`: generated shadcn files import `reicon-react`
  directly, the same escape hatch they had with Lucide, with
  `weight="Filled"` passed at each call site — none of them use the wrapper,
  so they never take the duotone branch. No second icon set and no
  inline SVG in a component, in both places. The one exception is the theme
  toggle: its sun and moon are hand-drawn and cross-fade against each other,
  which needs both shapes present in one control.
- `DetailList` in `components/tools/detail-panel.tsx` is the facts list. Field
  names are the real schema paths, for example `pricing.freeTier`, so the page
  matches the shape of the data.
- Tags render as small `Badge`s, and the `free` pricing badge is the one place
  a badge carries the brand tint, because it is the answer most readers scan
  for. Everything else stays quiet so the one signal keeps its value.
- Never make a field look filled in when it is unknown. The directory is 48
  tools and most capability fields are still `null`.

### Tokens

Defined in `src/app/globals.css` as CSS variables, referenced through
`@theme inline` so a single swap repaints the whole app. House names
(`page`, `surface`, `ink`, `line`, `brand`) resolve to shadcn semantics
(`background`, `card`, `foreground`, `border`, `primary`) underneath, so a
`bg-card` element and a `bg-surface` element are guaranteed the same colour
rather than two greys that drifted apart.

```
page       #09090b dark   #fafafa light
surface    #131315        #ffffff
line       #1e1e22        #eaeaee
ink        #fafafa        #09090b
ink-2      #b4b4ba        #3f3f46
ink-3      #8e8e96        #63636b
ink-4      #80808a        #76767e
brand      #de7f9c        #8c1d40
tint       #1e151a        #f1e8eb
```

`brand` is the one accent, burgundy: lightened to a rose on dark so links keep
their contrast, deep wine on light. Links, counts and icons use it straight.
Solid fills (primary buttons) invert it and take `primary-foreground` text,
which is dark-on-light in dark mode and light-on-dark in light mode. Never
put white text on a bright fill by hand; the pair is the whole point.
`src/test/theme-tokens.test.ts` asserts these pairs clear 4.5:1 in both
themes, because a token swap can leave every utility intact and only the
contrast broken.

Dark is the default, expressed the shadcn way as a `.dark` class on the root
element. The inline script in the layout sets it before first paint. `:root`
holds the light values so a browser with no JS still renders a legible page.

Muted greys are at or above 4.5:1 on both backgrounds. Do not reintroduce
low `opacity-50` or `opacity-70` on text. It was tried and it failed contrast.

Type scale: `text-micro` 10px, `text-tiny` 11px, `text-small` 12px,
`text-body` 13px, `text-lead` 15px, `text-title` 18px. Geist is the only
family: the `label` and `numeric` treatments keep their size and rhythm but
render in Geist with tabular figures, and `font-mono` resolves to Geist too
so the single face loads once. Eyebrows are sentence case, never all-caps.

### Rules

- One accent hue, burgundy: the primary button fills with it, links, counts,
  icons and the active nav state take it, and `free` is a burgundy dot plus a
  word. Row hovers and every surface stay gray — the accent marks state, it
  does not decorate. Destructive red is the only other hue and never moves.
- One floating fill marks the current section, and it glides. `GlideBox` in
  `sidebar.tsx` is a single absolutely positioned sibling that sits on the
  hovered row, or on the current section when nothing is hovered, so the same
  mark answers "where am I looking" and "where am I". Per-row fills cannot
  travel between rows, they only cross-fade, and they double up on the active
  row — so rows carry no fill of their own and sit `relative` above the box.
  The box is glass, not a swatch: a translucent accent tint, an inset light
  line along the top edge, a small drop shadow and the accent ring at low
  alpha, with a heavier lift on the dark page. Measure with rects, not
  `offsetTop`, and skip the entrance transition on first measure or the box
  slides in from the top on every load. The pointer resolves to the nearest
  row by Y, not to the element under the cursor: inside the gaps between rows
  and the margin between the blocks there is no row under the cursor, and a
  target-based hover used to spring the box back to the resting section
  mid-move. Nearest-row holds the row it was on through the gap and flips at
  the midpoint. Focus keeps the target-based resolution. `npm run check:nav`
  asserts the box rests, glides mid-flight, lands with navigation and follows
  keyboard focus.
- The sidebar is seven flat rows — Build, Components, Frontend, Backend,
  Data, Ship, AI — then a Sections block for the route the reader is on,
  each block under a 10px mono sentence-case heading, `Navigation` and
  `Sections`. Rows are 24px at 12px with 14px icons; counts and headings are
  the 10px mono annotation treatment, never a second clickable size. Section
  rows indent to the nav label column (30px) with no markers and no guide
  lines. Padding is deliberately tight — the scroll area is 8px on all sides,
  4px between blocks, 8px above the Sections heading. Counts arrive deduped
  from `findNavCounts` (5.3), never summed. The glide box tracks links only.
- The rail and the mobile drawer are glass on the page colour, not painted
  strips: `bg-page/85` with a backdrop blur and one shared `.glass-edge` class
  in `globals.css` — top sheen, three inset rims, a soft inner wash, a fading
  hairline on the inner edge and a right-biased contact shadow. They must
  match the page background; a separate rail grey made the panel read as
  paint. The sheen pseudo sits at z-index -1, which only paints above the
  panel background while the host keeps its stacking context (`z-20` on the
  rail, `z-50` on the sheet) — drop that z-index and it vanishes behind the
  background with no error. The class is plain unlayered CSS so it wins over
  the sheet's own drop shadow.
- No tree markers anywhere. The `├──`/`└──` section nav and the `[bracketed]`
  names were removed deliberately: sections are plain links with counts, and
  tags are badges.
- Section rules are dashed hairlines via the `rule` utility. A solid rule
  between two blocks of equal weight reads as a table cell, and the index is
  not a table.
- Every page header uses the same `PageHeader` primitive: mono eyebrow, then
  the count in the accent, then the title, then the description.
- Every list uses `IndexGroup` and `IndexList`.
- Decorative `01` section numbering was removed, it read as a markdown heading.
  Real counts stay, they are information.
- App code reaches for `cn` from `@/lib/utils`, which is `clsx` plus a
  `tailwind-merge` extended with the custom type scale (see 5.17). Generated
  `ui/*` files import `cn` from the `cn` package; leave those imports alone.

### Interactions

- Row hover dims siblings to `opacity-[0.42]`. Do not go much darker, the list
  stops being scannable.
- The hover preview follows `clientY`, clamps to the list bounds and the
  viewport with a 16px margin. It is `pointer-events-none` and hidden below
  `lg`.
- Palette opens on Ctrl/Cmd+K, built on the shadcn `Command` primitives, with
  the selected item in the brand tint.
- One easing curve for interaction states, `ease-ui`. Entrances are a short
  fade-and-rise with a blur: CSS `rise`/`rise-row` with a `--d` stagger covers
  the server-rendered first paint. Nothing is scroll-gated: revealing every
  section on scroll was tried and left whole sections stuck invisible, and the
  guidelines reject gating reading behind animation. Both stay off
  under `prefers-reduced-motion`.
- Buttons press with `active:scale`, never with a colour swap alone.

### Responsive

- Frame is a single `max-w-5xl` with the rail beside the content; `main` caps
  itself once more at `max-w-3xl` so line length stays readable. Do not add a
  third cap.
- The sidebar is 14rem, collapses to 3.5rem on a toggle, and remembers that in
  localStorage. Below `lg` it is a drawer instead. Do not derive collapse from a
  media query, that resets the preference on every reload.
- The wordmark is a fixed strip at the top of the rail, the same height as the
  toolbar beside it and sharing its bottom hairline, so the two read as one
  header bar. It sits outside the scroll area, so the logo cannot scroll away.
  The tagline does not appear in the rail at all. `SITE.tagline` is still the
  metadata description.
- The sidebar uses 12px for anything you can click and 10px mono for anything
  that annotates a row: counts, the block headings and the account email.
- Only `sm:` and `lg:` are used. The design has no other breakpoints.
- Scrolling is Lenis, mounted once in the root layout. `syncTouch` stays off
  because hijacking touch scroll breaks momentum, and it is skipped entirely
  for `prefers-reduced-motion`. No CSS `scroll-behavior` may compete with it:
  the two fight over every programmatic scroll. Lenis was removed once because
  pages felt stuck mid-scroll, but the stuck sections turned out to be dead
  scroll reveals, not the scroller (see 5.23).
- Mobile navigation is a shadcn `Sheet` on the left, opened from a hamburger in
  the toolbar, rendering the same `SidebarNav` as the desktop rail so the two
  can never disagree. The desktop rail is hidden below `lg`. There is no
  collapsible accordion, it was tried and it displaced content.
- The drawer locks body scroll, closes on Escape, on backdrop click and on
  navigation, moves focus in on open and returns it to the trigger on close.
  The panel is 16rem wide through an inline style, because the sheet's
  variant-qualified width utilities outrank a plain `w-64` by specificity (see
  5.22).
- The pricing badge moves onto the name line below `sm`, so the description gets
  the full row width instead of being squeezed beside a fixed badge column.
- Row logo is `items-start` on mobile, `items-center` from `sm:`.
- `scrollbar-gutter: stable` on the root so nothing shifts when a scrollbar
  appears. Scrollbar is thin, transparent track, thumb in `line-strong`.

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
| `/` | Build, the landing route: `NavPage` with `DEFAULT_NAV` — page header, then one `IndexGroup` per section, each section an in-page anchor |
| `/components`, `/frontend`, `/backend`, `/data`, `/ship`, `/ai` | one discipline each, same `NavPage` shape over that nav item's sections |
| `/free` | four sections: free forever, free tier, open source, self hostable |
| `/tools/[slug]` | detail, details list, tags, alternatives, related, verification |
| `/search` | search results |
| `/signup`, `/signin`, `/account` | credentials, via Better Auth |
| `/submit` | list your own product, account holders only |
| `/admin/reviews` | moderation queue for submissions |
| `/sponsors` | disclosure, what money does not buy, and how to sponsor |
| `/api/search`, `/api/search/autocomplete` | search JSON |
| redirects | `/explore` and `/categories` permanently to `/`; each old category path into its discipline route (`next.config.ts`) |

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
- Solid section rules and bracketed labels. Both were the old index language;
  the redesign replaced them with dashed hairlines and badges, see section 6.
  Do not reintroduce either without a new argument.
- Third party favicon services, see section 10
- Login gated browsing, see section 11
- A separate homepage layout from `/explore`: `/` is the directory, and
  `/explore` permanently redirects to it
- Duplicating the category list on the homepage. The rail already carries the
  nav and the current route's sections, the ten-category tree lives in the
  seed config, and `/categories` now redirects to `/`. This was added,
  removed, re-added as a strip, and removed again.
