"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

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
      className="flex items-center gap-2 rounded-chip border border-line-strong bg-surface px-3 py-2 transition-colors focus-within:border-accent"
    >
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="size-3.5 shrink-0 text-ink-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="7" cy="7" r="4.5" />
        <path d="M10.5 10.5 14 14" strokeLinecap="round" />
      </svg>

      <input
        type="search"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="free postgres hosting"
        aria-label="Search developer tools"
        className="w-full bg-transparent text-body text-ink outline-none placeholder:text-ink-4"
      />

      <button
        type="submit"
        className="shrink-0 rounded-chip bg-ink px-3 py-1 text-small text-page transition-opacity hover:opacity-85 active:scale-[0.98]"
      >
        Search
      </button>
    </form>
  )
}
