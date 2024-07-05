export class Grid {
  private cellCount: number
  private grid: number[][]

  constructor(rowLength: number) {
    this.cellCount = rowLength
    this.grid = new Array(rowLength)
      .fill(0)
      .map(() => new Array(rowLength).fill(0))
  }

  public addNewTile() {
    const options: { x: number; y: number }[] = []

    for (let row = 0; row < this.grid.length; row++) {
      for (let cell = 0; cell < this.grid[row].length; cell++) {
        if (this.grid[row][cell] === 0) {
          options.push({ x: row, y: cell })
        }
      }
    }

    if (options.length === 0) return this.grid

    const spot = options[Math.floor(Math.random() * options.length)]
    this.grid[spot.x][spot.y] = Math.random() > 0.1 ? 2 : 4
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
  /**
   * @description Draws the gameboard to the canvas
   */
  public render(renderer: CanvasRenderingContext2D) {
    const cellWidth = renderer.canvas.width / this.cellCount
    const cellHeight = renderer.canvas.height / this.cellCount

    for (let row = 0; row < this.cellCount; row++) {
      for (let col = 0; col < this.grid[row].length; col++) {
        const cellValue = this.grid[row][col]
        renderer.fillStyle = 'transparent'
        renderer.lineWidth = 2
        renderer.strokeStyle = '#fff'
        renderer.rect(row * cellWidth, col * cellHeight, cellWidth, cellHeight)
        renderer.stroke()

        if (cellValue > 0) {
          renderer.textAlign = 'center'
          renderer.fillStyle = '#fff'
          renderer.font = 'bold 2rem sans-serif'
          renderer.fillText(
            cellValue.toString(),
            row * cellWidth + cellWidth / 2,
            col * cellHeight + cellHeight / 2
          )
        }
      }
    }
  }
}
