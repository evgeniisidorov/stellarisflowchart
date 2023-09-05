import type { ILinkDatum, INodeDatum } from '@/types'
import { RESOURCES, type JobType, type ResourceType, JOBS } from '@/types/DataTypes'

export async function getData() {
  const data: Record<JobType, Record<ResourceType, number>> = await fetch(
    '/src/assets/jobresource.json'
  ).then((res) => res.json())

  return data
}

export function getIndecies() {
  const namesList: string[] = ([] as string[]).concat(RESOURCES).concat(JOBS)
  return namesList.reduce(
    (prev, cur, currentIndex) => {
      prev[cur] = currentIndex
      return prev
    },
    {} as Record<string, number>
  )
}

export function getNodes(
  data: Readonly<Record<JobType, Record<ResourceType, number>>>
): INodeDatum[] {
  const namesRecords = getIndecies()
  const nodes: INodeDatum[] = []

  RESOURCES.map((d) => {
    const resourceNode: INodeDatum = {
      id: namesRecords[d],
      type: 'resource',
      resource: d as ResourceType
    }
    nodes.push(resourceNode)
  })

  for (const job in data) {
    const jobNode: INodeDatum = { id: namesRecords[job], type: 'job', job: job as JobType }
    nodes.push(jobNode)
  }

  return nodes
}

export function getLinks(
  data: Readonly<Record<JobType, Record<ResourceType, number>>>
): ILinkDatum[] {
  const namesRecords = getIndecies()
  const links: ILinkDatum[] = []
  for (const job in data) {
    const jobId = namesRecords[job]

    for (const resource in data[job as JobType]) {
      const link: ILinkDatum = {
        source: jobId,
        target: namesRecords[resource],
        value: data[job as JobType][resource as ResourceType]
      }
      links.push(link)
    }
  }
  return links
}
