"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils/cn"
import { CATEGORIES } from "@/config/categories"
import { submitToolAction } from "@/app/submit/actions"

const PRICING_OPTIONS = [
  { value: "free", label: "free" },
  { value: "freemium", label: "freemium" },
  { value: "paid", label: "paid" },
  { value: "open_source", label: "open source" },
  { value: "unknown", label: "not sure" },
] as const

export const SubmitForm = () => {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  return (
    <form
      action={async (formData) => {
        setError(null)
        setIsPending(true)
        const result = await submitToolAction(formData)
        if (result.error) {
          setError(result.error)
          setIsPending(false)
          return
        }
        router.refresh()
      }}
      className="mt-4 space-y-5"
    >
      <label className="block">
        <span className="mb-1.5 block text-small text-ink-2">
          <span aria-hidden className="text-ink-4">
            #
          </span>{" "}
          Product name
        </span>
        <input
          name="name"
          required
          maxLength={80}
          className="w-full border border-line bg-field px-3 py-2 text-body text-ink outline-none transition-colors focus:border-accent"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-small text-ink-2">
          <span aria-hidden className="text-ink-4">
            #
          </span>{" "}
          Website
        </span>
        <input
          name="websiteUrl"
          type="url"
          required
          placeholder="https://"
          className="w-full border border-line bg-field px-3 py-2 text-body text-ink outline-none transition-colors placeholder:text-ink-4 focus:border-accent"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-small text-ink-2">
          <span aria-hidden className="text-ink-4">
            #
          </span>{" "}
          Description
        </span>
        <textarea
          name="description"
          required
          minLength={30}
          maxLength={400}
          rows={4}
          className="w-full resize-y border border-line bg-field px-3 py-2 text-body leading-relaxed text-ink outline-none transition-colors focus:border-accent"
        />
        <span className="mt-1 block text-micro text-ink-3">
          One or two sentences. Plain, factual, no marketing adjectives.
        </span>
      </label>

      <fieldset>
        <legend className="mb-1.5 text-small text-ink-2">
          <span aria-hidden className="text-ink-4">
            #
          </span>{" "}
          Categories
        </legend>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {CATEGORIES.map((category) => (
            <label key={category.slug} className="flex items-center gap-1.5 text-small text-ink-2">
              <input
                type="checkbox"
                name="categorySlugs"
                value={category.slug}
                className="size-3 accent-[var(--accent)]"
              />
              {category.name}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-1.5 text-small text-ink-2">
          <span aria-hidden className="text-ink-4">
            #
          </span>{" "}
          Pricing
        </legend>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {PRICING_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-1.5 text-small text-ink-2">
              <input
                type="radio"
                name="pricing"
                value={option.value}
                defaultChecked={option.value === "unknown"}
                className="size-3 accent-[var(--accent)]"
              />
              {option.label}
            </label>
          ))}
        </div>
        <span className="mt-1 block text-micro text-ink-3">
          If you are not sure, say so. An honest unknown beats a wrong answer.
        </span>
      </fieldset>

      <label className="block">
        <span className="mb-1.5 block text-small text-ink-2">
          <span aria-hidden className="text-ink-4">
            #
          </span>{" "}
          Tags
        </span>
        <input
          name="tags"
          placeholder="comma, separated, tags"
          className="w-full border border-line bg-field px-3 py-2 text-body text-ink outline-none transition-colors placeholder:text-ink-4 focus:border-accent"
        />
      </label>

      {error ? (
        <p role="alert" className="border-l-2 border-destructive bg-field px-3 py-2 text-small">
          <span aria-hidden className="mr-1.5 text-destructive">
            !
          </span>
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "bg-accent px-4 py-2.5 text-body font-bold text-accent-ink transition-opacity",
          isPending ? "opacity-60" : "hover:opacity-90",
        )}
      >
        {isPending ? "Sending" : "Send for review"}
      </button>
    </form>
  )
}
