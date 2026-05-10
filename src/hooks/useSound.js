import { useRef, useState, useCallback } from 'react'

function createAudioContext() {
  return new (window.AudioContext || window.webkitAudioContext)()
}

export function useSound() {
  const ctxRef = useRef(null)
  const [muted, setMuted] = useState(false)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = createAudioContext()
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  const playTone = useCallback((frequency, duration, type = 'square', volume = 0.15) => {
    if (muted) return
    try {
      const ctx = getCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.value = frequency
      gain.gain.value = volume
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + duration)
    } catch {
      // Silently fail if audio is not available
    }
  }, [muted, getCtx])

  const playEat = useCallback(() => {
    playTone(600, 0.08, 'square', 0.12)
    setTimeout(() => playTone(800, 0.1, 'square', 0.10), 60)
  }, [playTone])

  const playGameOver = useCallback(() => {
    playTone(300, 0.15, 'sawtooth', 0.15)
    setTimeout(() => playTone(200, 0.2, 'sawtooth', 0.12), 120)
    setTimeout(() => playTone(120, 0.35, 'sawtooth', 0.10), 250)
  }, [playTone])

  const playTurn = useCallback(() => {
    playTone(440, 0.04, 'sine', 0.06)
  }, [playTone])

  const toggleMute = useCallback(() => {
    setMuted((m) => !m)
  }, [])

  return { playEat, playGameOver, playTurn, muted, toggleMute }
}
