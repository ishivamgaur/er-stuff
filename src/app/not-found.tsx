import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

/*
 * A dead end with a way back. Every page needs one: this names what happened
 * in plain words and offers the index and the search, not an apology.
 */
export default function NotFound() {
  return (
    <div className="rise py-10">
      <p className="label text-brand">404</p>
      <h1 className="mt-2 text-title font-semibold tracking-tight text-balance text-ink">
        Nothing here
      </h1>
      <p className="mt-2 max-w-[50ch] text-body leading-relaxed text-pretty text-ink-2">
        This address is not a tool, a category or a page we keep. If you followed a link here, it
        moved or never existed.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href="/" className={buttonVariants()}>
          Browse the Index
        </Link>
        <Link href="/search" className={buttonVariants({ variant: "outline" })}>
          Search Instead
        </Link>
      </div>
    </div>
  )
}
