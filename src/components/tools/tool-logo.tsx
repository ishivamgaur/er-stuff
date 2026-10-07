"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

/*
 * A gray ramp, not brand colours. The fallback tile has to read on both
 * themes with white initials, so every step stays dark enough for that.
 */
const BACKGROUND_PALETTE = [
  "#26262b",
  "#2e2e34",
  "#36363d",
  "#3e3e46",
  "#46464f",
  "#4e4e58",
  "#52525b",
  "#5b5b65",
] as const

const hashSlug = (slug: string): number => {
  let hash = 0
  for (let index = 0; index < slug.length; index += 1) {
    hash = (hash << 5) - hash + slug.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash)
}

const getInitials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")

type ToolLogoProps = {
  name: string
  slug: string
  logoUrl?: string | null
  className?: string
}
const TOOL_SIZE_CLASS = "size-5 shrink-0"

export const ToolLogo = ({ name, slug, logoUrl, className }: ToolLogoProps) => {
  const [hasFailed, setHasFailed] = useState(false)
  const source = logoUrl

  if (hasFailed || !source) {
    return (
      <span
        aria-hidden
        className={cn(
          TOOL_SIZE_CLASS,
          "grid place-items-center rounded-[5px] text-micro font-bold text-white",
          className,
        )}
        style={{ backgroundColor: BACKGROUND_PALETTE[hashSlug(slug) % BACKGROUND_PALETTE.length] }}
      >
        {getInitials(name)}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={source}
      alt=""
      width={20}
      height={20}
      loading="lazy"
      decoding="async"
      onError={() => setHasFailed(true)}
      className={cn(TOOL_SIZE_CLASS, "rounded-[4px] object-contain ring-1 ring-line/50", className)}
    />
  )
}
