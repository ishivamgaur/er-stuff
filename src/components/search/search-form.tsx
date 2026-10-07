"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchIcon } from "@/components/icons"

type SearchFormProps = {
  defaultValue: string
}

export const SearchForm = ({ defaultValue }: SearchFormProps) => {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue)
  const [syncedValue, setSyncedValue] = useState(defaultValue)

  if (defaultValue !== syncedValue) {
    setSyncedValue(defaultValue)
    setValue(defaultValue)
  }

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        const trimmed = value.trim()
        router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search")
      }}
      className="flex items-center gap-2"
    >
      <div className="relative flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-4" />
        <Input
          type="search"
          name="q"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="free postgres hosting…"
          aria-label="Search developer tools"
          autoComplete="off"
          className="bg-surface pl-9"
        />
      </div>

      <Button type="submit">Search</Button>
    </form>
  )
}
