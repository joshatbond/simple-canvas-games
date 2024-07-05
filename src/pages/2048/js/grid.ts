export class Grid {
  public grid: number[][]

  constructor(rowLength: number) {
    this.grid = new Array(rowLength)
      .fill(0)
      .map(() => new Array(rowLength).fill(0))
  }

  public addNew(grid: number[][]) {
    const options: { x: number; y: number }[] = []

    for (let row = 0; row < grid.length; row++) {
      for (let cell = 0; cell < grid[row].length; cell++) {
        if (grid[row][cell] === 0) {
          options.push({ x: row, y: cell })
        }
      }
    }

    if (options.length === 0) return grid

    const spot = options[Math.floor(Math.random() * options.length)]
    grid[spot.x][spot.y] = Math.random() > 0.1 ? 2 : 4

    return grid
  }

  public makeCopy(grid: number[][]) {
    const newGrid = new Grid(grid[0].length)
    const copyGrid = newGrid.grid

    for (let row = 0; row < grid.length; row++) {
      for (let cell = 0; cell < grid[row].length; cell++) {
        copyGrid[row][cell] = grid[row][cell]
      }
    }

    return copyGrid
  }
  public reverseGrid(grid: number[][]) {
    for (var row in grid) {
      grid[row].reverse()
    }
    return grid
  }
  public transposeGrid(grid: number[][]) {
    const newGrid = new Grid(grid[0].length)
    const transposedGrid = newGrid.grid

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        transposedGrid[row][col] = grid[col][row]
      }
    }

    return transposedGrid
  }
}
