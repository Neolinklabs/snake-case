import { useEffect, useRef, useCallback } from 'react'
import { INITIAL_SPEED } from '../utils/constants'

export function useGameLoop(tick, speed = INITIAL_SPEED) {
  const tickRef = useRef(tick)
  const speedRef = useRef(speed)

  tickRef.current = tick
  speedRef.current = speed

  useEffect(() => {
    let lastTime = 0
    let accumulated = 0
    let rafId

    function loop(time) {
      if (lastTime === 0) {
        lastTime = time
      }
      accumulated += time - lastTime
      lastTime = time

      if (accumulated >= speedRef.current) {
        tickRef.current()
        accumulated = 0
      }

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [])
}
