<script lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import { type INodeDatum, type ILinkDatum, mock_data as data } from '@/types'
import { GRID_SIZE, CANVAS_HEIGHT, CANVAS_WIDTH, ICON_SIZE } from '@/utils/constants'
import * as d3 from 'd3'
import { buildGrid, type IGrid } from '@/utils/grid'
import { getData, getLinks, getNodes } from '@/utils/data'
</script>

<script setup lang="ts">
const canvas: Ref<HTMLDivElement | null> = ref(null)

let graph: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  link: d3.Selection<SVGLineElement, ILinkDatum, SVGGElement, undefined>,
  node: d3.Selection<SVGGElement, INodeDatum, SVGGElement, undefined>,
  simulation: d3.Simulation<INodeDatum, ILinkDatum>

let nodes: Array<INodeDatum>
let links: Array<ILinkDatum>

const grid: IGrid = buildGrid(CANVAS_WIDTH, CANVAS_HEIGHT, GRID_SIZE)

function ticked() {
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

function updateLink(
  selection: d3.Selection<SVGLineElement, ILinkDatum, SVGGElement, undefined>
): void {
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

function updateNode(
  selection: d3.Selection<SVGGElement, INodeDatum, SVGGElement, undefined>
): void {
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

function dragstarted(event: any) {
  if (!event.active) simulation.alphaTarget(0.3).restart()
  event.subject.fx = event.subject.x
  event.subject.fy = event.subject.y
}

// Update the subject (dragged node) position during drag.
function dragged(event: any) {
  event.subject.fx = event.x
  event.subject.fy = event.y
}

// Restore the target alpha so the simulation cools after dragging ends.
// Unfix the subject position now that it’s no longer being dragged.
function dragended(event: any) {
  if (!event.active) simulation.alphaTarget(0)
  event.subject.fx = null
  event.subject.fy = null
}

function enterNodes(
  enter: d3.Selection<d3.EnterElement, INodeDatum, SVGGElement, unknown>
): d3.Selection<SVGGElement, INodeDatum, SVGGElement, unknown> {
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
      let iconName
      switch (datum.type) {
        case 'resource':
          iconName = datum.resource
          break
        case 'job':
          iconName = 'job_' + String(datum.job)
          break
      }

      const imageUrl = new URL(`../assets/icons/${datum.type}/${iconName}.png`, import.meta.url)
      return imageUrl.href
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

function updateData(newNode: INodeDatum): void {
  const oldNodes: INodeDatum[] = node.data()
  oldNodes.push(newNode)

  node = node.data(oldNodes).join(enterNodes)
  simulation = simulation.nodes(oldNodes)
  simulation.restart()
}

function graphInit() {
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
    .join('line')
    .attr('stroke-width', (d: ILinkDatum) => Math.sqrt(Math.abs(d.value)))
    .attr('stroke', (datum: ILinkDatum) => (datum.value > 0 ? 'green' : 'red'))

  node = graph.append('g').selectAll<SVGSVGElement, INodeDatum>('g').data(nodes).join(enterNodes)

  simulation = d3
    .forceSimulation<INodeDatum>(nodes)
    .force(
      'link',
      d3.forceLink(links).id((d: d3.SimulationNodeDatum, i: number): number => {
        return d.index || 0
      })
    )
    .force('charge', d3.forceManyBody<INodeDatum>())
    .force('collide', d3.forceCollide<INodeDatum>(30))
    .force('center', d3.forceCenter<INodeDatum>(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2))
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

    node.call(updateNode)
    link.call(updateLink)
  })
}

onMounted(() => {
  getData()
    .then((data) => {
      nodes = getNodes(data)
      links = getLinks(data)
    })
    .then(() => graphInit())
})

function addNode() {
  const newNode: INodeDatum = { id: 100, type: 'job', job: 'farmer' }

  updateData(newNode)
}

function removeNode() {
  const oldNodes = node.data().filter((d) => d.id !== 100)

  node = node.data(oldNodes).join(enterNodes, (update) => update, exit => exit.remove())
  simulation = simulation.nodes(oldNodes)
  simulation.restart()
}
</script>

<template>
  <div>
    <button @click="addNode">Add Node</button>
    <button @click="removeNode">Remove Node</button>
  </div>
  <div ref="canvas" />
</template>
