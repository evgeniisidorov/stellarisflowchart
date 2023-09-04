import type { ILinkDatum, INodeDatum } from '@/types/SimulationTypes'

export type ResourceType = 'food' | 'energy' | 'mineral' | 'alloys' | 'consumer_goods'
export type JobType = 'farmer' | 'technician' | 'miner' | 'foundry' | 'artisan'

export type NodeType = 'resource' | 'job'

export interface ISupplyChainNode {
  type: NodeType
  resource?: ResourceType
  job?: JobType
}

export interface IJobResource {
  job: JobType
  resource: ResourceType
  value: number
}

export interface MockData {
  links: ILinkDatum[]
  nodes: INodeDatum[]
  job_resources: IJobResource[]
}

const MockJobResource: IJobResource[] = [
  { job: 'foundry', resource: 'mineral', value: -6 },
  { job: 'foundry', resource: 'alloys', value: 3 },
  { job: 'artisan', resource: 'mineral', value: -6 },
  { job: 'artisan', resource: 'consumer_goods', value: 6 },
  { job: 'farmer', resource: 'food', value: 6 },
  { job: 'technician', resource: 'energy', value: 6 },
  { job: 'miner', resource: 'mineral', value: 4 }
]

export const mock_data: MockData = {
  links: [
    // produces
    { source: 5, target: 0, value: 6 },
    { source: 6, target: 1, value: 6 },
    { source: 7, target: 2, value: 4 },
    { source: 8, target: 3, value: 3 },
    { source: 9, target: 4, value: 6 },
    // job upkeep
    { source: 8, target: 2, value: -6 },
    { source: 9, target: 2, value: -6 }
    // // living stanard upkeep (food only) for biological pops
    // { source: 5, target: 0, value: 1 },
    // { source: 6, target: 0, value: 1 },
    // { source: 7, target: 0, value: 1 },
    // { source: 8, target: 0, value: 1 },
    // { source: 9, target: 0, value: 1 },
    // // living stanard upkeep (CG only) for specialist strata
    // { source: 8, target: 4, value: 1 },
    // { source: 9, target: 4, value: 1 },
  ],
  nodes: [
    { id: 0, resource: 'food', type: 'resource' },
    { id: 1, resource: 'energy', type: 'resource' },
    { id: 2, resource: 'mineral', type: 'resource' },
    { id: 3, resource: 'alloys', type: 'resource' },
    { id: 4, resource: 'consumer_goods', type: 'resource' },
    { id: 5, type: 'job', job: 'farmer' }, // -> 0,
    { id: 6, type: 'job', job: 'technician' }, // -> 1
    { id: 7, type: 'job', job: 'miner' }, // ->2
    { id: 8, type: 'job', job: 'foundry' }, // -> 3   ;  <- 2
    { id: 9, type: 'job', job: 'artisan' } // ->4    ;  <- 2
  ],
  job_resources: MockJobResource
}
