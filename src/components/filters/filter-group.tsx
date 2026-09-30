import { FilterChip } from "@/components/ui/filter-chip"

type FilterGroupProps = {
  label: string
  children: React.ReactNode
}

export const FilterGroup = ({ label, children }: FilterGroupProps) => (
  <div>
    <p className="micro-label mb-1.5">{label}</p>
    <div className="flex flex-wrap gap-1">{children}</div>
  </div>
)

type FilterToggleProps = {
  href: string
  active: boolean
  label: string
}

export const FilterToggle = ({ href, active, label }: FilterToggleProps) => (
  <FilterChip href={href} active={active}>
    {label}
  </FilterChip>
)
