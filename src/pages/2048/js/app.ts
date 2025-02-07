import { Game } from './game'

const buttonElement = document.getElementById('b1') as HTMLButtonElement | null
const canvasParent = document.getElementById('sketch') as HTMLDivElement | null
const mainElement = document.querySelector('main')
const imageElement = document.getElementById(
  'bgImage'
) as HTMLImageElement | null
const scoreElement = document.getElementById('score') as HTMLSpanElement | null
const statusElement = document.getElementById(
  'status'
) as HTMLHeadingElement | null

if (!buttonElement) throw new Error('button not found')
if (!canvasParent) throw new Error('sketch not found')
if (!imageElement) throw new Error('image not found')
if (!mainElement) throw new Error('main not found')
if (!scoreElement) throw new Error('score not found')
if (!statusElement) throw new Error('disp not found')

mainElement.style.opacity = '0'

const canvas = document.createElement('canvas')
const canvasContext = canvas.getContext('2d')
canvas.width = canvasParent.children[0].clientWidth
canvas.height = canvasParent.children[0].clientHeight
canvas.style.position = 'absolute'
canvas.style.inset = '0'
canvasParent.appendChild(canvas)

if (!canvasContext) throw new Error('canvas context not found')

// const game = new Game(statusElement, scoreElement, buttonElement)
const game = new Game(canvasContext)

buttonElement.addEventListener('click', () => {
  buttonElement.disabled = true
  game.newGame()
})
imageElement.addEventListener('load', () => {
  mainElement.style.setProperty(
    '--container-width',
    `${imageElement.clientWidth}px`
  )
  mainElement.style.opacity = '1'
})
imageElement.src = '/assets/game_bg.jpg'

const resizeObserver = new ResizeObserver(() => {
  const { width, height } = imageElement.getBoundingClientRect()
  mainElement.style.setProperty('--container-width', `${width}px`)
  canvas.width = width
  canvas.height = height
  game.resize()
})
resizeObserver.observe(imageElement)

window.addEventListener('touchstart', touchStarted)
window.addEventListener('touchend', touchEnded)
window.addEventListener('keydown', keyPressed)

function keyPressed(e: KeyboardEvent) {
  if (!e.key.includes('Arrow') && e.key !== 'Enter') return
  e.preventDefault()

  switch (e.key) {
    case 'ArrowDown':
      game.move('down')
      break
    case 'ArrowLeft':
      game.move('left')
      break
    case 'ArrowRight':
      game.move('right')
      break
    case 'ArrowUp':
      game.move('up')
      break
    case 'Enter':
      if (!buttonElement) return
      if (buttonElement.disabled) return
      buttonElement.disabled = true
      game.newGame()
      break
    default:
      break
  }
}

const travelThreshold = 150
const restraint = 100
const allowedTime = 300
let swipeDirection: 'left' | 'right' | 'up' | 'down' | null = null
let dX = 0
let dY = 0
let elapsedTime = 0
let startX = 0
let startY = 0
let startTime = 0

function touchStarted(event: TouchEvent) {
  swipeDirection = null
  dX = 0
  dY = 0
  elapsedTime = 0
  startX = event.touches[0].pageX
  startY = event.touches[0].pageY
  startTime = performance.now()
  return false
}
function touchEnded(event: TouchEvent) {
  if (!buttonElement) return
  if (event.target === buttonElement && !buttonElement.disabled) {
    buttonElement.disabled = true
    game.newGame()
    return
  }

  dX = event.touches[0].pageX - startX
  dY = event.touches[0].pageY - startY
  elapsedTime = performance.now() - startTime

  if (elapsedTime <= allowedTime) {
    swipeDirection =
      Math.abs(dX) >= travelThreshold && Math.abs(dY) <= restraint
        ? dX < 0
          ? 'left'
          : 'right'
        : Math.abs(dY) >= travelThreshold && Math.abs(dX) <= restraint
          ? dY < 0
            ? 'up'
            : 'down'
          : null
  }

  if (swipeDirection) game.move(swipeDirection)
}
