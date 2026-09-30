"use client"

import { useState } from "react"
import { cn } from "@/lib/utils/cn"

const SIMPLE_ICON_ALIASES: Record<string, string> = {
  fly: "flyio",
  "amazon-s3": "amazons3",
  "radix-ui": "radix",
  "shadcn-ui": "shadcn",
  "tailwind-css": "tailwindcss",
  nextjs: "nextdotjs",
}

const SIMPLE_ICON_SLUGS = new Set([
  "vercel",
  "supabase",
  "planetscale",
  "railway",
  "neon",
  "turso",
  "clerk",
  "auth0",
  "workos",
  "cloudflare",
  "netlify",
  "digitalocean",
  "hetzner",
  "flyio",
  "render",
  "aws",
  "googlecloud",
  "azure",
  "postgresql",
  "mongodb",
  "redis",
  "prisma",
  "drizzle",
  "docusaurus",
  "gitbook",
  "mintlify",
  "notion",
  "obsidian",
  "figma",
  "excalidraw",
  "linear",
  "raycast",
  "slack",
  "discord",
  "github",
  "gitlab",
  "docker",
  "grafana",
  "prometheus",
  "sentry",
  "posthog",
  "plausible",
  "mixpanel",
  "amplitude",
  "clarity",
  "hotjar",
  "datadog",
  "newrelic",
  "stripe",
  "paddle",
  "lemonsqueezy",
  "paypal",
  "razorpay",
  "resend",
  "postmark",
  "sendgrid",
  "mailgun",
  "brevo",
  "cloudinary",
  "imagekit",
  "uploadthing",
  "amazon-s3",
  "algolia",
  "typesense",
  "meilisearch",
  "elasticsearch",
  "opensearch",
  "pinecone",
  "openai",
  "anthropic",
  "huggingface",
  "langchain",
  "cursor",
  "githubcopilot",
  "windsurf",
  "zed-industries",
  "jetbrains",
  "spline",
  "umami",
  "tldraw",
  "caddy",
  "nginx",
  "nextdotjs",
  "astro",
  "tailwindcss",
  "radix-ui",
  "shadcnui",
  "vercel-ai-sdk",
  "cloudflare-r2",
])

const SIMPLE_ICONS_HOST = "https://cdn.simpleicons.org"

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
  const iconSlug = SIMPLE_ICON_ALIASES[slug] ?? slug
  const source =
    logoUrl ?? (SIMPLE_ICON_SLUGS.has(iconSlug) ? `${SIMPLE_ICONS_HOST}/${iconSlug}` : null)

  if (hasFailed || !source) {
    return (
      <span
        aria-hidden
        className={cn(
          TOOL_SIZE_CLASS,
          "grid place-items-center rounded-[5px] text-[9px] font-bold text-white",
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
