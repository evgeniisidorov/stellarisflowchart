import type { INodeDatum, IJobResource, JobType, ILinkDatum, ResourceType } from '@/types'

export type JobResource = JobType | ResourceType

/*
 * Create the dictionary from nodes: Job/Resource -> number (node.id)
 */
function buildJobIndexDict(nodes: INodeDatum[]): Record<JobResource, number> {
  const record: Record<JobResource, number> = {
    food: 0,
    energy: 1,
    mineral: 2,
    alloys: 3,
    consumer_goods: 4,
    farmer: 5,
    technician: 6,
    miner: 7,
    foundry: 8,
    artisan: 9
  }
  return record
}

export function buildLinks(nodes: INodeDatum[], job_resources: IJobResource[]): ILinkDatum[] {
  const selectedNodes: INodeDatum[] = nodes.filter((d: INodeDatum) => d.type === 'job')
  const newLinks: ILinkDatum[] = []
  const record: Record<JobResource, number> = buildJobIndexDict(nodes)

  console.log(selectedNodes.length)
  for (let i = 0; i < selectedNodes.length; i++) {
    const production: IJobResource[] = job_resources.filter(
      (d: IJobResource) => d.job === selectedNodes[i].job
    )
    const links: ILinkDatum[] = production.map((d: IJobResource) => {
      return { value: d.value, source: record[d.job], target: record[d.resource] }
    })
    links.map((l) => newLinks.push(l))
  }

  return newLinks
}
