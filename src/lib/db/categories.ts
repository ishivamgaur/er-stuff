import type { CategoryDocument } from "@/models/category"

/**
 * The category document as read paths see it. The count helpers that used to
 * live here moved: the sidebar counts sections and nav items now, and those
 * come from `@/lib/db/nav`.
 */
export type CategoryLean = CategoryDocument
