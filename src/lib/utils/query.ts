export const appendQuery = (
  params: Record<string, string | string[] | undefined>,
  skipKey: string,
  overrides: Record<string, string> = {},
): string => {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (key === skipKey) continue

    const values = Array.isArray(value) ? value : [value]
    for (const item of values) {
      if (item) search.append(key, item)
    }
  }

  for (const [key, value] of Object.entries(overrides)) {
    search.set(key, value)
  }

  return search.toString()
}

export const readList = (
  params: Record<string, string | string[] | undefined>,
  key: string,
): string[] => {
  const value = params[key]
  if (value === undefined) return []

  return (Array.isArray(value) ? value : [value])
    .flatMap((entry) => entry.split(","))
    .map((entry) => entry.trim())
    .filter(Boolean)
}
