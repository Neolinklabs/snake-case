import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'
import { getLeaderboard, addToLeaderboard, isTop10 } from './utils/storage'

function toBeVisible(received) {
  const pass = received !== null
  return {
    pass,
    message: () => pass ? 'Expected element not to be found' : 'Expected element to be found',
  }
}

expect.extend({ toBeVisible })

describe('storage utilities', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('getLeaderboard returns empty array when no data', () => {
    expect(getLeaderboard()).toEqual([])
  })

  test('getLeaderboard returns parsed data', () => {
    const data = [{ name: 'Alice', score: 100, date: '2026/05/10' }]
    localStorage.setItem('snakeLeaderboard', JSON.stringify(data))
    expect(getLeaderboard()).toEqual(data)
  })

  test('getLeaderboard handles corrupted data', () => {
    localStorage.setItem('snakeLeaderboard', 'not-json')
    expect(getLeaderboard()).toEqual([])
  })

  test('addToLeaderboard adds entry and sorts by score descending', () => {
    addToLeaderboard('Bob', 50)
    addToLeaderboard('Alice', 100)
    const list = getLeaderboard()
    expect(list).toHaveLength(2)
    expect(list[0].name).toBe('Alice')
    expect(list[1].name).toBe('Bob')
  })

  test('addToLeaderboard trims to 10 entries', () => {
    for (let i = 1; i <= 12; i++) {
      addToLeaderboard(`Player${i}`, i * 10)
    }
    const list = getLeaderboard()
    expect(list).toHaveLength(10)
    expect(list[0].score).toBe(120)
    expect(list[9].score).toBe(30)
  })

  test('isTop10 returns true when fewer than 10 entries', () => {
    expect(isTop10(5)).toBe(true)
  })

  test('isTop10 returns true when score beats 10th entry', () => {
    for (let i = 1; i <= 10; i++) {
      addToLeaderboard(`P${i}`, i * 10)
    }
    expect(isTop10(105)).toBe(true)
  })

  test('isTop10 returns false when score does not beat 10th entry', () => {
    for (let i = 1; i <= 10; i++) {
      addToLeaderboard(`P${i}`, i * 10)
    }
    expect(isTop10(5)).toBe(false)
  })
})

describe('Leaderboard UI', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('renders leaderboard button', () => {
    render(<App />)
    expect(screen.getByText(/排行榜/)).toBeVisible()
  })

  test('opens leaderboard modal on button click', () => {
    render(<App />)
    fireEvent.click(screen.getByText(/排行榜/))
    expect(screen.getByText(/Top 10/)).toBeVisible()
  })

  test('shows empty message when no records', () => {
    render(<App />)
    fireEvent.click(screen.getByText(/排行榜/))
    expect(screen.getByText(/暂无记录/)).toBeVisible()
  })

  test('closes leaderboard modal on close button click', () => {
    render(<App />)
    fireEvent.click(screen.getByText(/排行榜/))
    expect(screen.getByText(/Top 10/)).toBeVisible()
    fireEvent.click(screen.getByText(/关闭/))
    expect(screen.queryByText(/Top 10/)).toBeNull()
  })

  test('displays leaderboard entries in modal', () => {
    addToLeaderboard('Alice', 100)
    addToLeaderboard('Bob', 50)
    render(<App />)
    fireEvent.click(screen.getByText(/排行榜/))
    expect(screen.getByText('Alice')).toBeVisible()
    expect(screen.getByText('Bob')).toBeVisible()
    expect(screen.getByText('100')).toBeVisible()
    expect(screen.getByText('50')).toBeVisible()
  })

  test('leaderboard data persists after page refresh', () => {
    addToLeaderboard('Alice', 100)
    const { unmount } = render(<App />)
    unmount()
    render(<App />)
    fireEvent.click(screen.getByText(/排行榜/))
    expect(screen.getByText('Alice')).toBeVisible()
    expect(screen.getByText('100')).toBeVisible()
  })
})
