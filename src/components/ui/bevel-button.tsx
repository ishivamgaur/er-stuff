"use client"

import Link from "next/link"
import { cn } from "@/lib/utils/cn"

type BevelButtonProps = {
  href: string
  children: string
  external?: boolean
  className?: string
}

export const BevelButton = ({ href, children, external, className }: BevelButtonProps) => {
  const shared =
    "group inline-flex items-center gap-1.5 rounded-chip bg-gradient-to-b from-blue-500 to-blue-700 px-3 py-1.5 text-body whitespace-nowrap text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35)] transition-[filter,box-shadow,transform] duration-150 hover:brightness-110 active:translate-y-px active:shadow-none"

  const content = (
    <>
      <span>{children}</span>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-3 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </>
  )

  const classNames = cn(shared, className)

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classNames}>
        {content}
      </a>
    )
  }

  return (
    <Link href={href} className={classNames}>
      {content}
    </Link>
  )
}
