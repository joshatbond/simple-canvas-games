import type { Game } from './game'

export class Grid {
  private cellCount: number
  private _grid: number[][]
  private _game: Game
  private _isDirty: boolean

  constructor(rowLength: number, game: Game) {
    this.cellCount = rowLength
    this._game = game
    this._isDirty = false
    this._grid = new Array(rowLength)
      .fill(0)
      .map(() => new Array(rowLength).fill(0))
  }

  public get grid() {
    return this._grid
  }
  public get isDirty() {
    return this._isDirty
  }

  public addNewTile() {
    const options: { x: number; y: number }[] = []

    for (let row = 0; row < this._grid.length; row++) {
      for (let cell = 0; cell < this._grid[row].length; cell++) {
        if (this._grid[row][cell] === 0) {
          options.push({ x: row, y: cell })
        }
      }
    }

    if (options.length === 0) return this._grid

    const spot = options[Math.floor(Math.random() * options.length)]
    this._grid[spot.x][spot.y] = Math.random() > 0.1 ? 2 : 4
  }

  public updateCell({
    column,
    row,
    value,
  }: {
    column: number
    row: number
    value: number
  }) {
    this._grid[row][column] = value
  }

  public makeCopy() {
    const newGrid = new Grid(this._grid[0].length, this._game)

    for (let row = 0; row < this._grid.length; row++) {
      for (let column = 0; column < this._grid[row].length; column++) {
        newGrid.updateCell({ column, row, value: this._grid[row][column] })
      }
    }

    return newGrid._grid
  }
  public reverseGrid() {
    for (var row in this._grid) {
      this._grid[row].reverse()
    }
  }
  private transposeGrid() {
    let tempValue = -1

    for (let row = 0; row < this._grid.length; row++) {
      for (let col = 0; col < this._grid[row].length; col++) {
        tempValue = this._grid[row][col]
        this._grid[row][col] = this._grid[col][row]
        this._grid[col][row] = tempValue
      }
    }
  }
  public slideTiles(direction: 'down' | 'left' | 'right' | 'up') {
    let undoReverse = false
    let undoTranspose = false

    switch (direction) {
      case 'up':
        undoReverse = true
        this.reverseGrid()
        break
      case 'right':
        undoTranspose = true
        this.transposeGrid()
        break
      case 'left':
        undoReverse = true
        undoTranspose = true
        this.transposeGrid()
        this.reverseGrid()
        break
      default:
        break
    }
    const previousBoard = this.makeCopy()
    this._collapse()
    const changed = this._compare(previousBoard, this._grid)
    if (undoReverse) this.reverseGrid()
    if (undoTranspose) this.transposeGrid()
    if (changed) {
      this.addNewTile()
      this._isDirty = true
    }
  }
  /**
   * @description Draws the gameboard to the canvas
   */
  public render(renderer: CanvasRenderingContext2D) {
    const cellWidth = renderer.canvas.width / this.cellCount
    const cellHeight = renderer.canvas.height / this.cellCount

    for (let row = 0; row < this.cellCount; row++) {
      for (let col = 0; col < this._grid[row].length; col++) {
        const cellValue = this._grid[row][col]
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

    this._isDirty = false
  }

  /**
   * @description Shifts all filled cells to the right, and combines pairs within the row
   */
  private _collapse() {
    for (const row in this._grid) {
      this._grid[row] = this._slide(this._combine(this._slide(this._grid[row])))
    }
  }
  /**
   * @description Combines the first pair filled cells in the row, and adds the value to the score
   * @param row The array to act upon
   */
  private _combine(row: number[]) {
    for (let i = this.cellCount - 1; i > 0; i--) {
      if (row[i] !== row[i - 1] || (row[i] === 0 && row[i - 1] === 0)) continue

      row[i] = row[i] + row[i - 1]
      row[i - 1] = 0

      this._game.score += row[i]
    }

    return row
  }
  /**
   * @description Compares two grids to see if they are the same
   * @param board1 The first grid to compare
   * @param board2 The second grid to compare
   * @returns True if the grids are the same, false otherwise
   */
  private _compare(board1: number[][], board2: number[][]) {
    for (const row in board1) {
      for (const cell in board1[row]) {
        if (board1[row][cell] !== board2[row][cell]) return true
      }
    }

    return false
  }
  /**
   * @description Slides all filled cells to the right
   * @param row The array to act upon
   * @returns
   */
  private _slide(row: number[]): number[] {
    let slidRow = row.filter(Boolean)

    return [...Array(this.cellCount - slidRow.length).fill(0), ...slidRow]
  }
}
