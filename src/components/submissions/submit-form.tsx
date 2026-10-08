"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { CATEGORIES } from "@/config/categories"
import { submitToolAction } from "@/app/submit/actions"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { AlertIcon } from "@/components/icons"

const PRICING_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "freemium", label: "Freemium" },
  { value: "paid", label: "Paid" },
  { value: "open_source", label: "Open source" },
  { value: "unknown", label: "Not sure" },
] as const

export const SubmitForm = () => {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const errorRef = useRef<HTMLDivElement>(null)

  return (
    <form
      action={async (formData) => {
        setError(null)
        setIsPending(true)
        const result = await submitToolAction(formData)
        if (result.error) {
          setError(result.error)
          setIsPending(false)
          errorRef.current?.focus()
          return
        }
        router.refresh()
      }}
      className="mt-2"
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="submit-name">Product Name</FieldLabel>
          <Input id="submit-name" name="name" required maxLength={80} autoComplete="off" />
        </Field>

        <Field>
          <FieldLabel htmlFor="submit-website">Website</FieldLabel>
          <Input
            id="submit-website"
            name="websiteUrl"
            type="url"
            required
            placeholder="https://"
            autoComplete="url"
            spellCheck={false}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="submit-description">Description</FieldLabel>
          <Textarea
            id="submit-description"
            name="description"
            required
            minLength={30}
            maxLength={400}
            rows={4}
          />
          <FieldDescription>
            One or two sentences. Plain, factual, no marketing adjectives.
          </FieldDescription>
        </Field>

        <FieldSet>
          <FieldLegend>Categories</FieldLegend>
          <div className="grid gap-1 sm:grid-cols-2">
            {CATEGORIES.map((category) => (
              <Field key={category.slug} orientation="horizontal">
                <Checkbox
                  id={`submit-category-${category.slug}`}
                  name="categorySlugs"
                  value={category.slug}
                />
                <FieldLabel htmlFor={`submit-category-${category.slug}`} className="font-normal">
                  {category.name}
                </FieldLabel>
              </Field>
            ))}
          </div>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Pricing</FieldLegend>
          <RadioGroup
            name="pricing"
            defaultValue="unknown"
            className="flex flex-wrap gap-x-5 gap-y-1"
          >
            {PRICING_OPTIONS.map((option) => (
              <Field key={option.value} orientation="horizontal">
                <RadioGroupItem id={`submit-pricing-${option.value}`} value={option.value} />
                <FieldLabel htmlFor={`submit-pricing-${option.value}`} className="font-normal">
                  {option.label}
                </FieldLabel>
              </Field>
            ))}
          </RadioGroup>
          <FieldDescription>
            If you are not sure, say so. An honest unknown beats a wrong answer.
          </FieldDescription>
        </FieldSet>

        <Field>
          <FieldLabel htmlFor="submit-tags">
            Tags <span className="font-normal text-ink-4">(optional)</span>
          </FieldLabel>
          <Input
            id="submit-tags"
            name="tags"
            placeholder="comma, separated, tags…"
            required={false}
            autoComplete="off"
            spellCheck={false}
          />
        </Field>

        {error ? (
          <Alert ref={errorRef} tabIndex={-1} variant="destructive">
            <AlertIcon />
            <AlertTitle>Could Not Send</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Field orientation="horizontal">
          <Button type="submit" disabled={isPending}>
            {isPending && <Spinner data-icon="inline-start" />}
            {isPending ? "Sending…" : "Send for Review"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
