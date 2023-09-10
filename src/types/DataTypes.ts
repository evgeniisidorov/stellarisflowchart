/* todo: rework duplicate */
export const RESOURCES: string[] = ['food', 'energy', 'mineral', 'alloys', 'consumer_goods']
export const JOBS: string[] = [
  'farmer',
  'technician',
  'miner',
  'foundry',
  'artisan',
  'angler',
  'pearl_diver',
  'catalytic_technician'
]

export type ResourceType = 'food' | 'energy' | 'mineral' | 'alloys' | 'consumer_goods'
export type JobType =
  | 'farmer'
  | 'technician'
  | 'miner'
  | 'foundry'
  | 'artisan'
  | 'angler'
  | 'catalytic_technician'
  | 'pearl_diver'

export type NodeType = 'resource' | 'job'

export interface ISupplyChainNode {
  type: NodeType
  name: string
}

export interface IJobResource {
  job: JobType
  resource: ResourceType
  value: number
}
