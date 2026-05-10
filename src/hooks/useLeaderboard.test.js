import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useLeaderboard } from './useLeaderboard'

describe('useLeaderboard', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns empty entries initially', () => {
    const { result } = renderHook(() => useLeaderboard())
    expect(result.current.entries).toEqual([])
  })

  it('adds an entry and sorts by score descending', () => {
    const { result } = renderHook(() => useLeaderboard())

    act(() => {
      result.current.addEntry('Alice', 100)
    })
    act(() => {
      result.current.addEntry('Bob', 200)
    })

    expect(result.current.entries).toHaveLength(2)
    expect(result.current.entries[0].name).toBe('Bob')
    expect(result.current.entries[1].name).toBe('Alice')
  })

  it('keeps only top 10 entries', () => {
    const { result } = renderHook(() => useLeaderboard())

    for (let i = 0; i < 12; i++) {
      act(() => {
        result.current.addEntry(`Player${i}`, (i + 1) * 10)
      })
    }

    expect(result.current.entries).toHaveLength(10)
    expect(result.current.entries[0].score).toBe(120)
    expect(result.current.entries[9].score).toBe(30)
  })

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useLeaderboard())
    act(() => {
      result.current.addEntry('Alice', 100)
    })

    const stored = JSON.parse(localStorage.getItem('snakeLeaderboard'))
    expect(stored).toHaveLength(1)
    expect(stored[0].name).toBe('Alice')
  })

  describe('isTop10', () => {
    it('returns true for any positive score when fewer than 10 entries', () => {
      const { result } = renderHook(() => useLeaderboard())
      expect(result.current.isTop10(10)).toBe(true)
    })

    it('returns false for score of 0', () => {
      const { result } = renderHook(() => useLeaderboard())
      expect(result.current.isTop10(0)).toBe(false)
    })

    it('returns true when score beats the 10th entry', () => {
      const { result } = renderHook(() => useLeaderboard())

      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.addEntry(`P${i}`, (i + 1) * 10)
        })
      }

      expect(result.current.isTop10(105)).toBe(true)
      expect(result.current.isTop10(5)).toBe(false)
    })
  })

  it('loads existing entries from localStorage', () => {
    localStorage.setItem('snakeLeaderboard', JSON.stringify([
      { name: 'Existing', score: 50, date: 1000 },
    ]))

    const { result } = renderHook(() => useLeaderboard())
    expect(result.current.entries).toHaveLength(1)
    expect(result.current.entries[0].name).toBe('Existing')
  })

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('snakeLeaderboard', 'not-json')
    const { result } = renderHook(() => useLeaderboard())
    expect(result.current.entries).toEqual([])
  })
})
