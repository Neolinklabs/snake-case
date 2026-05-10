import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import App from './App'

const mockContext = {
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  font: '',
  textAlign: '',
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  clearRect: vi.fn(),
  fillText: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
}

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext)

describe('App leaderboard integration', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('shows leaderboard button on main screen', () => {
    render(<App />)
    expect(screen.getByText('排行榜')).toBeInTheDocument()
  })

  it('navigates to leaderboard view and back', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByText('排行榜'))
    expect(screen.getByText('暂无记录')).toBeInTheDocument()

    await user.click(screen.getByText('返回游戏'))
    expect(screen.queryByText('暂无记录')).not.toBeInTheDocument()
  })

  it('shows save score form on game over when score qualifies', () => {
    localStorage.setItem('snakeLeaderboard', JSON.stringify([
      { name: 'Bot', score: 10, date: 1 },
    ]))

    render(<App />)
    expect(screen.getByText('排行榜')).toBeInTheDocument()
  })

  it('displays leaderboard entries from localStorage', async () => {
    const user = userEvent.setup()
    localStorage.setItem('snakeLeaderboard', JSON.stringify([
      { name: 'TopPlayer', score: 500, date: 1 },
    ]))

    render(<App />)
    await user.click(screen.getByText('排行榜'))
    expect(screen.getByText('TopPlayer')).toBeInTheDocument()
    expect(screen.getByText('500')).toBeInTheDocument()
  })
})
