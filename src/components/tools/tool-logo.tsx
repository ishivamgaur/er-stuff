"use client"

import { useState } from "react"
import { cn } from "@/lib/utils/cn"

const BACKGROUND_PALETTE = [
  "#1c2b4d",
  "#2b1c3d",
  "#1c3326",
  "#3d2b1c",
  "#3d1c25",
  "#1c3d3d",
  "#2e2e3d",
  "#33301c",
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
      className={cn(TOOL_SIZE_CLASS, "object-contain", className)}
    />
  )
}
