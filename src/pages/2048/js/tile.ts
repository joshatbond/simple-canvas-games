import gsap from 'gsap'

import { colors } from './constants'

export class Tile {
  x: number
  y: number
  #value: number
  #width: number
  #height: number
  destination: { x: number; y: number } | null
  #animationDuration = 0.2
  #isMoving: boolean
  #isColorChanging: boolean
  color: string

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    value: number
  ) {
    this.x = -1
    this.y = -1
    this.#width = width
    this.#height = height
    this.#value = value
    this.destination = { x, y }
    this.#isMoving = false
    this.#isColorChanging = false
    this.color = colors.LATEST
  }

  get isDirty() {
    return this.#isMoving || this.#isColorChanging
  }

  set width(size: number) {
    this.#width = size
  }
  set height(size: number) {
    this.#height = size
  }
  set value(value: number) {
    this.#value = value
  }

  move(x: number, y: number) {
    this.destination = { x, y }
  }
  resize(width: number, height: number) {
    this.#width = width
    this.#height = height
    this.#isMoving = true
  }

  update(dt: number) {
    // just initialized
    if (this.x === -1 && this.y === -1) {
      this.#isColorChanging = true
      this.x = this.destination!.x
      this.y = this.destination!.y
      this.destination = null
      gsap.to(this, {
        color: colors.FILLED,
        duration: 1.5,
        ease: 'expo.in',
        onComplete: () => {
          this.#isColorChanging = false
        },
      })
      return
    }
    // we're moving
    if (this.destination) {
      this.#isMoving = true

      if (this.destination.x !== this.x) {
        gsap.to(this, {
          x: this.destination.x,
          duration: this.#animationDuration,
          ease: 'power3.in',
          onComplete: () => {
            this.destination = null
            this.#isMoving = false
          },
        })
      }
      if (this.destination.y !== this.y) {
        gsap.to(this, {
          y: this.destination.y,
          duration: this.#animationDuration,
          ease: 'power3.in',
          onComplete: () => {
            this.destination = null
            this.#isMoving = false
          },
        })
      }
      return
    }
  }
  draw(renderer: CanvasRenderingContext2D) {
    renderer.beginPath()
    renderer.fillStyle = this.color
    renderer.roundRect(this.x, this.y, this.#width, this.#height, 16)
    renderer.fill()

    renderer.textAlign = 'center'
    renderer.textBaseline = 'middle'
    renderer.fillStyle = colors.TEXT
    renderer.font = 'bold 2rem sans-serif'
    renderer.fillText(
      this.#value.toString(),
      this.x + this.#width / 2,
      this.y + this.#height / 2
    )
    renderer.closePath()
  }
}
