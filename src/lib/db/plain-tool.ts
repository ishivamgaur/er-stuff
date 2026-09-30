import type { ToolDocument } from "@/models/tool"

export type PlainTool = Omit<ToolDocument, "_id" | "createdAt" | "updatedAt"> & {
  _id: string
  createdAt: string
  updatedAt: string
}

export const toPlainTool = (tool: ToolDocument): PlainTool => {
  const { _id, createdAt, updatedAt, ...rest } = tool

  return {
    ...rest,
    _id: String(_id),
    createdAt: new Date(createdAt).toISOString(),
    updatedAt: new Date(updatedAt).toISOString(),
  }
}

export const toPlainTools = (tools: ToolDocument[]): PlainTool[] => tools.map(toPlainTool)
