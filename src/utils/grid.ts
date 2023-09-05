import type { INodeDatum } from '@/types'

export interface IGridCell {
  x: number
  y: number
  occupied: boolean
}

export interface IGrid {
  cells: IGridCell[]
  init: { (): void }
  sqdist: { (a: INodeDatum, b: IGridCell): number }
  occupyNearest: { (p: INodeDatum): IGridCell | null }
}

export function buildGrid(width: number, height: number, grid_size: number): IGrid {
  return {
    cells: [] as IGridCell[],

    init: function () {
      this.cells = []
      for (let i = 0; i < width / grid_size; i++) {
        for (let j = 0; j < height / grid_size; j++) {
          // HACK: ^should be a better way to determine number of rows and cols
          // let cell

          const cell: IGridCell = {
            x: i * grid_size + grid_size / 4,
            y: j * grid_size + grid_size / 4,
            occupied: false
          }
          this.cells.push(cell)
        }
      }
    },

    sqdist: function (a: INodeDatum, b: IGridCell): number {
      return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)
    },

    occupyNearest: function (p: INodeDatum) {
      let minDist: number = 1000000
      let d: number
      let candidate: IGridCell | null = null

      for (let i = 0; i < this.cells.length; i++) {
        if (!this.cells[i].occupied && (d = this.sqdist(p, this.cells[i])) < minDist) {
          minDist = d
          candidate = this.cells[i]
        }
      }
      if (candidate) {
        candidate.occupied = true
      }
      return candidate
    }
  }
}
