import { useRef, useEffect } from 'react'

function GameCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      style={{ border: '2px solid #333', borderRadius: '4px' }}
    />
  )
}

export default GameCanvas
