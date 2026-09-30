/**
 * The minimum the shell needs to know about the viewer. Passing a shape rather
 * than the session keeps the session, its tokens and its expiry out of client
 * components that only need to know whether someone is signed in.
 */
export type Viewer = {
  id: string
  email: string
  /** Nullable because Better Auth treats additional fields as optional. */
  role?: string | null | undefined
}
