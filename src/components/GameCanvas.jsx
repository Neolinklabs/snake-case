import { useRef, useEffect, useState, useCallback } from 'react'
import { CANVAS_WIDTH, CANVAS_HEIGHT, CELL_SIZE, GRID_SIZE, COLORS, DIRECTIONS } from '../utils/constants'
import { useGameLoop } from '../hooks/useGameLoop'

const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
]

const THEME_OVERRIDES = {
  light: {
    background: '#e0e0e0',
    grid: '#ccc',
    snakeHead: '#2d8a2d',
    snakeBody: '#3da63d',
    food: '#d00',
    overlay: 'rgba(255, 255, 255, 0.7)',
    overlayLight: 'rgba(255, 255, 255, 0.5)',
    gameOverText: '#d00',
    pauseText: '#b8860b',
    snakeEye: '#2d8a2d',
    foodHighlight: '#e44',
  },
}

function getColors(isDark) {
  if (isDark) {
    return {
      background: COLORS.background,
      grid: COLORS.grid,
      snakeHead: COLORS.snakeHead,
      snakeBody: COLORS.snakeBody,
      food: COLORS.food,
      overlay: 'rgba(0, 0, 0, 0.7)',
      overlayLight: 'rgba(0, 0, 0, 0.5)',
      gameOverText: '#f00',
      pauseText: '#ff0',
      snakeEye: '#0f0',
      foodHighlight: '#ff4444',
    }
  }
  return THEME_OVERRIDES.light
}

function drawGrid(ctx, colors) {
  ctx.fillStyle = colors.background
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  ctx.strokeStyle = colors.grid
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

function drawSnake(ctx, snake, flash, colors) {
  snake.forEach((segment, index) => {
    const x = segment.x * CELL_SIZE
    const y = segment.y * CELL_SIZE
    ctx.fillStyle = index === 0 ? colors.snakeHead : colors.snakeBody
    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
    if (index === 0) {
      ctx.fillStyle = flash ? '#fff' : colors.snakeEye
      ctx.beginPath()
      ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}

function drawFood(ctx, food, colors) {
  const x = food.x * CELL_SIZE
  const y = food.y * CELL_SIZE
  ctx.fillStyle = colors.food
  ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
  ctx.fillStyle = colors.foodHighlight
  ctx.beginPath()
  ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2)
  ctx.fill()
}

function drawGameOver(ctx, colors) {
  ctx.fillStyle = colors.overlay
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  ctx.fillStyle = colors.gameOverText
  ctx.font = 'bold 36px system-ui'
  ctx.textAlign = 'center'
  ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
}

function drawPaused(ctx, colors) {
  ctx.fillStyle = colors.overlayLight
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  ctx.fillStyle = colors.pauseText
  ctx.font = 'bold 30px system-ui'
  ctx.textAlign = 'center'
  ctx.fillText('已暂停', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
}

function spawnFood(snake) {
  let pos
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    }
  } while (snake.some((s) => s.x === pos.x && s.y === pos.y))
  return pos
}

function render(canvas, snake, food, flash, colors) {
  const ctx = canvas.getContext('2d')
  drawGrid(ctx, colors)
  drawFood(ctx, food, colors)
  drawSnake(ctx, snake, flash, colors)
}

function renderGameOver(canvas, colors) {
  const ctx = canvas.getContext('2d')
  drawGameOver(ctx, colors)
}

function isWallCollision(head) {
  return head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE
}

function isSelfCollision(head, body) {
  return body.some((s) => s.x === head.x && s.y === head.y)
}

function GameCanvas({ onScore, onGameOver, onLevelUp, gameOver, paused, speed, resetKey, onDirectionReady, isDark = true }) {
  const canvasRef = useRef(null)
  const snakeRef = useRef(INITIAL_SNAKE)
  const foodRef = useRef(spawnFood(INITIAL_SNAKE))
  const directionRef = useRef(DIRECTIONS.RIGHT)
  const flashRef = useRef(false)
  const scoreRef = useRef(0)
  const eatenRef = useRef(0)
  const colorsRef = useRef(getColors(isDark))

  colorsRef.current = getColors(isDark)

  const changeDirection = useCallback((newDir) => {
    if (gameOver) return
    const current = directionRef.current
    if (newDir.x + current.x === 0 && newDir.y + current.y === 0) return
    directionRef.current = newDir
  }, [gameOver])

  useEffect(() => {
    if (onDirectionReady) onDirectionReady(changeDirection)
  }, [changeDirection, onDirectionReady])

  const handleKeyDown = useCallback((e) => {
    if (gameOver) return
    const keyMap = {
      ArrowUp: DIRECTIONS.UP,
      ArrowDown: DIRECTIONS.DOWN,
      ArrowLeft: DIRECTIONS.LEFT,
      ArrowRight: DIRECTIONS.RIGHT,
    }
    const newDir = keyMap[e.key]
    if (!newDir) return
    const current = directionRef.current
    if (newDir.x + current.x === 0 && newDir.y + current.y === 0) return
    directionRef.current = newDir
    e.preventDefault()
  }, [gameOver])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const tick = useCallback(() => {
    if (gameOver || paused) return
    const snake = snakeRef.current
    const food = foodRef.current
    const head = snake[0]
    const dir = directionRef.current
    const newHead = { x: head.x + dir.x, y: head.y + dir.y }

    // 碰撞检测
    if (isWallCollision(newHead) || isSelfCollision(newHead, snake)) {
      onGameOver(scoreRef.current)
      if (canvasRef.current) renderGameOver(canvasRef.current, colorsRef.current)
      return
    }

    const ate = newHead.x === food.x && newHead.y === food.y
    const newSnake = ate
      ? [newHead, ...snake]
      : [newHead, ...snake.slice(0, -1)]

    snakeRef.current = newSnake

    if (ate) {
      scoreRef.current += 10
      eatenRef.current += 1
      onScore(scoreRef.current)
      if (eatenRef.current % 5 === 0) onLevelUp()
      foodRef.current = spawnFood(newSnake)
      flashRef.current = true
      setTimeout(() => {
        flashRef.current = false
        if (canvasRef.current) render(canvasRef.current, snakeRef.current, foodRef.current, false, colorsRef.current)
      }, 100)
    }

    if (canvasRef.current) render(canvasRef.current, newSnake, foodRef.current, flashRef.current, colorsRef.current)
  }, [onScore, onGameOver, onLevelUp, gameOver, paused])

  useGameLoop(tick, paused || gameOver, speed)

  useEffect(() => {
    if (!canvasRef.current) return
    const colors = colorsRef.current
    if (gameOver) {
      renderGameOver(canvasRef.current, colors)
    } else if (paused) {
      render(canvasRef.current, snakeRef.current, foodRef.current, false, colors)
      drawPaused(canvasRef.current.getContext('2d'), colors)
    } else {
      render(canvasRef.current, snakeRef.current, foodRef.current, false, colors)
    }
  }, [gameOver, paused, isDark])

  useEffect(() => {
    if (resetKey === 0) return
    snakeRef.current = INITIAL_SNAKE
    foodRef.current = spawnFood(INITIAL_SNAKE)
    directionRef.current = DIRECTIONS.RIGHT
    flashRef.current = false
    scoreRef.current = 0
    eatenRef.current = 0
    if (canvasRef.current) render(canvasRef.current, INITIAL_SNAKE, foodRef.current, false, colorsRef.current)
  }, [resetKey])

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
