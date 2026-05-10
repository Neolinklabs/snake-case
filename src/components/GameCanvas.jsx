import { useRef, useEffect, useState, useCallback } from 'react'
import { CANVAS_WIDTH, CANVAS_HEIGHT, CELL_SIZE, GRID_SIZE, COLORS, DIRECTIONS, BONUS_FRUIT } from '../utils/constants'
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

function drawFood(ctx, food) {
  const x = food.x * CELL_SIZE
  const y = food.y * CELL_SIZE
  ctx.fillStyle = COLORS.food
  ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
  ctx.fillStyle = '#ff4444'
  ctx.beginPath()
  ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2)
  ctx.fill()
}

function drawBonusFruit(ctx, bonus) {
  const x = bonus.x * CELL_SIZE
  const y = bonus.y * CELL_SIZE
  // Pulsing glow effect
  const pulse = Math.sin(Date.now() / 200) * 0.15 + 0.85
  ctx.globalAlpha = pulse
  ctx.fillStyle = COLORS.bonusFruit
  ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
  ctx.fillStyle = COLORS.bonusFruitInner
  ctx.beginPath()
  ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
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

function spawnBonusFruit(snake, food) {
  let pos
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    }
  } while (
    snake.some((s) => s.x === pos.x && s.y === pos.y) ||
    (food && pos.x === food.x && pos.y === food.y)
  )
  return { ...pos, ticksLeft: BONUS_FRUIT.LIFETIME_TICKS }
}

function render(canvas, snake, food, flash, bonusFruit) {
  const ctx = canvas.getContext('2d')
  drawGrid(ctx)
  drawFood(ctx, food)
  if (bonusFruit) drawBonusFruit(ctx, bonusFruit)
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

function GameCanvas({ onScore, onGameOver, onLevelUp, gameOver, paused, speed, resetKey, onDirectionReady, playEat, playGameOver, playTurn }) {
  const canvasRef = useRef(null)
  const snakeRef = useRef(INITIAL_SNAKE)
  const foodRef = useRef(spawnFood(INITIAL_SNAKE))
  const directionRef = useRef(DIRECTIONS.RIGHT)
  const flashRef = useRef(false)
  const scoreRef = useRef(0)
  const eatenRef = useRef(0)
  const bonusRef = useRef(null)

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
    const bonus = bonusRef.current
    const ateBonus = bonus && newHead.x === bonus.x && newHead.y === bonus.y

    let newSnake
    if (ateBonus) {
      // 奖励果实让蛇增长 GROWTH 段
      const tail = snake.slice(-(BONUS_FRUIT.GROWTH - 1))
      newSnake = [newHead, ...snake, ...tail]
    } else if (ate) {
      newSnake = [newHead, ...snake]
    } else {
      newSnake = [newHead, ...snake.slice(0, -1)]
    }

    snakeRef.current = newSnake

    if (ate) {
      if (playEat) playEat()
      scoreRef.current += 10
      eatenRef.current += 1
      onScore(scoreRef.current)
      if (eatenRef.current % 5 === 0) onLevelUp()
      foodRef.current = spawnFood(newSnake)
      // 随机生成奖励果实
      if (!bonusRef.current && Math.random() < BONUS_FRUIT.SPAWN_CHANCE) {
        bonusRef.current = spawnBonusFruit(newSnake, foodRef.current)
      }
      flashRef.current = true
      setTimeout(() => {
        flashRef.current = false
        if (canvasRef.current) render(canvasRef.current, snakeRef.current, foodRef.current, false, bonusRef.current)
      }, 100)
    }

    if (ateBonus) {
      if (playEat) playEat()
      scoreRef.current += BONUS_FRUIT.POINTS
      onScore(scoreRef.current)
      bonusRef.current = null
      flashRef.current = true
      setTimeout(() => {
        flashRef.current = false
        if (canvasRef.current) render(canvasRef.current, snakeRef.current, foodRef.current, false, bonusRef.current)
      }, 100)
    }

    // 奖励果实倒计时
    if (bonusRef.current) {
      bonusRef.current.ticksLeft -= 1
      if (bonusRef.current.ticksLeft <= 0) {
        bonusRef.current = null
      }
    }

    if (canvasRef.current) render(canvasRef.current, newSnake, foodRef.current, flashRef.current, bonusRef.current)
  }, [onScore, onGameOver, onLevelUp, gameOver, paused, playEat, playGameOver])

  useGameLoop(tick, paused || gameOver, speed)

  useEffect(() => {
    if (!canvasRef.current) return
    if (gameOver) {
      renderGameOver(canvasRef.current)
    } else if (paused) {
      render(canvasRef.current, snakeRef.current, foodRef.current, false, bonusRef.current)
      drawPaused(canvasRef.current.getContext('2d'))
    } else {
      render(canvasRef.current, snakeRef.current, foodRef.current, false, bonusRef.current)
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
    bonusRef.current = null
    if (canvasRef.current) render(canvasRef.current, INITIAL_SNAKE, foodRef.current, false, null)
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
