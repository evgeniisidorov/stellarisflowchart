import type { NodeType } from '@/types/NodeType'

export interface LinkType {
  source: NodeType | number 
  target: NodeType | number
  value: number
  index?: number
}
