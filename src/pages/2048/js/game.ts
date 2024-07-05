import { Grid } from './grid'

export class Game {
  // render concerns
  private canvas: CanvasRenderingContext2D
  private gameElement: HTMLButtonElement
  private statusElement: HTMLElement
  private scoreElement: HTMLElement
  //game state
  private inGame: boolean
  private gameWon: boolean
  private rowLength: number
  private _score: number
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
    this._score = 0
    this.grid = new Grid(this.rowLength, this)
  }

  set score(value: number) {
    this._score = value
  }

  public newGame() {
    this.gameElement.innerText = 'Playing...'
    this.statusElement.classList.toggle('hidden', true)
    this.grid = new Grid(this.rowLength, this)
    this.grid.addNewTile()
    this.inGame = true

    this._updateCanvas()
  }
  /**
   * @description Moves the gameboard in the given direction and updates the canvas
   * @param dir The direction to move the gameboard
   */
  public move(dir: 'down' | 'left' | 'right' | 'up') {
    if (!this.inGame) return

    this.grid.slideTiles(dir)

    if (this.grid.isDirty) {
      this._updateCanvas()
      this._isGameWon()
      this._isGameOver()
    }
  }

  /**
   * Update the DOM when the game is ended
   */
  private _gameDone() {
    this.statusElement.innerText = this.gameWon
      ? `Congratulations! You won the game with a score of: ${this._score}`
      : 'Better luck next time'
    this._score = 0

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

    this.grid.render(this.canvas)
    this.scoreElement.innerText = this._score.toString()
  }
}
