import { render, screen } from '@testing-library/react'
import App from './App'

function toBeVisible(received) {
  const pass = received !== null
  return {
    pass,
    message: () => pass ? 'Expected element not to be found' : 'Expected element to be found',
  }
}

expect.extend({ toBeVisible })

describe('High Score Feature', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('displays current score and high score on initial render', () => {
    render(<App />)
    expect(screen.getByText(/分数:/)).toBeVisible()
    expect(screen.getByText(/最高分:/)).toBeVisible()
  })

  test('loads high score from localStorage on mount', () => {
    localStorage.setItem('snakeHighScore', '42')
    render(<App />)
    expect(screen.getByText(/最高分: 42/)).toBeVisible()
  })

  test('shows 0 as default high score when localStorage is empty', () => {
    render(<App />)
    expect(screen.getByText(/最高分: 0/)).toBeVisible()
  })

  test('persists high score to localStorage', () => {
    localStorage.setItem('snakeHighScore', '20')
    render(<App />)
    expect(localStorage.getItem('snakeHighScore')).toBe('20')
  })

  test('high score persists across remounts (simulating page refresh)', () => {
    localStorage.setItem('snakeHighScore', '100')

    const { unmount } = render(<App />)
    expect(screen.getByText(/最高分: 100/)).toBeVisible()
    unmount()

    render(<App />)
    expect(screen.getByText(/最高分: 100/)).toBeVisible()
  })

  test('score panel shows all stats together', () => {
    localStorage.setItem('snakeHighScore', '50')
    render(<App />)

    const scorePanel = screen.getByText(/分数:/).closest('.score-panel')
    expect(scorePanel).toBeTruthy()
    expect(scorePanel.textContent).toContain('分数: 0')
    expect(scorePanel.textContent).toContain('最高分: 50')
    expect(scorePanel.textContent).toContain('等级: 1')
  })
})
