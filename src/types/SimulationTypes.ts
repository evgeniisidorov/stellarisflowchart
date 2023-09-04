import type { ISupplyChainNode } from '@/types/DataTypes'
import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3'


export interface ILinkDatum extends SimulationLinkDatum<INodeDatum> {
  value: number
}

export interface INodeDatum extends SimulationNodeDatum, ISupplyChainNode {
  id: number
  screenX?: number
  screenY?: number
}
