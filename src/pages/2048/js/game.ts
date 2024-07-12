import { Board } from './board'

export class Game {
  board: Board
  renderer: CanvasRenderingContext2D
  lastTimestamp?: number
  #animating: boolean

  constructor(renderer: CanvasRenderingContext2D) {
    this.board = new Board(4, renderer)
    this.renderer = renderer
    this.#animating = false
  }

  newGame() {
    this.lastTimestamp = performance.now()
    this.board.addTile()
    this.gameLoop(performance.now())
  }
  gameLoop(timestamp: number) {
    if (!this.lastTimestamp) this.lastTimestamp = timestamp
    const dt = timestamp - this.lastTimestamp
    this.lastTimestamp = timestamp

    this.update(dt)

    if (this.#animating) {
      this.renderer.clearRect(
        0,
        0,
        this.renderer.canvas.width,
        this.renderer.canvas.height
      )

      this.draw()
    }

    requestAnimationFrame(this.gameLoop.bind(this))
  }

  draw() {
    this.board.draw(this.renderer)
    this.#animating = false
  }
  move(s: string) {}
  update(dt: number) {
    this.board.update(dt)

    if (this.board.isDirty) {
      this.#animating = true
    }
  }

  resize() {
    this.board.resize()
  }
}

// export class Game_OLD {
//   // render concerns
//   private canvas: CanvasRenderingContext2D
//   private gameElement: HTMLButtonElement
//   private statusElement: HTMLElement
//   private scoreElement: HTMLElement
//   //game state
//   private inGame: boolean
//   private gameWon: boolean
//   private rowLength: number
//   private _score: number
//   private grid: Grid
//   private gameboard: number[][] = []

//   constructor(
//     statusElement: HTMLElement,
//     scoreElement: HTMLElement,
//     gameElement: HTMLButtonElement
//   ) {
//     this.statusElement = statusElement
//     this.scoreElement = scoreElement
//     this.gameElement = gameElement
//     const canvasElement = document.querySelector(
//       '#sketch canvas'
//     ) as HTMLCanvasElement | null

//     if (!canvasElement) throw new Error('canvas not found')
//     const context = canvasElement.getContext('2d')
//     if (!context) throw new Error('context not found')

//     this.canvas = context

//     this.inGame = false
//     this.gameWon = false
//     this.rowLength = 4
//     this._score = 0
//     this.grid = new Grid({
//       boardSpacing: this.canvas.canvas.width * BOARD_SPACING,
//       countRowsColumns: this.rowLength,
//       gameReference: this,
//     })
//   }

//   public setScore(value: number) {
//     this._score += value
//   }
//   public get canvasDimensions() {
//     return {
//       width: this.canvas.canvas.width,
//       height: this.canvas.canvas.height,
//     }
//   }

//   public newGame() {
//     this.gameElement.innerText = 'Playing...'
//     this.statusElement.classList.toggle('hidden', true)
//     this.grid = new Grid({
//       boardSpacing: this.canvas.canvas.width * BOARD_SPACING,
//       countRowsColumns: this.rowLength,
//       gameReference: this,
//     })
//     this.grid.addNewTile()
//     this.inGame = true

//     this._updateCanvas()
//   }
//   /**
//    * @description Moves the gameboard in the given direction and updates the canvas
//    * @param dir The direction to move the gameboard
//    */
//   public move(dir: 'down' | 'left' | 'right' | 'up') {
//     if (!this.inGame) return

//     this.grid.slideTiles(dir)

//     if (this.grid.isDirty) {
//       this._updateCanvas()
//       this._isGameWon()
//       this._isGameOver()
//     }
//   }

//   /**
//    * Update the DOM when the game is ended
//    */
//   private _gameDone() {
//     this.statusElement.innerText = this.gameWon
//       ? `Congratulations! You won the game with a score of: ${this._score}`
//       : 'Better luck next time'
//     this._score = 0

//     this.statusElement.classList.toggle('hidden', false)
//     this.gameElement.innerText = 'Play Again?'
//     this.gameElement.disabled = false
//   }
//   /**
//    * Checks to see if the game has been won
//    */
//   private _isGameWon() {
//     if (this.grid.highestValue === 2048) {
//       this.gameWon = true
//     }
//   }
//   /**
//    * Checks to see if the gameboard has any moves left
//    */
//   private _isGameOver() {
//     if (!this.grid.hasMovesToMake) {
//       this.inGame = false
//       this._gameDone()
//     }
//   }

//   /**
//    * @description Updates the canvas with the current gameboard when the gameboard changes
//    */
//   private _updateCanvas() {
//     this.canvas.clearRect(
//       0,
//       0,
//       this.canvas.canvas.width,
//       this.canvas.canvas.height
//     )

//     this.grid.render(this.canvas)
//     this.scoreElement.innerText = this._score.toString()
//   }
// }
