import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

describe('Sound mute button', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('renders mute button on initial load', () => {
    render(<App />)
    const muteBtn = screen.getByRole('button', { name: /🔊/ })
    expect(muteBtn).toBeTruthy()
  })

  test('toggles to muted state on click', () => {
    render(<App />)
    const muteBtn = screen.getByRole('button', { name: /🔊/ })
    fireEvent.click(muteBtn)
    expect(screen.getByRole('button', { name: /🔇/ })).toBeTruthy()
  })

  test('toggles back to unmuted on second click', () => {
    render(<App />)
    const muteBtn = screen.getByRole('button', { name: /🔊/ })
    fireEvent.click(muteBtn)
    const mutedBtn = screen.getByRole('button', { name: /🔇/ })
    fireEvent.click(mutedBtn)
    expect(screen.getByRole('button', { name: /🔊/ })).toBeTruthy()
  })
})
