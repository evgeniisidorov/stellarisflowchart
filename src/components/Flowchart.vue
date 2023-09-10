<script lang="ts">
import { onMounted, ref, watch, type Ref } from 'vue'
import { type INodeDatum, type ILinkDatum, type JobType } from '@/types'
import { GRID_SIZE, CANVAS_HEIGHT, CANVAS_WIDTH, ICON_SIZE } from '@/utils/constants'
import * as d3 from 'd3'
import { buildGrid, type IGrid } from '@/utils/grid'
import { selectedJobs } from '@/utils/store'
</script>

<script setup lang="ts">
const canvas: Ref<HTMLDivElement | null> = ref(null)

let graph: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  link: d3.Selection<SVGLineElement, ILinkDatum, SVGGElement, undefined>,
  node: d3.Selection<SVGGElement, INodeDatum, SVGGElement, undefined>,
  simulation: d3.Simulation<INodeDatum, ILinkDatum>

let nodes: Array<INodeDatum>
let links: Array<ILinkDatum>
let data

const grid: IGrid = buildGrid(CANVAS_WIDTH, CANVAS_HEIGHT, GRID_SIZE)

const ticked = () => {
  link
    .attr('x1', (d: ILinkDatum): number => (d.source as INodeDatum).x || 0)
    .attr('y1', (d: ILinkDatum): number => (d.source as INodeDatum).y || 0)
    .attr('x2', (d: ILinkDatum): number => (d.source as INodeDatum).x || 0)
    .attr('y2', (d: ILinkDatum): number => (d.source as INodeDatum).y || 0)
  node
    .attr('cx', (d: INodeDatum) => {
      return d.x || 0
    })
    .attr('cy', (d: INodeDatum) => d.y || 0)
}

const transformLinkCoordinate = (
  selection: d3.Selection<SVGLineElement, ILinkDatum, SVGGElement, undefined>
): void => {
  selection
    .attr('x1', function (d: ILinkDatum): number {
      return (d.source as INodeDatum).screenX || 0
    })
    .attr('y1', function (d: ILinkDatum): number {
      return (d.source as INodeDatum).screenY || 0
    })
    .attr('x2', function (d: ILinkDatum): number {
      return (d.target as INodeDatum).screenX || 0
    })
    .attr('y2', function (d: ILinkDatum): number {
      return (d.target as INodeDatum).screenY || 0
    })
}

const transformNodeCoordinates = (
  selection: d3.Selection<SVGGElement, INodeDatum, SVGGElement, undefined>
): void => {
  selection.attr('transform', function (d: INodeDatum): string {
    const gridpoint = grid.occupyNearest(d)

    if (gridpoint) {
      d.screenX = d.screenX || gridpoint.x
      d.screenY = d.screenY || gridpoint.y
      d.screenX += (gridpoint.x - d.screenX) * 0.2
      d.screenY += (gridpoint.y - d.screenY) * 0.2

      if (d.x) d.x += (gridpoint.x - d.x) * 0.05
      if (d.y) d.y += (gridpoint.y - d.y) * 0.05
    }
    return (
      'translate(' +
      (d.screenX ? d.screenX : 0) + // must account for centering element
      ',' +
      (d.screenY ? d.screenY : 0) +
      ')'
    )
  })
}

const dragstarted = (event: any) => {
  if (!event.active) simulation.alphaTarget(0.3).restart()
  event.subject.fx = event.subject.x
  event.subject.fy = event.subject.y
}

// Update the subject (dragged node) position during drag.
const dragged = (event: any) => {
  event.subject.fx = event.x
  event.subject.fy = event.y
}

// Restore the target alpha so the simulation cools after dragging ends.
// Unfix the subject position now that it’s no longer being dragged.
const dragended = (event: any) => {
  if (!event.active) simulation.alphaTarget(0)
  event.subject.fx = null
  event.subject.fy = null
}

const enterLinks = (
  enter: d3.Selection<d3.EnterElement, ILinkDatum, SVGGElement, unknown>
): d3.Selection<SVGLineElement, ILinkDatum, SVGGElement, unknown> => {
  const container = enter
    .append('line')
    .attr('stroke-width', (d: ILinkDatum) => Math.sqrt(Math.abs(d.value)))
    .attr('stroke', (datum: ILinkDatum) => (datum.value > 0 ? 'green' : 'red'))

  return container
}

const enterNodes = (
  enter: d3.Selection<d3.EnterElement, INodeDatum, SVGGElement, unknown>
): d3.Selection<SVGGElement, INodeDatum, SVGGElement, unknown> => {
  const container = enter.append('g').attr('class', 'nodeContainer')
  container
    .append('circle')
    .attr('r', ICON_SIZE / 2)
    .style('fill', '#20381E')
    .attr('stroke', '#101814')
    .attr('stroke-width', 1.5)

  container
    .append('image')
    .attr('href', (datum: INodeDatum) => {
      switch (datum.type) {
        case 'job': {
          const url = `../assets/icons/job/job_${datum.name}.png`
          const imageUrl = new URL(url, import.meta.url)
          return imageUrl.href
        }
        case 'resource':
          return new URL(`../assets/icons/resource/${datum.name}.png`, import.meta.url).href
        default: {
          return ''
        }
      }
    })
    .attr('width', ICON_SIZE)
    .attr('height', ICON_SIZE)
    .attr('transform', `translate(${-ICON_SIZE / 2},${-ICON_SIZE / 2})`)

  container.call(
    d3
      .drag<SVGGElement, INodeDatum, undefined>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended)
  )
  return container
}

const graphInit = () => {
  graph = d3
    .select(canvas.value)
    .append('svg')
    .attr('width', CANVAS_WIDTH)
    .attr('height', CANVAS_HEIGHT)

  link = graph
    .append('g')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .selectAll<SVGLineElement, ILinkDatum>('line')
    .data(links)
    .join(enterLinks)

  node = graph
    .append('g')
    .selectAll<SVGSVGElement, INodeDatum>('g')
    .data(nodes, (d) => d.name)
    .join(enterNodes)

  simulation = d3
    .forceSimulation<INodeDatum>(nodes)
    .force(
      'link',
      d3.forceLink<INodeDatum, ILinkDatum>(links).id((d: INodeDatum, i: number): string => {
        return d.name
      })
    )
    .force('charge', d3.forceManyBody<INodeDatum>())
    .force('collide', d3.forceCollide<INodeDatum>(5))
    .force('centerX', d3.forceX<INodeDatum>(CANVAS_WIDTH / 2))
    .force('centerY', d3.forceY<INodeDatum>(CANVAS_HEIGHT / 2))
    .on('tick', ticked)

  simulation.on('tick', function () {
    graph.select('g.gridcanvas').remove()
    grid.init()

    const gridCanvas = graph
      .append('svg:g')
      .attr('class', 'gridcanvas')
      .attr('width', GRID_SIZE)
      .attr('height', GRID_SIZE)

    grid.cells.forEach((c) => {
      gridCanvas
        .append('svg:circle')
        .attr('cx', c.x)
        .attr('cy', c.y)
        .attr('r', 2)
        .style('fill', '#555')
        .style('opacity', 0.3)
      return
    })

    node.call(transformNodeCoordinates)
    link.call(transformLinkCoordinate)
  })
}

onMounted(() => {
  d3.csv(new URL(`../assets/data.csv`, import.meta.url).href)
    .then((r) => {
      data = r
      nodes = []
      links = []
    })
    .then(() => {
      graphInit()
    })
})

watch(selectedJobs, () => {
  const remaningNodes = node.data().filter((d) => {
    if (d.type === 'resource') return true
    else {
      if (selectedJobs.has(d.name)) {
        return true
      } else {
        return false
      }
    }
  })

  const newlyAddedJobs: string[] = []

  selectedJobs.forEach((j) => {
    if (
      !remaningNodes
        .filter((d) => d.type === 'job')
        .map((d) => d.name)
        .includes(j as JobType)
    ) {
      remaningNodes.push({ type: 'job', name: j })
      newlyAddedJobs.push(j)
    }
  })

  const selectedResourceNames: Set<string> = new Set<string>([])
  const remaningJobDesc = data.filter((d) => remaningNodes.map((n) => n.name).includes(d.job))
  remaningJobDesc.map((entry) => {
    const nonZeroResources = Object.entries(entry).filter((x) => x[0] !== 'job' && !!x[1])
    nonZeroResources.map((d) => selectedResourceNames.add(d[0]))
  })

  const removedEmptyResourcesNodes = remaningNodes.filter(
    (d) => d.type === 'job' || selectedResourceNames.has(d.name)
  )

  const prevResourceNames = removedEmptyResourcesNodes
    .filter((d) => d.type === 'resource')
    .map((x) => x.name) // nodes we skip on update

  for (const resourceInQuestion of selectedResourceNames) {
    if (!prevResourceNames.includes(resourceInQuestion)) {
      removedEmptyResourcesNodes.push({ type: 'resource', name: resourceInQuestion })
    }
  }

  /* Links Update goes below. The goal is to
    1) filter out links that have either source (job) or target (resource) missing
    2) iterate over newly added sources i.e jobs
  */

  const existingNodeNames: string[] = removedEmptyResourcesNodes.map((d) => d.name)
  const removedIncompleteLinks = link.data().filter(
    // (d) => existingNodeNames.includes[d.source.name]
    (d) => true
  )

  for (const newJob of newlyAddedJobs) {
    Object.entries(data.filter((d) => d.job === newJob)[0])
      .filter((x) => x[0] !== 'job' && !!x[1])
      .map((r) => {
        removedIncompleteLinks.push({ source: newJob, target: r[0], value: Number(r[1]) })
      })
  }
  const updatedLinks = removedIncompleteLinks.filter((x) =>
    typeof x.source === 'string'
      ? existingNodeNames.includes(x.source)
      : existingNodeNames.includes(x.source.name)
  )

  node = node.data(removedEmptyResourcesNodes, (d) => d.name)
  node = node.join(enterNodes)
  link = link.data(updatedLinks).join(enterLinks)

  simulation.nodes(node.data())
  simulation.force('link').links(link.data())
  simulation.alpha(1.0).restart()
})
</script>

<template>
  <div ref="canvas" />
</template>
