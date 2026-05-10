import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

describe('Theme Toggle Feature', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  test('displays theme toggle button on initial render', () => {
    render(<App />)
    const toggleBtn = screen.getByLabelText('切换主题')
    expect(toggleBtn).toBeTruthy()
  })

  test('defaults to dark theme when no stored preference', () => {
    render(<App />)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  test('loads light theme from localStorage', () => {
    localStorage.setItem('snakeTheme', 'light')
    render(<App />)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  test('loads dark theme from localStorage', () => {
    localStorage.setItem('snakeTheme', 'dark')
    render(<App />)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  test('toggles from dark to light on click', () => {
    render(<App />)
    const toggleBtn = screen.getByLabelText('切换主题')
    fireEvent.click(toggleBtn)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(localStorage.getItem('snakeTheme')).toBe('light')
  })

  test('toggles back to dark on second click', () => {
    render(<App />)
    const toggleBtn = screen.getByLabelText('切换主题')
    fireEvent.click(toggleBtn)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    fireEvent.click(toggleBtn)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem('snakeTheme')).toBe('dark')
  })

  test('persists theme preference across remounts', () => {
    localStorage.setItem('snakeTheme', 'light')
    const { unmount } = render(<App />)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    unmount()

    render(<App />)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  test('toggle button shows correct icon for current theme', () => {
    render(<App />)
    const toggleBtn = screen.getByLabelText('切换主题')
    // dark theme shows sun icon
    expect(toggleBtn.textContent).toBe('☀️')
    fireEvent.click(toggleBtn)
    // light theme shows moon icon
    expect(toggleBtn.textContent).toBe('🌙')
  })

  test('theme toggle does not interfere with game state', () => {
    render(<App />)
    expect(screen.getByText(/分数: 0/)).toBeTruthy()
    const toggleBtn = screen.getByLabelText('切换主题')
    fireEvent.click(toggleBtn)
    // Game state should remain unchanged after theme toggle
    expect(screen.getByText(/分数: 0/)).toBeTruthy()
  })
})
