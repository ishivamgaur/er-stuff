import { ToolLogo } from "@/components/tools/tool-logo"
import type { PlainTool } from "@/lib/db/plain-tool"

type SponsoredCardProps = {
  tool: PlainTool
}

export const SponsoredCard = ({ tool }: SponsoredCardProps) => (
  <div className="border-b border-dashed border-line-strong bg-accent-tint/40 py-5">
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
      <ToolLogo name={tool.name} slug={tool.slug} logoUrl={tool.logoUrl} />
      <a
        href={`/tools/${tool.slug}`}
        className="text-body font-medium text-ink underline decoration-transparent decoration-from-font underline-offset-[0.3em] hover:decoration-current"
      >
        {tool.name}
      </a>
      <span className="ml-auto font-mono text-micro tracking-[0.08em] text-accent uppercase">
        Sponsored
      </span>
    </div>

    <p className="mt-2 max-w-[52ch] text-body leading-snug text-ink-2">{tool.description}</p>

    <a
      href={tool.websiteUrl}
      rel="noopener noreferrer sponsored"
      target="_blank"
      className="mt-2 inline-block text-body text-accent hover:underline"
    >
      Visit site
    </a>
  </div>
)
