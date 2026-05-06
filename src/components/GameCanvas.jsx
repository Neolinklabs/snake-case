import { useRef, useEffect, useState, useCallback } from 'react'
import { CANVAS_WIDTH, CANVAS_HEIGHT, CELL_SIZE, GRID_SIZE, COLORS, DIRECTIONS } from '../utils/constants'
import { useGameLoop } from '../hooks/useGameLoop'

const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
]

function drawGrid(ctx) {
  ctx.fillStyle = COLORS.background
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  ctx.strokeStyle = COLORS.grid
  ctx.lineWidth = 0.5
  for (let i = 0; i <= GRID_SIZE; i++) {
    const pos = i * CELL_SIZE
    ctx.beginPath()
    ctx.moveTo(pos, 0)
    ctx.lineTo(pos, CANVAS_HEIGHT)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, pos)
    ctx.lineTo(CANVAS_WIDTH, pos)
    ctx.stroke()
  }
}

function drawSnake(ctx, snake) {
  snake.forEach((segment, index) => {
    const x = segment.x * CELL_SIZE
    const y = segment.y * CELL_SIZE
    ctx.fillStyle = index === 0 ? COLORS.snakeHead : COLORS.snakeBody
    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
    if (index === 0) {
      ctx.fillStyle = '#0f0'
      ctx.beginPath()
      ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}

function render(canvas, snake) {
  const ctx = canvas.getContext('2d')
  drawGrid(ctx)
  drawSnake(ctx, snake)
}

function GameCanvas() {
  const canvasRef = useRef(null)
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const directionRef = useRef(DIRECTIONS.RIGHT)

  const handleKeyDown = useCallback((e) => {
    const keyMap = {
      ArrowUp: DIRECTIONS.UP,
      ArrowDown: DIRECTIONS.DOWN,
      ArrowLeft: DIRECTIONS.LEFT,
      ArrowRight: DIRECTIONS.RIGHT,
    }
    const newDir = keyMap[e.key]
    if (!newDir) return
    // 不允许反向移动
    const current = directionRef.current
    if (newDir.x + current.x === 0 && newDir.y + current.y === 0) return
    directionRef.current = newDir
    e.preventDefault()
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const tick = useCallback(() => {
    setSnake((prev) => {
      const head = prev[0]
      const dir = directionRef.current
      const newHead = { x: head.x + dir.x, y: head.y + dir.y }
      const newSnake = [newHead, ...prev.slice(0, -1)]
      // 渲染
      if (canvasRef.current) render(canvasRef.current, newSnake)
      return newSnake
    })
  }, [])

  useGameLoop(tick)

  useEffect(() => {
    if (canvasRef.current) render(canvasRef.current, snake)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{ border: '2px solid #333', borderRadius: '4px' }}
    />
  )
}

export default GameCanvas
