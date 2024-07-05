import { BOARD_SPACING } from './app'
import type { Game } from './game'

export class Grid {
  // initialization concerns
  /** The number of rows in the grid */
  private _rowCount: number
  /** The number of columns in the grid */
  private _columnCount: number
  /** The spacing between the tiles in the grid */
  private _boardSpacing: number
  /** The game instance */
  private _game: Game
  /** An array that maps the grid to its transposition */
  private _transpositionMap: number[]

  // grid state
  /** The grid data */
  private _grid: number[]
  /** Whether the grid has been modified */
  private _isDirty: boolean
  /** Whether the grid has any valid moves remaining */
  private _hasMovesToMake: boolean
  /** The highest value in the grid */
  private _highestValue: number

  constructor({
    boardSpacing,
    columnCount,
    gameReference,
    rowCount,
  }: {
    boardSpacing: number
    columnCount: number
    gameReference: Game
    rowCount: number
  }) {
    this._rowCount = rowCount
    this._columnCount = columnCount
    this._game = gameReference

    this._isDirty = false
    this._hasMovesToMake = true
    this._highestValue = 0
    this._boardSpacing = boardSpacing
    this._grid = new Array(rowCount * columnCount).fill(0)
    this._transpositionMap = this._createTranspositionMap(rowCount, columnCount)
  }

  public get grid() {
    return this._grid
  }
  public get isDirty() {
    return this._isDirty
  }
  public get hasMovesToMake() {
    return this._hasMovesToMake
  }
  public get highestValue() {
    return this._highestValue
  }

  /**
   * @description Adds a new tile to a random position in the grid
   */
  public addNewTile() {
    const cellsAvailable = this._grid
      .map((value, index) => (value === 0 ? index : null))
      .filter(Boolean)

    if (cellsAvailable.length === 0) return

    const randomCell =
      cellsAvailable[Math.floor(Math.random() * cellsAvailable.length)]

    if (randomCell && randomCell < this._grid.length) {
      this._grid[randomCell] = Math.random() > 0.1 ? 2 : 4
    }
  }
  /**
   * @description Creates a shallow clone of the grid
   * @returns A copy of the grid
   */
  public makeCopy() {
    const newGrid = new Grid({
      boardSpacing: this._boardSpacing,
      columnCount: this._columnCount,
      gameReference: this._game,
      rowCount: this._rowCount,
    })
    for (let index = 0; index < this._grid.length; index++) {
      newGrid.updateCell({ index, value: this._grid[index] })
    }

    return newGrid.grid
  }
  /**
   * @description Draws the gameboard to the canvas
   * @param renderer The canvas context to draw to
   */
  public render(renderer: CanvasRenderingContext2D) {
    this._boardSpacing = renderer.canvas.width * BOARD_SPACING
    const offsetSpacing = (this._columnCount + 1) * this._boardSpacing
    const cellWidth =
      (renderer.canvas.width - offsetSpacing) / this._columnCount
    const cellHeight = (renderer.canvas.height - offsetSpacing) / this._rowCount

    for (let index = 0; index < this._grid.length; index++) {
      const cellValue = this._grid[index]
      const xPosition =
        (index % this._columnCount) * cellWidth +
        ((index % this._columnCount) + 1) * this._boardSpacing
      const yPosition =
        Math.floor(index / this._columnCount) * cellHeight +
        (Math.floor(index / this._columnCount) + 1) * this._boardSpacing

      // render the cell's border
      // renderer.fillStyle = 'transparent'
      // renderer.lineWidth = 2
      // renderer.strokeStyle = '#fff'
      // renderer.roundRect(xPosition, yPosition, cellWidth, cellHeight, 16)
      // renderer.stroke()

      // render the cell's value
      if (cellValue > 0) {
        renderer.textAlign = 'center'
        renderer.fillStyle = '#000'
        renderer.font = 'bold 2rem sans-serif'
        renderer.fillText(
          cellValue.toString(),
          xPosition + cellWidth / 2,
          yPosition + cellHeight / 2
        )
      }
    }

    this._isDirty = false
  }
  /**
   * @description Slides the tiles in a given direction
   * @param direction The direction to slide the tiles in
   */
  public slideTiles(direction: 'down' | 'left' | 'right' | 'up') {
    let undoReverse = false
    let undoTranspose = false

    switch (direction) {
      case 'up':
        undoTranspose = true
        undoReverse = true
        this._transposeGrid()
        this._reverseGrid()
        break
      case 'down':
        undoTranspose = true
        this._transposeGrid()
        break
      case 'left':
        undoReverse = true
        this._reverseGrid()
        break
      default:
        break
    }
    console.log(
      'undo reverse: ',
      undoReverse,
      'undo transpose: ',
      undoTranspose
    )
    const previousBoard = this.makeCopy()
    this._collapse()
    const changed = this._detectChange(previousBoard, this._grid)
    if (undoReverse) this._reverseGrid()
    if (undoTranspose) this._transposeGrid()
    if (changed) {
      this._highestValue = this._grid.reduce((a, b) => Math.max(a, b), 0)
      this.addNewTile()
      this._isDirty = true
    }
  }
  /**
   * @description Updates the value of a cell in the grid
   * @param record A record containing the index of the cell to update, and the value to set it to
   */
  public updateCell({ index, value }: { index: number; value: number }) {
    this._grid[index] = value
  }

  /**
   * @description Shifts all filled cells to the right, and combines pairs within the row
   */
  private _collapse() {
    let gridRows: Array<Array<(typeof this._grid)[number]>> = []

    for (
      let row = 0;
      row < this._columnCount * this._rowCount;
      row += this._columnCount
    ) {
      gridRows.push(this._grid.slice(row, row + this._columnCount))
    }
    for (const row in gridRows) {
      gridRows[row] = this._slide(this._combine(this._slide(gridRows[row])))
    }
    this._grid = gridRows.flat()
  }

  /**
   * @description Compares two grids to see if they are different
   * @param board1 A grid to compare against
   * @param board2 A grid to compare against
   * @returns Whether the grids are different
   */
  private _detectChange(board1: typeof this._grid, board2: typeof this._grid) {
    return !board1.every((value, index) => value === board2[index])
  }
  /**
   * @description Reverses the values of the rows in the grid
   */
  private _reverseGrid() {
    console.log('reverse grid')
    let index = 0,
      tempValue = -1
    while (index < this._grid.length) {
      if (index % this._columnCount === 0) {
        tempValue = this._grid[index]
        this._grid[index] = this._grid[index + this._columnCount - 1]
        this._grid[index + this._columnCount - 1] = tempValue
        index++
      } else {
        tempValue = this._grid[index]
        this._grid[index] = this._grid[index + 1]
        this._grid[index + 1] = tempValue
        index += this._columnCount - 1
      }
    }
  }
  /**
   * @description Transposes the values in the grid
   */
  private _transposeGrid() {
    this._grid = this._transpositionMap.map(index => this._grid[index])
  }
  /**
   * @description Slides all filled cells to the right
   * @param row The array to act upon
   * @returns
   */
  private _slide(
    row: Array<(typeof this._grid)[number]>
  ): Array<(typeof this._grid)[number]> {
    let slidRow = row.filter(Boolean)

    return [...Array(this._columnCount - slidRow.length).fill(0), ...slidRow]
  }
  /**
   * @description Combines the first pair filled cells in the row, and adds the value to the score
   * @param row The array to act upon
   */
  private _combine(row: number[]) {
    console.log('combining row', row)
    for (let i = this._columnCount - 1; i > 0; i--) {
      if (row[i] !== row[i - 1]) continue

      console.log(
        `combining ${row[i]} and ${row[i - 1]} = ${row[i] + row[i - 1]}`
      )
      row[i] = row[i] + row[i - 1]
      row[i - 1] = 0

      console.log('value', row[i], typeof row[i])
      if (row[i]) this._game.setScore(row[i])
    }

    return row
  }
  private _createTranspositionMap(rowCount: number, columnCount: number) {
    console.log('creating map', rowCount, columnCount)
    const map = new Array(rowCount * columnCount)
      .fill(0)
      .map((_, index) => index)
    const output: number[] = []

    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col < columnCount; col++) {
        output[col * rowCount + row] = map[row * columnCount + col]
        output[row * columnCount + col] = map[col * rowCount + row]
      }
    }
    return output
  }
}
