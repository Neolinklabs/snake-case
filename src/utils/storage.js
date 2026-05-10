const LEADERBOARD_KEY = 'snakeLeaderboard'
const MAX_ENTRIES = 10

export function getLeaderboard() {
  try {
    const data = JSON.parse(localStorage.getItem(LEADERBOARD_KEY))
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function addToLeaderboard(name, score) {
  const list = getLeaderboard()
  list.push({ name, score, date: new Date().toLocaleDateString('zh-CN') })
  list.sort((a, b) => b.score - a.score)
  const trimmed = list.slice(0, MAX_ENTRIES)
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmed))
  return trimmed.findIndex((e) => e.name === name && e.score === score && e.date === trimmed.find((t) => t.name === name && t.score === score).date)
}

export function isTop10(score) {
  const list = getLeaderboard()
  if (list.length < MAX_ENTRIES) return true
  return score > list[list.length - 1].score
}
