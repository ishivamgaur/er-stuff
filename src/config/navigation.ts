export type NavigationItem = {
  label: string
  href: string
}

/**
 * Only routes that exist. Adding a link here without a matching page under
 * src/app is how the product ends up promising something it cannot deliver,
 * which happened once with /stacks, /compare and /utilities.
 */
export const PRIMARY_NAVIGATION: readonly NavigationItem[] = [
  { label: "Explore", href: "/explore" },
  { label: "Free", href: "/free" },
  { label: "Categories", href: "/categories" },
]
