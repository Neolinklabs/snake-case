import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import Leaderboard from './Leaderboard'

describe('Leaderboard', () => {
  it('renders empty state when no entries', () => {
    render(<Leaderboard entries={[]} onBack={() => {}} />)
    expect(screen.getByText('暂无记录')).toBeInTheDocument()
  })

  it('renders ranked entries with names and scores', () => {
    const entries = [
      { name: 'Alice', score: 200, date: 1 },
      { name: 'Bob', score: 100, date: 2 },
    ]
    render(<Leaderboard entries={entries} onBack={() => {}} />)

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('calls onBack when clicking return button', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<Leaderboard entries={[]} onBack={onBack} />)

    await user.click(screen.getByText('返回游戏'))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('displays correct rank numbers', () => {
    const entries = [
      { name: 'A', score: 300, date: 1 },
      { name: 'B', score: 200, date: 2 },
      { name: 'C', score: 100, date: 3 },
    ]
    render(<Leaderboard entries={entries} onBack={() => {}} />)

    const ranks = screen.getAllByText(/^[1-3]$/)
    expect(ranks).toHaveLength(3)
  })
})
