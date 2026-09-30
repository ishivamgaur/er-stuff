/**
 * A single hand drawn icon set. One grid, one stroke weight, one way of ending
 * a line. Deliberately not an icon library: a generic set makes a product look
 * assembled rather than designed.
 *
 * Conventions, applied everywhere:
 * - 16 unit grid, 1.5 stroke, round caps and joins
 * - `currentColor` only, so state comes from CSS and never from a second asset
 * - `aria-hidden`, because every icon here sits next to a text label
 */

type IconProps = {
  className?: string
  strokeWidth?: number
}

const base = (className?: string) => `size-4 shrink-0 ${className ?? ""}`.trim()

/** The prompt. The wordmark, not a logo mark, because it reads as a terminal. */
export const PromptIcon = ({ className }: IconProps) => (
  <svg
    aria-hidden
    viewBox="0 0 24 16"
    className={base(className)}
    fill="none"
    stroke="currentColor"
  >
    <path d="M4 3.5 9.5 8 4 12.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.5 12.5H20" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

export const MenuIcon = ({ className }: IconProps) => (
  <svg
    aria-hidden
    viewBox="0 0 16 16"
    className={base(className)}
    fill="none"
    stroke="currentColor"
  >
    <path d="M2.5 4.75h11M2.5 8h7.5M2.5 11.25h11" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export const CloseIcon = ({ className }: IconProps) => (
  <svg
    aria-hidden
    viewBox="0 0 16 16"
    className={base(className)}
    fill="none"
    stroke="currentColor"
  >
    <path d="m4.25 4.25 7.5 7.5M11.75 4.25l-7.5 7.5" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export const ChevronIcon = ({ className }: IconProps) => (
  <svg
    aria-hidden
    viewBox="0 0 16 16"
    className={base(className)}
    fill="none"
    stroke="currentColor"
  >
    <path
      d="m9.75 3.5-4.25 4.5 4.25 4.5"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const SearchIcon = ({ className }: IconProps) => (
  <svg
    aria-hidden
    viewBox="0 0 16 16"
    className={base(className)}
    fill="none"
    stroke="currentColor"
  >
    <circle cx="7.1" cy="7.1" r="4.35" strokeWidth="1.5" />
    <path d="m10.5 10.5 3 3" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export const PlusIcon = ({ className }: IconProps) => (
  <svg
    aria-hidden
    viewBox="0 0 16 16"
    className={base(className)}
    fill="none"
    stroke="currentColor"
  >
    <path d="M8 3.25v9.5M3.25 8h9.5" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export const SignOutIcon = ({ className }: IconProps) => (
  <svg
    aria-hidden
    viewBox="0 0 16 16"
    className={base(className)}
    fill="none"
    stroke="currentColor"
  >
    <path
      d="M6 2.75H3.9A1.4 1.4 0 0 0 2.5 4.15v7.7A1.4 1.4 0 0 0 3.9 13.25H6"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M10.5 5.25 13.25 8l-2.75 2.75M13.25 8H6"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/** Outbound link. The arrow leaves a break in the box, so it reads as leaving. */
export const ExternalIcon = ({ className }: IconProps) => (
  <svg
    aria-hidden
    viewBox="0 0 16 16"
    className={base(className)}
    fill="none"
    stroke="currentColor"
  >
    <path
      d="M6.25 3.25H3.6A1.35 1.35 0 0 0 2.25 4.6v6.8a1.35 1.35 0 0 0 1.35 1.35h6.8a1.35 1.35 0 0 0 1.35-1.35V9.75"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M9.5 2.75h3.75V6.5M13.25 2.75 7.75 8.25"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const SunIcon = ({ className }: IconProps) => (
  <svg
    aria-hidden
    viewBox="0 0 16 16"
    className={base(className)}
    fill="none"
    stroke="currentColor"
  >
    <circle cx="8" cy="8" r="3" strokeWidth="1.5" />
    <path
      d="M8 1.75v1.5M8 12.75v1.5M14.25 8h-1.5M3.25 8h-1.5M12.42 3.58l-1.06 1.06M4.64 11.36l-1.06 1.06M12.42 12.42l-1.06-1.06M4.64 4.64 3.58 3.58"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

export const MoonIcon = ({ className }: IconProps) => (
  <svg
    aria-hidden
    viewBox="0 0 16 16"
    className={base(className)}
    fill="none"
    stroke="currentColor"
  >
    <path
      d="M13.25 9.68A5.6 5.6 0 0 1 6.32 2.75a5.6 5.6 0 1 0 6.93 6.93Z"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
)

export const CheckIcon = ({ className }: IconProps) => (
  <svg
    aria-hidden
    viewBox="0 0 16 16"
    className={base(className)}
    fill="none"
    stroke="currentColor"
  >
    <path d="m3.5 8.5 3 3 6-7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const AlertIcon = ({ className }: IconProps) => (
  <svg
    aria-hidden
    viewBox="0 0 16 16"
    className={base(className)}
    fill="none"
    stroke="currentColor"
  >
    <path d="M8 2.75v6" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="8" cy="11.6" r="0.9" fill="currentColor" stroke="none" />
  </svg>
)

/** A single mark for an unlisted category, derived from the section initial. */
export const CategoryMark = ({ label, className }: { label: string; className?: string }) => (
  <span
    aria-hidden
    className={`flex size-4 shrink-0 items-center justify-center text-[9px] font-bold text-ink-4 ${
      className ?? ""
    }`}
  >
    {label.slice(0, 1).toUpperCase()}
  </span>
)

export const UserIcon = ({ className }: IconProps) => (
  <svg
    aria-hidden
    viewBox="0 0 16 16"
    className={base(className)}
    fill="none"
    stroke="currentColor"
  >
    <circle cx="8" cy="5.5" r="2.6" strokeWidth="1.5" />
    <path d="M2.9 13.25a5.1 5.1 0 0 1 10.2 0" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

/** Sponsors. A horn, because the slot is sold rather than earned. */
export const MegaphoneIcon = ({ className }: IconProps) => (
  <svg
    aria-hidden
    viewBox="0 0 16 16"
    className={base(className)}
    fill="none"
    stroke="currentColor"
  >
    <path d="M3 6.25v3.5h2.1L11 12.5v-9L5.1 6.25H3Z" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M12.75 6.25a2.6 2.6 0 0 1 0 3.5" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
