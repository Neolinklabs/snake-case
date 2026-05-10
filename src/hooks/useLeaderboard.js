import { useState, useCallback } from 'react'

const STORAGE_KEY = 'snakeLeaderboard'
const MAX_ENTRIES = 10

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function useLeaderboard() {
  const [entries, setEntries] = useState(loadEntries)

  const isTop10 = useCallback((score) => {
    if (entries.length < MAX_ENTRIES) return score > 0
    return score > entries[entries.length - 1].score
  }, [entries])

  const addEntry = useCallback((name, score) => {
    const updated = [...entries, { name, score, date: Date.now() }]
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ENTRIES)
    saveEntries(updated)
    setEntries(updated)
  }, [entries])

  return { entries, isTop10, addEntry }
}
