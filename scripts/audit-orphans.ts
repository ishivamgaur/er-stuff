import { readFileSync, readdirSync, statSync, existsSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"

const ROOT = join(process.cwd(), "src")

const files: string[] = []
const walk = (dir: string) => {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) walk(path)
    else if (/\.(ts|tsx)$/.test(entry)) files.push(path)
  }
}
walk(ROOT)

const toModule = (path: string) =>
  path
    .slice(ROOT.length + 1)
    .replace(/\\/g, "/")
    .replace(/\.tsx?$/, "")

const IMPORT_RE =
  /(?:import|export)[\s\S]*?from\s*["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g

const resolveSpecifier = (from: string, spec: string): string | null => {
  if (!spec.startsWith(".")) {
    const alias = spec.replace(/^@\//, "")
    const candidates = [alias, `${alias}/index`]
    for (const c of candidates) {
      if (files.some((f) => toModule(f) === c)) return c
    }
    return null
  }
  const base = resolve(dirname(from), spec)
  const rel = relative(ROOT, base).replace(/\\/g, "/")
  for (const c of [rel, `${rel}/index`]) {
    if (files.some((f) => toModule(f) === c)) return c
  }
  return null
}

const byModule = new Map(files.map((f) => [toModule(f), f]))

const entryPoints = files.filter((f) =>
  /(^|[\\/])(page|layout|route|proxy|not-found|error|loading|template)\.(ts|tsx)$/.test(f),
)

const reached = new Set<string>()
const queue = entryPoints.map(toModule)

while (queue.length > 0) {
  const mod = queue.pop() as string
  if (reached.has(mod)) continue
  reached.add(mod)
  const file = byModule.get(mod)
  if (!file) continue
  const source = readFileSync(file, "utf8")
  for (const match of source.matchAll(IMPORT_RE)) {
    const spec = match[1] ?? match[2]
    if (!spec) continue
    const target = resolveSpecifier(file, spec)
    if (target && !reached.has(target)) queue.push(target)
  }
}

const orphans = files
  .map(toModule)
  .filter((m) => !reached.has(m))
  .filter((m) => !m.endsWith(".test.ts") && !m.endsWith(".test.tsx"))
  .sort()

console.log(`entry points: ${entryPoints.length}`)
console.log(`reachable:   ${reached.size}`)
console.log(`orphans:     ${orphans.length}\n`)
for (const o of orphans) {
  const file = byModule.get(o) as string
  const exported = [
    ...readFileSync(file, "utf8").matchAll(/export (?:const|function|class|async function) (\w+)/g),
  ].map((m) => m[1])
  console.log(`${o}\n    exports: ${exported.join(", ") || "(none)"}`)
}
if (process.argv.includes("--css") && existsSync(join(ROOT, "app/globals.css"))) {
  console.log(
    "\nglobals.css referenced:",
    reached.has("app/globals.css") || "via layout import check",
  )
}
