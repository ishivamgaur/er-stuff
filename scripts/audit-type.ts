import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, sep as pathSep } from "node:path"

const ROOT = join(process.cwd(), "src")
const files: string[] = []
const walk = (d: string) => {
  for (const e of readdirSync(d)) {
    const p = join(d, e)
    if (statSync(p).isDirectory()) walk(p)
    else if (e.endsWith(".tsx")) files.push(p)
  }
}
walk(ROOT)

/**
 * The declared scale, smallest to largest. Text must use one of these.
 * Anything else is a one off and is what makes a UI feel inconsistent.
 */
const SCALE = ["micro", "small", "body", "lead", "title", "display"]
const rows: string[] = []
const offenders: string[] = []

for (const file of files) {
  const rel = file
    .slice(ROOT.length + 1)
    .split(pathSep)
    .join("/")
  const source = readFileSync(file, "utf8")
  const used = new Set<string>()

  for (const m of source.matchAll(/text-(micro|small|body|lead|title|display)\b/g)) {
    used.add(m[1] as string)
  }
  for (const m of source.matchAll(/text-\[(\d+)px\]/g)) {
    offenders.push(`${rel}: text-[${m[1]}px] is outside the scale`)
  }

  if (used.size > 0) {
    const list = [...used].sort((a, b) => SCALE.indexOf(a) - SCALE.indexOf(b))
    rows.push(`${list.join(" > ")}\t${rel}`)
  }
}

rows.sort()
console.log(rows.join("\n"))
console.log(`\nfiles using the scale: ${rows.length}`)
console.log(`scale steps: ${SCALE.join(" ")}`)
if (offenders.length > 0) {
  console.log("\nOUTSIDE THE SCALE:")
  for (const o of offenders) console.log(`  ${o}`)
}
