import { useEffect, useRef } from 'react'
import { INITIAL_SPEED } from '../utils/constants'

export function useGameLoop(tick, paused = false, speed = INITIAL_SPEED) {
  const tickRef = useRef(tick)
  const speedRef = useRef(speed)
  const pausedRef = useRef(paused)

  tickRef.current = tick
  speedRef.current = speed
  pausedRef.current = paused

  useEffect(() => {
    let lastTime = 0
    let accumulated = 0
    let rafId

    function loop(time) {
      if (lastTime === 0) {
        lastTime = time
      }

      if (pausedRef.current) {
        lastTime = time
        accumulated = 0
        rafId = requestAnimationFrame(loop)
        return
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
