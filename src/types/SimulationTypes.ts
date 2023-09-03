import type { ResourceType } from '@/types/DataTypes'
import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3'

export interface LinkType extends SimulationLinkDatum<NodeType> {
  value: number
}

export interface NodeType extends SimulationNodeDatum {
  id: number
  name: ResourceType
}
