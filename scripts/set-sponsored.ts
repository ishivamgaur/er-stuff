import { connectToDatabase } from "@/lib/db/connect"
import { ToolModel } from "@/models/tool"

const slug = process.argv[2]
const sponsored = process.argv[3] !== "off"

await connectToDatabase()

if (sponsored) {
  const result = await ToolModel.updateOne({ slug }, { $set: { sponsored: true } })
  console.log(`${slug} sponsored:`, result.modifiedCount)
} else {
  const result = await ToolModel.updateOne({ slug }, { $set: { sponsored: false } })
  console.log(`${slug} sponsored:`, result.modifiedCount)
}

const total = await ToolModel.countDocuments({ sponsored: true })
console.log("sponsored total:", total)
process.exit(0)
