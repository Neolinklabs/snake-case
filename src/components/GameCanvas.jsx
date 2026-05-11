import { useRef, useEffect, useState, useCallback } from 'react'
import { CANVAS_WIDTH, CANVAS_HEIGHT, CELL_SIZE, GRID_SIZE, COLORS, DIRECTIONS, FRUIT_TYPES, CORNER_SIZE } from '../utils/constants'
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

function drawSnake(ctx, snake, flash) {
  snake.forEach((segment, index) => {
    const x = segment.x * CELL_SIZE
    const y = segment.y * CELL_SIZE
    ctx.fillStyle = index === 0 ? COLORS.snakeHead : COLORS.snakeBody
    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
    if (index === 0) {
      ctx.fillStyle = flash ? '#fff' : '#0f0'
      ctx.beginPath()
      ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}

function drawFruit(ctx, food) {
  const x = food.x * CELL_SIZE
  const y = food.y * CELL_SIZE
  const type = food.type
  const cx = x + CELL_SIZE / 2
  const cy = y + CELL_SIZE / 2

  switch (type.id) {
    case 'apple': {
      ctx.fillStyle = type.color
      ctx.beginPath()
      ctx.arc(cx, cy + 1, CELL_SIZE / 2.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#4a2c0a'
      ctx.fillRect(cx - 1, y + 1, 2, 4)
      ctx.fillStyle = '#22aa22'
      ctx.beginPath()
      ctx.ellipse(cx + 3, y + 3, 3, 1.5, 0.3, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'banana': {
      ctx.strokeStyle = type.color
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.arc(cx, cy + 5, 7, Math.PI * 1.2, Math.PI * 1.8)
      ctx.stroke()
      ctx.fillStyle = type.accentColor
      ctx.beginPath()
      ctx.arc(cx - 2, cy + 5, 1.5, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'grape': {
      const offsets = [[-3, -2], [3, -2], [0, 2], [-3, 3], [3, 3]]
      ctx.fillStyle = type.color
      offsets.forEach(([dx, dy]) => {
        ctx.beginPath()
        ctx.arc(cx + dx, cy + dy, 3, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.fillStyle = '#4a2c0a'
      ctx.fillRect(cx - 0.5, y + 1, 1, 4)
      break
    }
    case 'orange': {
      ctx.fillStyle = type.color
      ctx.beginPath()
      ctx.arc(cx, cy, CELL_SIZE / 2.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#22aa22'
      ctx.beginPath()
      ctx.arc(cx, y + 3, 2, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'watermelon': {
      ctx.fillStyle = type.color
      ctx.beginPath()
      ctx.arc(cx, cy, CELL_SIZE / 2.3, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = type.accentColor
      ctx.beginPath()
      ctx.arc(cx, cy, CELL_SIZE / 3.2, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#222'
      const seeds = [[-2, -1], [2, -1], [0, 2]]
      seeds.forEach(([dx, dy]) => {
        ctx.beginPath()
        ctx.ellipse(cx + dx, cy + dy, 1, 1.5, 0, 0, Math.PI * 2)
        ctx.fill()
      })
      break
    }
    case 'cherry': {
      ctx.fillStyle = type.color
      ctx.beginPath()
      ctx.arc(cx - 3, cy + 2, 3.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(cx + 3, cy + 2, 3.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#4a2c0a'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(cx - 3, cy - 1)
      ctx.quadraticCurveTo(cx, y, cx + 3, cy - 1)
      ctx.stroke()
      break
    }
    default: {
      ctx.fillStyle = COLORS.food
      ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
    }
  }
}

function drawGameOver(ctx) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  ctx.fillStyle = '#f00'
  ctx.font = 'bold 36px system-ui'
  ctx.textAlign = 'center'
  ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
}

function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  ctx.fillStyle = '#ff0'
  ctx.font = 'bold 30px system-ui'
  ctx.textAlign = 'center'
  ctx.fillText('已暂停', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
}

function isCornerPosition(x, y) {
  const g = GRID_SIZE - 1
  return (
    (x < CORNER_SIZE && y < CORNER_SIZE) ||
    (x > g - CORNER_SIZE && y < CORNER_SIZE) ||
    (x < CORNER_SIZE && y > g - CORNER_SIZE) ||
    (x > g - CORNER_SIZE && y > g - CORNER_SIZE)
  )
}

function pickFruitType() {
  const totalWeight = FRUIT_TYPES.reduce((sum, f) => sum + f.weight, 0)
  let r = Math.random() * totalWeight
  for (const fruit of FRUIT_TYPES) {
    r -= fruit.weight
    if (r <= 0) return fruit
  }
  return FRUIT_TYPES[0]
}

function spawnFood(snake) {
  let pos
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    }
  } while (
    snake.some((s) => s.x === pos.x && s.y === pos.y) ||
    isCornerPosition(pos.x, pos.y)
  )
  return { ...pos, type: pickFruitType() }
}

function render(canvas, snake, food, flash) {
  const ctx = canvas.getContext('2d')
  drawGrid(ctx)
  drawFruit(ctx, food)
  drawSnake(ctx, snake, flash)
}

function renderGameOver(canvas) {
  const ctx = canvas.getContext('2d')
  drawGameOver(ctx)
}

function isWallCollision(head) {
  return head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE
}

function isSelfCollision(head, body) {
  return body.some((s) => s.x === head.x && s.y === head.y)
}

function GameCanvas({ onScore, onGameOver, onLevelUp, gameOver, paused, speed, resetKey, onDirectionReady, playEat, playGameOver, playTurn, onFruitEaten }) {
  const canvasRef = useRef(null)
  const snakeRef = useRef(INITIAL_SNAKE)
  const foodRef = useRef(spawnFood(INITIAL_SNAKE))
  const directionRef = useRef(DIRECTIONS.RIGHT)
  const flashRef = useRef(false)
  const scoreRef = useRef(0)
  const eatenRef = useRef(0)
  const speedModAccumRef = useRef(0)

  const changeDirection = useCallback((newDir) => {
    if (gameOver) return
    const current = directionRef.current
    if (newDir.x + current.x === 0 && newDir.y + current.y === 0) return
    directionRef.current = newDir
    if (playTurn) playTurn()
  }, [gameOver, playTurn])

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
    if (playTurn) playTurn()
    e.preventDefault()
  }, [gameOver, playTurn])

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
      if (playGameOver) playGameOver()
      onGameOver(scoreRef.current)
      if (canvasRef.current) renderGameOver(canvasRef.current)
      return
    }

    const ate = newHead.x === food.x && newHead.y === food.y
    const newSnake = ate
      ? [newHead, ...snake]
      : [newHead, ...snake.slice(0, -1)]

    snakeRef.current = newSnake

    if (ate) {
      if (playEat) playEat()
      const fruit = foodRef.current
      scoreRef.current += fruit.type.points
      eatenRef.current += 1
      speedModAccumRef.current += fruit.type.speedMod
      onScore(scoreRef.current)
      if (onFruitEaten) onFruitEaten(fruit.type)
      if (eatenRef.current % 5 === 0) onLevelUp()
      foodRef.current = spawnFood(newSnake)
      flashRef.current = true
      setTimeout(() => {
        flashRef.current = false
        if (canvasRef.current) render(canvasRef.current, snakeRef.current, foodRef.current, false)
      }, 100)
    }

    if (canvasRef.current) render(canvasRef.current, newSnake, foodRef.current, flashRef.current)
  }, [onScore, onGameOver, onLevelUp, gameOver, paused, playEat, playGameOver])

  const effectiveSpeed = Math.max(30, Math.min(300, speed + speedModAccumRef.current))
  useGameLoop(tick, paused || gameOver, effectiveSpeed)

  useEffect(() => {
    if (!canvasRef.current) return
    if (gameOver) {
      renderGameOver(canvasRef.current)
    } else if (paused) {
      render(canvasRef.current, snakeRef.current, foodRef.current, false)
      drawPaused(canvasRef.current.getContext('2d'))
    } else {
      render(canvasRef.current, snakeRef.current, foodRef.current, false)
    }
  }, [gameOver, paused])

  useEffect(() => {
    if (resetKey === 0) return
    snakeRef.current = INITIAL_SNAKE
    foodRef.current = spawnFood(INITIAL_SNAKE)
    directionRef.current = DIRECTIONS.RIGHT
    flashRef.current = false
    scoreRef.current = 0
    eatenRef.current = 0
    speedModAccumRef.current = 0
    if (canvasRef.current) render(canvasRef.current, INITIAL_SNAKE, foodRef.current, false)
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
