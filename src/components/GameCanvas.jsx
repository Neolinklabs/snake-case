import { useRef, useEffect } from 'react'
import { CANVAS_WIDTH, CANVAS_HEIGHT, CELL_SIZE, GRID_SIZE, COLORS } from '../utils/constants'

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

function GameCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawGrid(canvas.getContext('2d'))
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
