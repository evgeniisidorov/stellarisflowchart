<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import * as d3 from 'd3'

const GRID_SIZE = 64

interface NodeType {
  id: number
  index?: number
  x?: number
  y?: number
  vx?: number
  vy?: number
  name?: ResourceType
}

type ResourceType = 'food' | 'energy' | 'mineral' | 'alloys'

interface LinkType {
  source: number
  target: number
  value: number
  index?: number
}

const data = {
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

const height: number = 360
const width: number = 360
const canvas: Ref<HTMLDivElement | null> = ref(null)

let graph: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  link: any,
  node: any,
  simulation: any

const links: Array<LinkType> = data.links.map((d) => ({ ...d }) as LinkType)
const nodes: Array<NodeType> = data.nodes.map((d) => ({ ...d }) as NodeType)

const color = d3.scaleOrdinal(d3.schemeCategory10)

const ticked = () => {
  link
    .attr('x1', (d: any) => d.source.x)
    .attr('y1', (d: any) => d.source.y)
    .attr('x2', (d: any) => d.target.x)
    .attr('y2', (d: any) => d.target.y)

  node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y)
}

onMounted(() => {
  console.log(`the component is now mounted.`)

  graph = d3.select(canvas.value).append('svg').attr('width', width).attr('height', height)

  link = graph
    .append('g')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .selectAll()
    .data(links)
    .join('line')
    .attr('stroke-width', (d: LinkType) => Math.sqrt(d.value))

  node = graph
    .append('g')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5)
    .selectAll()
    .data(nodes)
    .join('circle')
    .attr('r', 8)
    .attr('fill', '#4f1')

  simulation = d3
    .forceSimulation(nodes)
    .force(
      'link',
      d3.forceLink(links).id((d: any) => d.id)
    )
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(width / 2, height / 2))
    .on('tick', ticked)

  var grid = (function (width, height) {
    return {
      cells: [] as any[],

      init: function () {
        this.cells = []
        for (var i = 0; i < width / GRID_SIZE; i++) {
          for (var j = 0; j < height / GRID_SIZE; j++) {
            // HACK: ^should be a better way to determine number of rows and cols
            var cell

            cell = {
              x: i * GRID_SIZE + (j % 2) * GRID_SIZE * 0.5,
              y: j * GRID_SIZE * 0.85
            }
            this.cells.push(cell)
          }
        }
      },

      sqdist: function (a: any, b: any): number {
        return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)
      },

      occupyNearest: function (p: any) {
        var minDist = 1000000
        var d
        var candidate = null
        for (var i = 0; i < this.cells.length; i++) {
          if (!this.cells[i].occupied && (d = this.sqdist(p, this.cells[i])) < minDist) {
            minDist = d
            candidate = this.cells[i]
          }
        }
        if (candidate) candidate.occupied = true
        return candidate
      }
    }
  })(width, height)

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

  node.call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended))

  var updateLink = function (selection: any) {
    selection
      .attr('x1', function (d: any) {
        return d.source.screenX
      })
      .attr('y1', function (d: any) {
        return d.source.screenY
      })
      .attr('x2', function (d: any) {
        return d.target.screenX
      })
      .attr('y2', function (d: any) {
        return d.target.screenY
      })
  }

  var updateNode = function (selection: any) {
    selection.attr('transform', function (d: any) {
      var gridpoint = grid.occupyNearest(d)

      if (gridpoint) {
        d.screenX = d.screenX || gridpoint.x
        d.screenY = d.screenY || gridpoint.y
        d.screenX += (gridpoint.x - d.screenX) * 0.2
        d.screenY += (gridpoint.y - d.screenY) * 0.2

        d.x += (gridpoint.x - d.x) * 0.05
        d.y += (gridpoint.y - d.y) * 0.05
      }

      return 'translate(' + d.screenX + ',' + d.screenY + ')'
    })
  }

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
})
</script>

<template>
  <div ref="canvas" />
</template>
