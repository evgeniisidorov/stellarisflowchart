import type { ResourceType } from "@/types/DataTypes"

export interface NodeType {
  id: number
  index?: number
  x?: number
  y?: number
  screenY?: number
  screenX?: number
  name: ResourceType
}
