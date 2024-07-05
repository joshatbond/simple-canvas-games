import { Grid } from './grid'

export class Game {
  private canvas: CanvasRenderingContext2D
  private gameElement: HTMLButtonElement
  private statusElement: HTMLElement
  private scoreElement: HTMLElement
  private inGame: boolean
  private gameWon: boolean
  private rowLength: number
  private score: number
  private grid: Grid
  private gameboard: number[][] = []

  constructor(
    statusElement: HTMLElement,
    scoreElement: HTMLElement,
    gameElement: HTMLButtonElement
  ) {
    this.statusElement = statusElement
    this.scoreElement = scoreElement
    this.gameElement = gameElement
    const canvasElement = document.querySelector(
      '#sketch canvas'
    ) as HTMLCanvasElement | null

    if (!canvasElement) throw new Error('canvas not found')
    const context = canvasElement.getContext('2d')
    if (!context) throw new Error('context not found')

    this.canvas = context

    this.inGame = false
    this.gameWon = false
    this.rowLength = 4
    this.score = 0
    this.grid = new Grid(this.rowLength)
  }

  public newGame() {
    this.gameElement.innerText = 'Playing...'
    this.statusElement.classList.toggle('hidden', true)
    this.grid = new Grid(this.rowLength)
    this.gameboard = this.grid.addNewTile(this.grid.grid)
    this.inGame = true

    this._updateCanvas()
  }
  /**
   * @description Moves the gameboard in the given direction and updates the canvas
   * @param dir The direction to move the gameboard
   */
  public move(dir: 'down' | 'left' | 'right' | 'up') {
    if (!this.inGame) return

    let undoReverse = false
    let undoTranspose = false

    switch (dir) {
      case 'up':
        undoReverse = true
        this.gameboard = this.grid.reverseGrid(this.gameboard)
        break
      case 'right':
        undoTranspose = true
        this.gameboard = this.grid.transposeGrid(this.gameboard)
        break
      case 'left':
        undoReverse = true
        undoTranspose = true
        this.gameboard = this.grid.transposeGrid(this.gameboard)
        this.gameboard = this.grid.reverseGrid(this.gameboard)
        break
      default:
        break
    }

    const previousBoard = this.grid.makeCopy(this.gameboard)
    for (var row in this.gameboard) {
      this.gameboard[row] = this._operate(this.gameboard[row])
    }

    const changed = this._compare(previousBoard, this.gameboard)
    if (undoReverse) this.gameboard = this.grid.reverseGrid(this.gameboard)
    if (undoTranspose) this.gameboard = this.grid.transposeGrid(this.gameboard)
    if (changed) this.gameboard = this.grid.addNewTile(this.gameboard)

    this._updateCanvas()
    this._isGameWon()
    this._isGameOver()
  }

  /**
   * @description Combines the first pair filled cells in the row, and adds the value to the score
   * @param row The array to act upon
   */
  private _combine(row: number[]) {
    for (let i = this.rowLength - 1; i > 0; i--) {
      if (row[i] !== row[i - 1] || (row[i] === 0 && row[i - 1] === 0)) continue

      row[i] = row[i] + row[i - 1]
      row[i - 1] = 0

      this.score += row[i]
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
   * Update the DOM when the game is ended
   */
  private _gameDone() {
    this.statusElement.innerText = this.gameWon
      ? `Congratulations! You won the game with a score of: ${this.score}`
      : 'Better luck next time'
    this.score = 0

    this.statusElement.classList.toggle('hidden', false)
    this.gameElement.innerText = 'Play Again?'
    this.gameElement.disabled = false
  }
  /**
   * Checks to see if the game has been won
   */
  private _isGameWon() {
    for (const row in this.gameboard) {
      for (const cell in this.gameboard[row]) {
        if (this.gameboard[row][cell] === 2048) this.gameWon = true
      }
    }
  }
  /**
   * Checks to see if the gameboard has any moves left
   */
  private _isGameOver() {
    let isGameOver = true,
      cellValue = -1,
      isLastRow = false,
      isLastCol = false,
      nextRowValue = -1,
      nextColValue = -1

    cellCheck: for (let row = 0; row < this.rowLength; row++) {
      for (let col = 0; col < this.gameboard[row].length; col++) {
        cellValue = this.gameboard[row][col]
        isLastRow = row === this.rowLength - 1
        isLastCol = col === this.gameboard[row].length - 1
        nextRowValue = isLastRow ? -1 : this.gameboard[row + 1][col]
        nextColValue = isLastCol ? -1 : this.gameboard[row][col + 1]

        if (
          cellValue === 0 ||
          (!isLastRow && cellValue === nextRowValue) ||
          (!isLastCol && cellValue === nextColValue)
        ) {
          isGameOver = false
          break cellCheck
        }
      }
    }

    if (isGameOver) {
      console.log('game over')
      this.inGame = false
      this._gameDone()
    }
  }
  /**
   * @description Shifts all filled cells to the right, and combines the first pair of numbers
   * @param row The gameboard row to operate on
   * @returns
   */
  private _operate(row: number[]) {
    row = this._slide(row)
    row = this._combine(row)
    row = this._slide(row)
    return row
  }
  /**
   * @description Slides all filled cells to the right
   * @param row The array to act upon
   * @returns
   */
  private _slide(row: number[]): number[] {
    let slidRow = row.filter(Boolean)

    return [...Array(this.rowLength - slidRow.length).fill(0), ...slidRow]
  }

  /**
   * @description Draws the gameboard to the canvas
   */
  private _drawGrid() {
    let w = 100
    for (let row = 0; row < this.gameboard.length; row++) {
      for (let col = 0; col < this.gameboard[row].length; col++) {
        const cellValue = this.gameboard[row][col]
        this.canvas.fillStyle = 'transparent'
        this.canvas.lineWidth = 2
        this.canvas.strokeStyle = '#fff'
        this.canvas.rect(row * w, col * w, w, w)
        this.canvas.stroke()

        if (cellValue > 0) {
          this.canvas.textAlign = 'center'
          this.canvas.fillStyle = '#fff'
          this.canvas.font = 'bold 2rem sans-serif'
          this.canvas.fillText(
            cellValue.toString(),
            row * w + w / 2,
            col * w + w / 2
          )
        }
      }
    }
  }

  /**
   * @description Updates the canvas with the current gameboard when the gameboard changes
   */
  private _updateCanvas() {
    this.canvas.clearRect(
      0,
      0,
      this.canvas.canvas.width,
      this.canvas.canvas.height
    )
    this.canvas.fillStyle = '#000'
    this.canvas.fillRect(
      0,
      0,
      this.canvas.canvas.width,
      this.canvas.canvas.height
    )

    this._drawGrid()
    this.scoreElement.innerText = this.score.toString()
  }
}
