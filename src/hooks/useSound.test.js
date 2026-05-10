import { renderHook, act } from '@testing-library/react'
import { useSound } from '../hooks/useSound'

describe('useSound hook', () => {
  test('initial state is not muted', () => {
    const { result } = renderHook(() => useSound())
    expect(result.current.muted).toBe(false)
  })

  test('toggleMute toggles muted state', () => {
    const { result } = renderHook(() => useSound())
    expect(result.current.muted).toBe(false)
    act(() => {
      result.current.toggleMute()
    })
    expect(result.current.muted).toBe(true)
    act(() => {
      result.current.toggleMute()
    })
    expect(result.current.muted).toBe(false)
  })

  test('exposes playEat, playGameOver, playTurn functions', () => {
    const { result } = renderHook(() => useSound())
    expect(typeof result.current.playEat).toBe('function')
    expect(typeof result.current.playGameOver).toBe('function')
    expect(typeof result.current.playTurn).toBe('function')
  })

  test('playEat does not throw when unmuted', () => {
    const { result } = renderHook(() => useSound())
    expect(() => result.current.playEat()).not.toThrow()
  })

  test('playGameOver does not throw when unmuted', () => {
    const { result } = renderHook(() => useSound())
    expect(() => result.current.playGameOver()).not.toThrow()
  })

  test('playTurn does not throw when unmuted', () => {
    const { result } = renderHook(() => useSound())
    expect(() => result.current.playTurn()).not.toThrow()
  })

  test('sound functions do not throw when muted', () => {
    const { result } = renderHook(() => useSound())
    act(() => {
      result.current.toggleMute()
    })
    expect(result.current.muted).toBe(true)
    expect(() => result.current.playEat()).not.toThrow()
    expect(() => result.current.playGameOver()).not.toThrow()
    expect(() => result.current.playTurn()).not.toThrow()
  })
})
