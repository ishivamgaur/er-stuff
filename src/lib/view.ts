/*
 * The list layout preference, shared by server and client code. The cookie is
 * what the server reads so the first paint already shows the stored view; the
 * client keeps a localStorage mirror for live updates. Both are written
 * together on every toggle. This module touches neither `window` nor
 * `document`, so server components can import it freely — the browser halves
 * live in `components/layout/view-toggle.tsx`.
 */

export type ListView = "list" | "cards"

export const VIEW_COOKIE = "erstuff-view"

export const DEFAULT_VIEW: ListView = "list"

export const resolveView = (value: unknown): ListView =>
  value === "cards" ? "cards" : DEFAULT_VIEW
