import { BOARD_SPACING, colors } from './constants'
import { Tile } from './tile'

export class Board {
  #tiles: Tile[]
  #padding: number
  #renderer: CanvasRenderingContext2D
  #gridSize: number
  #positions: {
    index: number
    x: number
    y: number
    width: number
    height: number
    isEmpty: boolean
  }[]
  isDirty: boolean

  constructor(gridSize: number, renderer: CanvasRenderingContext2D) {
    this.#gridSize = gridSize
    this.#renderer = renderer
    this.#padding = this.#calculatePadding()
    this.#positions = this.#createPositions()
    this.#tiles = []
    this.isDirty = true
  }

  // TODO: This is incomplete, it's currently only checking if all tiles are empty, not if there is a move left to make
  get isFilled() {
    return (
      this.#tiles.length === this.#positions.length &&
      this.#tiles.every(tile => !tile.isDirty)
    )
  }

  addTile() {
    const availablePositions = this.#positions.filter(
      position => position.isEmpty
    )
    if (availablePositions.length === 0) {
      return
    }

    const position =
      availablePositions[Math.floor(Math.random() * availablePositions.length)]
    position.isEmpty = false
    this.#tiles.push(
      new Tile(
        position.x,
        position.y,
        position.width,
        position.height,
        Math.random() > 0.1 ? 2 : 4
      )
    )
    this.isDirty = true
  }
  draw(renderer: CanvasRenderingContext2D) {
    this.#renderer.fillStyle = colors.EMPTY
    this.#renderer.fillRect(0, 0, renderer.canvas.width, renderer.canvas.height)

    for (const position of this.#positions) {
      this.#renderer.beginPath()
      this.#renderer.fillStyle = colors.EMPTY
      this.#renderer.roundRect(
        position.x,
        position.y,
        position.width,
        position.height,
        16
      )
      this.#renderer.fill()
      this.#renderer.closePath()
    }
    for (const tile of this.#tiles) {
      tile.draw(renderer)
    }
    if (this.#tiles.every(tile => !tile.isDirty)) {
      this.isDirty = false
    }
  }
  update(dt: number) {
    for (const tile of this.#tiles) {
      tile.update(dt)
    }
  }
  resize() {
    this.#padding = this.#calculatePadding()
    const width = this.#calculateTileWidth()
    const height = this.#calculateTileHeight()

    for (const position of this.#positions) {
      position.x = this.#calculateTileLeft(position.index, width)
      position.y = this.#calculateTileTop(position.index, height)
      position.width = width
      position.height = height
    }
    for (const tile of this.#tiles) {
      tile.width = width
      tile.height = height
    }
    this.isDirty = true
  }

  #createPositions() {
    const width = this.#calculateTileWidth()
    const height = this.#calculateTileHeight()

    const arr = new Array(this.#gridSize ** 2)
      .fill(0)
      .map((_, index) => this.#createPosition(index, width, height))
    return arr
  }
  #createPosition(index: number, width: number, height: number) {
    return {
      index,
      height,
      width,
      x: this.#calculateTileLeft(index, width),
      y: this.#calculateTileTop(index, height),
      isEmpty: true,
    }
  }
  #calculateTileLeft(offset: number, width: number) {
    return (
      (offset % this.#gridSize) * width +
      ((offset % this.#gridSize) + 1) * this.#padding
    )
  }
  #calculateTileTop(offset: number, height: number) {
    return (
      Math.floor(offset / this.#gridSize) * height +
      (Math.floor(offset / this.#gridSize) + 1) * this.#padding
    )
  }
  #calculateTileWidth() {
    return (
      (this.#renderer.canvas.width - (this.#gridSize + 1) * this.#padding) /
      this.#gridSize
    )
  }
  #calculateTileHeight() {
    return (
      (this.#renderer.canvas.height - (this.#gridSize + 1) * this.#padding) /
      this.#gridSize
    )
  }
  #calculatePadding() {
    return this.#renderer.canvas.width * BOARD_SPACING + (this.#gridSize + 1)
  }
}
// export class Grid {
//   // initialization concerns
//   /** The number of columns in the grid */
//   private _countRowsColumns: number
//   /** The spacing between the tiles in the grid */
//   private _boardSpacing: number
//   /** The game instance */
//   private _game: Game
//   /** An array that maps the grid to its transposition */
//   private _transpositionMap: number[]
//   private _defaultCell = {
//     x: 0,
//     y: 0,
//     width: 0,
//     height: 0,
//     value: 0,
//     isDirty: false,
//   }

//   // grid state
//   /** The grid data */
//   private _grid: Cell[]
//   /** Whether the grid has been modified */
//   private _isDirty: boolean
//   /** Whether the grid has any valid moves remaining */
//   private _hasMovesToMake: boolean
//   /** The highest value in the grid */
//   private _highestValue: number
//   /** The position of the highest value in the grid */
//   private _highestValueIndex: number
//   /** The position of the latest tile added to the grid */
//   private _latestTileIndex: number

//   constructor({
//     boardSpacing,
//     countRowsColumns,
//     gameReference,
//   }: {
//     boardSpacing: number
//     countRowsColumns: number
//     gameReference: Game
//   }) {
//     this._countRowsColumns = countRowsColumns
//     this._game = gameReference

//     this._isDirty = false
//     this._hasMovesToMake = true
//     this._highestValue = 0
//     this._highestValueIndex = 0
//     this._latestTileIndex = 0
//     this._boardSpacing = boardSpacing

//     const offsetSpacing = (this._countRowsColumns + 1) * this._boardSpacing
//     const startingCellWidth =
//       (gameReference.canvasDimensions.width - offsetSpacing) /
//       this._countRowsColumns
//     const startingCellHeight =
//       (gameReference.canvasDimensions.height - offsetSpacing) /
//       this._countRowsColumns

//     this._defaultCell.width = startingCellWidth
//     this._defaultCell.height = startingCellHeight

//     this._grid = new Array(countRowsColumns ** 2)
//       .fill({
//         x: 0,
//         y: 0,
//         width: startingCellWidth,
//         height: startingCellHeight,
//         value: 0,
//         isDirty: false,
//       })
//       .map((cell, index) => ({
//         ...cell,
//         x:
//           (index % this._countRowsColumns) * cell.width +
//           ((index % this._countRowsColumns) + 1) * this._boardSpacing,
//         y:
//           Math.floor(index / this._countRowsColumns) * cell.height +
//           (Math.floor(index / this._countRowsColumns) + 1) * this._boardSpacing,
//       }))
//     this._transpositionMap = this._createTranspositionMap(
//       this._countRowsColumns
//     )
//   }

//   public get grid() {
//     return this._grid
//   }
//   public get isDirty() {
//     return this._isDirty
//   }
//   public get hasMovesToMake() {
//     return this._hasMovesToMake
//   }
//   public get highestValue() {
//     return this._highestValue
//   }

//   /**
//    * @description Adds a new tile to a random position in the grid
//    */
//   public addNewTile() {
//     const cellsAvailable = this._grid
//       .map((cell, index) => (cell.value === 0 ? index : null))
//       .filter(Boolean)

//     if (cellsAvailable.length === 0) return

//     const randomCellIndex = Math.floor(Math.random() * cellsAvailable.length)

//     if (randomCellIndex && randomCellIndex < this._grid.length) {
//       const selectedIndex = cellsAvailable[randomCellIndex]!
//       this._grid[selectedIndex].value = Math.random() > 0.1 ? 2 : 4
//       this._grid[selectedIndex].isDirty = true
//       this._isDirty = true
//       this._latestTileIndex = cellsAvailable[randomCellIndex]!
//     }
//     console.log('grid', this._grid)
//   }
//   /**
//    * @description Creates a shallow clone of the grid
//    * @returns A copy of the grid
//    */
//   public makeCopy() {
//     const newGrid = new Grid({
//       boardSpacing: this._boardSpacing,
//       countRowsColumns: this._countRowsColumns,
//       gameReference: this._game,
//     })
//     for (let index = 0; index < this._grid.length; index++) {
//       newGrid.cloneCell({ index, value: this._grid[index] })
//     }

//     return newGrid.grid
//   }
//   /**
//    * @description Draws the gameboard to the canvas
//    * @param renderer The canvas context to draw to
//    */
//   public render(renderer: CanvasRenderingContext2D) {
//     this._boardSpacing = renderer.canvas.width * BOARD_SPACING
//     const offsetSpacing = (this._countRowsColumns + 1) * this._boardSpacing

//     if (
//       this._grid[0].width !==
//       (renderer.canvas.width - offsetSpacing) / this._countRowsColumns
//     ) {
//       for (const cell of this._grid) {
//         cell.width =
//           (renderer.canvas.width - offsetSpacing) / this._countRowsColumns
//         cell.height =
//           (renderer.canvas.height - offsetSpacing) / this._countRowsColumns
//       }
//     }

//     for (let index = 0; index < this._grid.length; index++) {
//       const cell = this._grid[index]
//       // render the cell's fill
//       // renderer.fillStyle = 'transparent'
//       // renderer.roundRect(cell.x, cell.y, cell.width, cell.height, 16)
//       // renderer.fill()

//       // render the cell's value
//       if (cell.isDirty) {
//         // if (this._latestTileIndex === index) {
//         //   console.log('this is the latest tile added', this._latestTileIndex)
//         //   console.log(cell.x, cell.y, cell.width, cell.height)
//         //   renderer.fillStyle = 'green'
//         //   renderer.roundRect(cell.x, cell.y, cell.width, cell.height, 16)
//         //   renderer.fill()
//         // }

//         renderer.textAlign = 'center'
//         // renderer.fillStyle = this._latestTileIndex === index ? 'green' : '#000'
//         renderer.fillStyle = '#000'
//         renderer.font = 'bold 2rem sans-serif'
//         renderer.fillText(
//           cell.value.toString(),
//           cell.x + cell.width / 2,
//           cell.y + cell.height / 2
//         )

//         cell.isDirty = false
//       }
//     }

//     this._isDirty = false
//   }
//   /**
//    * @description Slides the tiles in a given direction
//    * @param direction The direction to slide the tiles in
//    */
//   public slideTiles(direction: 'down' | 'left' | 'right' | 'up') {
//     let undoReverse = false
//     let undoTranspose = false

//     switch (direction) {
//       case 'up':
//         undoTranspose = true
//         undoReverse = true
//         this._transposeGrid()
//         this._reverseGrid()
//         break
//       case 'down':
//         undoTranspose = true
//         this._transposeGrid()
//         break
//       case 'left':
//         undoReverse = true
//         this._reverseGrid()
//         break
//       default:
//         break
//     }

//     const previousBoard = this.makeCopy()
//     this._collapse()
//     const changed = this._detectChange(previousBoard, this._grid)
//     if (undoReverse) this._reverseGrid()
//     if (undoTranspose) this._transposeGrid()
//     if (changed) {
//       this._highestValue = this._grid.reduce((a, b) => Math.max(a, b.value), 0)
//       this.addNewTile()
//       this._isDirty = true
//     }
//   }
//   /**
//    * @description Updates the value of a cell in the grid
//    * @param record A record containing the index of the cell to update, and the value to set it to
//    */
//   public cloneCell({ index, value }: { index: number; value: Cell }) {
//     this._grid[index] = { ...value }
//   }

//   /**
//    * @description Shifts all filled cells to the right, and combines pairs within the row
//    */
//   private _collapse() {
//     let gridRows: Array<Array<(typeof this._grid)[number]>> = []

//     for (
//       let row = 0;
//       row < this._countRowsColumns ** 2;
//       row += this._countRowsColumns
//     ) {
//       gridRows.push(
//         this._grid
//           .slice(row, row + this._countRowsColumns)
//           .map(cell => ({ ...cell }))
//       )
//     }
//     console.log('grid rows', gridRows)

//     for (const row in gridRows) {
//       gridRows[row] = this._slide(this._combine(this._slide(gridRows[row])))
//     }
//     console.log('grid rows after', gridRows)
//     this._grid = gridRows.flat()
//   }

//   /**
//    * @description Compares two grids to see if they are different
//    * @param board1 A grid to compare against
//    * @param board2 A grid to compare against
//    * @returns Whether the grids are different
//    */
//   private _detectChange(board1: typeof this._grid, board2: typeof this._grid) {
//     return !board1.every((value, index) => value === board2[index])
//   }
//   /**
//    * @description Reverses the values of the rows in the grid
//    */
//   private _reverseGrid() {
//     console.log('reverse grid')
//     let index = 0,
//       tempValue: Cell
//     while (index < this._grid.length) {
//       if (index % this._countRowsColumns === 0) {
//         tempValue = this._grid[index]
//         this._grid[index] = this._grid[index + this._countRowsColumns - 1]
//         this._grid[index + this._countRowsColumns - 1] = tempValue
//         index++
//       } else {
//         tempValue = this._grid[index]
//         this._grid[index] = this._grid[index + 1]
//         this._grid[index + 1] = tempValue
//         index += this._countRowsColumns - 1
//       }
//     }
//   }
//   /**
//    * @description Transposes the values in the grid
//    */
//   private _transposeGrid() {
//     this._grid = this._transpositionMap.map(index => this._grid[index])
//   }
//   /**
//    * @description Slides all filled cells to the right
//    * @param row The array to act upon
//    * @returns
//    */
//   private _slide(row: Cell[]): Cell[] {
//     let slidRow = row
//       .filter(cell => cell.value !== 0)
//       .map(cell => ({ ...cell }))
//     const fillerCells = new Array(this._countRowsColumns - slidRow.length).fill(
//       { ...this._defaultCell }
//     )
//     for (let i = 0; i < fillerCells.length; i++) {
//       fillerCells[i].x = row[i].x
//       fillerCells[i].y = row[i].y
//       fillerCells[i].width = row[i].width
//       fillerCells[i].height = row[i].height
//     }

//     return [...fillerCells, ...slidRow]
//   }
//   /**
//    * @description Combines the first pair filled cells in the row, and adds the value to the score
//    * @param row The array to act upon
//    */
//   private _combine(row: Cell[]) {
//     console.log('combining row', row)
//     for (let i = this._countRowsColumns - 1; i > 0; i--) {
//       if (row[i].value !== row[i - 1].value) continue

//       row[i].value = row[i].value + row[i - 1].value
//       row[i - 1].value = 0

//       if (row[i].value) {
//         this._game.setScore(row[i].value)
//         row[i].isDirty = true
//         row[i - 1].isDirty = true
//         this._isDirty = true
//       }
//     }

//     return row
//   }
//   private _createTranspositionMap(rowSize: number) {
//     const map = new Array(rowSize ** 2).fill(0).map((_, index) => index)
//     const output: number[] = []

//     for (let row = 0; row < rowSize; row++) {
//       for (let col = 0; col < rowSize; col++) {
//         output[col * rowSize + row] = map[row * rowSize + col]
//         output[row * rowSize + col] = map[col * rowSize + row]
//       }
//     }
//     return output
//   }
// }
