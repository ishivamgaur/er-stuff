import { IndexGroup } from "@/components/tools/index-row"
import { PageHeader } from "@/components/layout/page-header"
import { SponsoredRail } from "@/components/tools/sponsored-rail"
import { findNavCounts } from "@/lib/db/nav"
import { findSponsoredTools, findTools } from "@/lib/db/tools"
import { toolQuerySchema } from "@/schemas/tool-query"
import type { NavItem } from "@/config/nav"

/*
 * One template for every browsing page: header, labelled sponsored rail, then
 * every section of the nav item stacked in config order. The sidebar is built
 * from the same config, so the section list over there and the sections over
 * here can never disagree.
 *
 * `findNavCounts` is React-cached, so the layout's sidebar counts and this
 * page's counts are one database pass per request.
 */
export const NavPage = async ({ nav }: { nav: NavItem }) => {
  const [counts, sponsored, sectionResults] = await Promise.all([
    findNavCounts(),
    findSponsoredTools(),
    Promise.all(
      nav.sections.map((entry) =>
        findTools(toolQuerySchema.parse({ subcategory: [...entry.subcategories], limit: 96 })),
      ),
    ),
  ])

  return (
    <div>
      <PageHeader
        count={counts.get(nav.href) ?? 0}
        title={nav.label}
        description={nav.description}
      />

      <SponsoredRail tools={sponsored} />

      {nav.sections.map((entry, index) => (
        <IndexGroup
          key={entry.id}
          id={entry.id}
          count={counts.get(`#${entry.id}`) ?? 0}
          title={entry.label}
          description={entry.description}
          tools={sectionResults[index]?.items ?? []}
        />
      ))}
    </div>
  )
}
