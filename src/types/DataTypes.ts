import type { LinkType, NodeType } from '@/types/SimulationTypes'
export type ResourceType = 'food' | 'energy' | 'mineral' | 'alloys'

export interface MockData {
  links: LinkType[]
  nodes: NodeType[]
}

export const mock_data: MockData = {
  links: [
    { source: 0, target: 2, value: 1 },
    { source: 1, target: 2, value: 1 },
    { source: 3, target: 2, value: 1 }
  ],
  nodes: [
    { id: 0, name: 'food' },
    { id: 1, name: 'energy' },
    { id: 2, name: 'mineral' },
    { id: 3, name: 'alloys' }
  ]
}
