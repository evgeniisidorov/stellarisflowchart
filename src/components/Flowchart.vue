<script lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import { type NodeType, type LinkType, mock_data as data } from '@/types'
import { GRID_SIZE, CANVAS_HEIGHT, CANVAS_WIDTH } from '@/utils/constants'
import * as d3 from 'd3'
import { buildGrid, type IGrid } from '@/utils/grid'
</script>

<script setup lang="ts">
const canvas: Ref<HTMLDivElement | null> = ref(null)

let graph: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  link: d3.Selection<SVGLineElement, LinkType, SVGGElement, undefined>,
  node: d3.Selection<SVGCircleElement, NodeType, SVGGElement, undefined>,
  simulation: d3.Simulation<NodeType, undefined>

const links: Array<LinkType> = data.links.map((d) => ({ ...d }) as LinkType)
const nodes: Array<NodeType> = data.nodes.map((d) => ({ ...d }) as NodeType)

const grid: IGrid = buildGrid(CANVAS_WIDTH, CANVAS_HEIGHT, GRID_SIZE)

function ticked() {
  link
    .attr('x1', (d: LinkType): number => (d.source as NodeType).x || 0)
    .attr('y1', (d: LinkType): number => (d.source as NodeType).y || 0)
    .attr('x2', (d: LinkType): number => (d.source as NodeType).x || 0)
    .attr('y2', (d: LinkType): number => (d.source as NodeType).y || 0)
  node
    .attr('cx', (d: NodeType) => {
      return d.x || 0
    })
    .attr('cy', (d: NodeType) => d.y || 0)
}

function updateLink(
  selection: d3.Selection<SVGLineElement, LinkType, SVGGElement, undefined>
): void {
  selection
    .attr('x1', function (d: LinkType): number {
      return (d.source as NodeType).screenX || 0
    })
    .attr('y1', function (d: LinkType): number {
      return (d.source as NodeType).screenY || 0
    })
    .attr('x2', function (d: LinkType): number {
      return (d.target as NodeType).screenX || 0
    })
    .attr('y2', function (d: LinkType): number {
      return (d.target as NodeType).screenY || 0
    })
}

function updateNode(
  selection: d3.Selection<SVGCircleElement, NodeType, SVGGElement, undefined>
): void {
  selection.attr('transform', function (d: NodeType): string {
    const gridpoint = grid.occupyNearest(d)

    if (gridpoint) {
      d.screenX = d.screenX || gridpoint.x
      d.screenY = d.screenY || gridpoint.y
      d.screenX += (gridpoint.x - d.screenX) * 0.2
      d.screenY += (gridpoint.y - d.screenY) * 0.2

      if (d.x) d.x += (gridpoint.x - d.x) * 0.05
      if (d.y) d.y += (gridpoint.y - d.y) * 0.05
    }
    return 'translate(' + d.screenX + ',' + d.screenY + ')'
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

function addNode() {
  simulation.nodes().push({ id: 4, name: 'food', index: 4 })
  graphUpdate()
  // simulation.restart()
}

function removeNode() {
  simulation.nodes().pop()
  graphUpdate()
}

function graphUpdate() {
  node = node.data(nodes)
  node.exit().remove()

  node = node.enter().append('circle').attr('r', 16).attr('fill', '#4f1').merge(node)

  node.call(
    d3
      .drag<SVGCircleElement, NodeType, undefined>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended)
  )

  simulation.nodes(nodes).restart()
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
    .selectAll<SVGLineElement, LinkType>('line')
    .data(links)
    .join('line')
    .attr('stroke-width', (d: LinkType) => Math.sqrt(d.value))

  node = graph
    .append('g')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5)
    .selectAll<SVGCircleElement, NodeType>('circle')
    .data(nodes)
    .join('circle')
    .attr('r', 8)
    .attr('fill', '#4f1')

  simulation = d3
    .forceSimulation<NodeType>(nodes)
    .force(
      'link',
      d3.forceLink(links).id((d: d3.SimulationNodeDatum, i: number): number => {
        return d.index || 0
      })
    )
    .force('charge', d3.forceManyBody<NodeType>())
    .force('center', d3.forceCenter<NodeType>(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2))
    .on('tick', ticked)

  node.call(
    d3
      .drag<SVGCircleElement, NodeType, undefined>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended)
  )

  simulation.on('tick', function () {
    graph.select('g.gridcanvas').remove()
    grid.init()

    var gridCanvas = graph.append('svg:g').attr('class', 'gridcanvas')

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
  console.log(`the flow chart is now mounted.`)

  graphInit()
})
</script>

<template>
  <div>
    <button @click="addNode">Add Node</button>
    <button @click="removeNode">Remove Node</button>
  </div>
  <div ref="canvas" />
</template>
