import type { INodeDatum } from '@/types'

export interface IGridCellType {
  x: number
  y: number
  occupied: boolean
}

export interface IGrid {
  cells: IGridCellType[]
  init: { (): void }
  sqdist: { (a: INodeDatum, b: IGridCellType): number }
  occupyNearest: { (p: INodeDatum): IGridCellType | null }
}

export function buildGrid(width: number, height: number, grid_size: number): IGrid {
  return {
    cells: [] as IGridCellType[],

    init: function () {
      this.cells = []
      for (let i = 0; i < width / grid_size; i++) {
        for (let j = 0; j < height / grid_size; j++) {
          // HACK: ^should be a better way to determine number of rows and cols
          // let cell

          const cell: IGridCellType = {
            x: i * grid_size + (j % 2) * grid_size * 0.5,
            y: j * grid_size * 0.85,
            occupied: false
          }
          this.cells.push(cell)
        }
      }
    },

    sqdist: function (a: INodeDatum, b: IGridCellType): number {
      return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)
    },

    occupyNearest: function (p: INodeDatum) {
      let minDist: number = 1000000
      let d: number
      let candidate: IGridCellType | null = null

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
