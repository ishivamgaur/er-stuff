import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/*
 * The merger has to know the custom type scale. tailwind-merge only ships
 * Tailwind's default text sizes, so without this it files text-body under
 * text colour and silently drops it whenever it meets text-ink-2 in the same
 * cn() call — which is every nav row and every list row.
 *
 * That bug is invisible in most screenshots, because body copy is 13px anyway
 * and the dropped class only matters where the size should differ from the
 * inherited one. The drawer caught it: rail links measured 13px from the body
 * rule while drawer links inherited 14px from the sheet, from the same
 * component and the same class string.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["micro", "tiny", "small", "body", "lead", "title", "display", "hero"] },
      ],
    },
  },
})

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(...inputs))
