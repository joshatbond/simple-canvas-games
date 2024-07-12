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
  isDirty: boolean
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
    this.isDirty = false
    this.color = colors.LATEST
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
    this.isDirty = true
  }

  update(dt: number) {
    // just initialized
    if (this.x === -1 && this.y === -1) {
      this.isDirty = true
      this.x = this.destination!.x
      this.y = this.destination!.y
      this.destination = null
      gsap.to(this, {
        color: colors.FILLED,
        duration: 1.5,
        ease: 'expo.in',
      })
      return
    }
    // we're moving
    if (this.destination) {
      this.isDirty = true

      if (this.destination.x !== this.x) {
        gsap.to(this, {
          x: this.destination.x,
          duration: this.#animationDuration,
          ease: 'power3.in',
          onComplete: () => {
            this.destination = null
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
          },
        })
      }
      return
    }
    // we have a color change
    if (![colors.HIGHEST, colors.EMPTY].includes(this.color)) {
      this.isDirty = true
      return
    }

    this.isDirty = false
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
